import { createHmac, randomUUID } from "node:crypto";
import { getPaycorpConfig, toMinorUnits, type PaycorpConfig } from "./config";

/**
 * Paycorp REST proxy client — the redirect ("hosted payment page") flow.
 *
 *   PAYMENT_INIT     → { reqid, paymentPageUrl, expireAt }; send the shopper to
 *                      paymentPageUrl and Paycorp returns them to returnUrl
 *                      with ?reqid=… appended.
 *   PAYMENT_COMPLETE → the authoritative outcome for that reqid. This is the
 *                      only thing that decides whether an order is paid; the
 *                      browser never carries the result.
 *
 * Transport, verbatim from the bank's SDK: POST the JSON envelope with
 *   HMAC:      hex HMAC-SHA256 of the raw request body, keyed by the secret
 *   AUTHTOKEN: the auth token
 * The signature covers the exact bytes on the wire, so the body is serialised
 * once and both hashed and sent — never re-stringified in between.
 */

const PAYCORP_VERSION = "1.04";
const REQUEST_TIMEOUT_MS = 45_000;

/** Paycorp's "approved" response code. Everything else is a decline. */
export const PAYCORP_APPROVED = "00";

type Operation = "PAYMENT_INIT" | "PAYMENT_COMPLETE";

export type PaycorpFailure = {
  ok: false;
  /** Gateway short code where there is one, else a local marker. */
  code: string;
  message: string;
};

export type PaycorpInitSuccess = {
  ok: true;
  reqid: string;
  paymentPageUrl: string;
  expireAt: string | null;
};

export type PaycorpCompleteSuccess = {
  ok: true;
  approved: boolean;
  responseCode: string;
  responseText: string;
  txnReference: string | null;
  authCode: string | null;
  clientRef: string | null;
  cardType: string | null;
  cardMasked: string | null;
  /** Minor units, as returned by the gateway. */
  paymentAmountMinor: number | null;
  currency: string | null;
};

/**
 * The signature is computed over UTF-8 bytes, and the bank's own SDK hashes a
 * latin1 transcoding of the body — the two agree only for ASCII. Free-text we
 * pass through (order references, comments) is therefore folded to ASCII rather
 * than trusted to round-trip.
 */
function asciiOnly(value: string, maxLength: number) {
  return value
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

/** `Y-m-d H:i:s` in the merchant's timezone, independent of the host's TZ. */
function requestDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`;
}

function signature(body: string, secret: string) {
  return createHmac("sha256", secret).update(body, "utf8").digest("hex");
}

type Envelope = {
  version: string;
  msgId: string;
  operation: Operation;
  requestDate: string;
  validateOnly: boolean;
  requestData: Record<string, unknown>;
};

async function send(
  config: PaycorpConfig,
  operation: Operation,
  requestData: Record<string, unknown>,
): Promise<{ ok: true; data: Record<string, unknown> } | PaycorpFailure> {
  const envelope: Envelope = {
    version: PAYCORP_VERSION,
    msgId: randomUUID(),
    operation,
    requestDate: requestDate(),
    validateOnly: config.validateOnly,
    requestData,
  };
  const body = JSON.stringify(envelope);

  let response: Response;
  try {
    response = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        HMAC: signature(body, config.hmacSecret),
        AUTHTOKEN: config.authToken,
      },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    return { ok: false, code: "NETWORK", message: "We couldn't reach the payment gateway." };
  }

  const text = await response.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    // A 401 here is an HTML error page: bad AUTHTOKEN, or an HMAC computed over
    // anything other than the exact bytes posted.
    return {
      ok: false,
      code: response.status === 401 ? "AUTH" : `HTTP_${response.status}`,
      message:
        response.status === 401
          ? "The payment gateway rejected our credentials."
          : "The payment gateway returned an unexpected response.",
    };
  }

  const envelopeOut = parsed as { error?: { code?: string; text?: string }; responseData?: unknown };
  if (envelopeOut.error) {
    return {
      ok: false,
      code: envelopeOut.error.code ?? "GATEWAY",
      message: envelopeOut.error.text ?? "The payment gateway rejected the request.",
    };
  }
  if (!envelopeOut.responseData || typeof envelopeOut.responseData !== "object") {
    return { ok: false, code: "MALFORMED", message: "The payment gateway returned no result." };
  }
  return { ok: true, data: envelopeOut.responseData as Record<string, unknown> };
}

function str(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

export type PaymentInitInput = {
  /** Storefront total already converted to the settlement currency. */
  amount: number;
  currency: string;
  returnUrl: string;
  cancelUrl?: string;
  /** Our order reference — echoed back on PAYMENT_COMPLETE. */
  clientRef?: string;
  comment?: string;
};

export async function paymentInit(
  input: PaymentInitInput,
): Promise<PaycorpInitSuccess | PaycorpFailure> {
  const config = getPaycorpConfig();
  if (!config) {
    return { ok: false, code: "UNCONFIGURED", message: "Card payments are not configured." };
  }

  const requestData: Record<string, unknown> = {
    clientId: config.clientId,
    transactionType: "PURCHASE",
    transactionAmount: {
      paymentAmount: toMinorUnits(input.amount),
      currency: input.currency,
    },
    redirect: {
      returnUrl: input.returnUrl,
      returnMethod: "GET",
      ...(input.cancelUrl ? { cancelUrl: input.cancelUrl } : {}),
    },
    // Paycorp's replay guard: a repeated msgId returns the original outcome
    // rather than charging twice. On by default in the bank's SDK.
    useReliability: true,
  };
  if (input.clientRef) requestData.clientRef = asciiOnly(input.clientRef, 32);
  if (input.comment) requestData.comment = asciiOnly(input.comment, 100);

  const result = await send(config, "PAYMENT_INIT", requestData);
  if (!result.ok) return result;

  const reqid = str(result.data.reqid);
  const paymentPageUrl = str(result.data.paymentPageUrl);
  if (!reqid || !paymentPageUrl) {
    return { ok: false, code: "MALFORMED", message: "The payment gateway returned no payment page." };
  }
  return { ok: true, reqid, paymentPageUrl, expireAt: str(result.data.expireAt) };
}

export async function paymentComplete(
  reqid: string,
): Promise<PaycorpCompleteSuccess | PaycorpFailure> {
  const config = getPaycorpConfig();
  if (!config) {
    return { ok: false, code: "UNCONFIGURED", message: "Card payments are not configured." };
  }

  const result = await send(config, "PAYMENT_COMPLETE", { clientId: config.clientId, reqid });
  if (!result.ok) return result;

  const data = result.data;
  const card = (data.creditCard ?? {}) as Record<string, unknown>;
  const amount = (data.transactionAmount ?? {}) as Record<string, unknown>;
  const responseCode = str(data.responseCode) ?? "";
  const paymentAmount = Number(amount.paymentAmount);

  return {
    ok: true,
    approved: responseCode === PAYCORP_APPROVED,
    responseCode,
    responseText: str(data.responseText) ?? "",
    txnReference: str(data.txnReference),
    authCode: str(data.authCode),
    clientRef: str(data.clientRef),
    cardType: str(card.type),
    cardMasked: str(card.number),
    paymentAmountMinor: Number.isFinite(paymentAmount) ? paymentAmount : null,
    currency: str(amount.currency),
  };
}
