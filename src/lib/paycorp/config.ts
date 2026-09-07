/**
 * Paycorp (Commercial Bank of Ceylon IPG) credentials and money handling.
 *
 * SERVER ONLY. None of these names are NEXT_PUBLIC_, so importing this from a
 * client component would silently hand back `undefined` and disable payments —
 * import it from server actions and route handlers only.
 */

export type PaycorpConfig = {
  endpoint: string;
  /** Numeric merchant profile id. Paycorp types this as an integer. */
  clientId: number;
  authToken: string;
  hmacSecret: string;
  /** ISO-4217 alpha code the merchant profile settles in. */
  currency: string;
  /** USD → settlement-currency rate, applied only when they differ. */
  usdRate: number;
  /** Dry-run switch Paycorp honours on every operation. Never on in prod. */
  validateOnly: boolean;
};

/**
 * Conversion is a no-op on the current profile: the catalogue is priced in USD
 * and the merchant profile settles in USD, so the rate is 1.
 *
 * The bank labelled these credentials "Client ID 01 (LKR)", but the gateway
 * rejects LKR on them outright — `REQUEST_NOT_VALID: Invalid currency code` —
 * and accepts USD. Trust the gateway, not the label.
 *
 * The hook stays because a second merchant profile in another currency is a
 * live possibility. If one arrives, a FIXED rate is still the right shape: a
 * shopper must be charged the number the checkout showed them, and a mid-session
 * FX move would break that.
 */
const DEFAULT_USD_RATE = 1;

function parsePositiveNumber(raw: string | undefined, fallback: number) {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/**
 * Returns null until every credential is present, which is what keeps the card
 * option off the checkout instead of offering a button that dead-ends.
 */
export function getPaycorpConfig(): PaycorpConfig | null {
  const endpoint = process.env.PAYCORP_ENDPOINT?.trim();
  const clientIdRaw = process.env.PAYCORP_CLIENT_ID?.trim();
  const authToken = process.env.PAYCORP_AUTH_TOKEN?.trim();
  const hmacSecret = process.env.PAYCORP_HMAC_SECRET?.trim();

  if (!endpoint || !clientIdRaw || !authToken || !hmacSecret) return null;
  if (!/^https:\/\//i.test(endpoint)) return null;

  const clientId = Number(clientIdRaw);
  if (!Number.isInteger(clientId) || clientId <= 0) return null;

  return {
    endpoint,
    clientId,
    authToken,
    hmacSecret,
    currency: (process.env.PAYCORP_CURRENCY?.trim() || "USD").toUpperCase(),
    usdRate: parsePositiveNumber(process.env.PAYCORP_USD_RATE, DEFAULT_USD_RATE),
    // Opt-in, and only ever by an explicit "true" — a typo must not silently
    // turn every live payment into a validation no-op.
    validateOnly: process.env.PAYCORP_VALIDATE_ONLY?.trim().toLowerCase() === "true",
  };
}

export function isPaycorpConfigured() {
  return getPaycorpConfig() !== null;
}

/** A storefront (USD) total as an amount in the gateway's settlement currency.
 *  Identity while the profile settles in USD. */
export function toGatewayAmount(usdTotal: number, config: PaycorpConfig) {
  const converted = config.currency === "USD" ? usdTotal : usdTotal * config.usdRate;
  // Round to the currency's major unit before the minor-unit conversion, so the
  // figure we charge is the same one we can show and reconcile against.
  return Math.round(converted * 100) / 100;
}

/** Paycorp takes amounts in minor units (cents), as an integer. */
export function toMinorUnits(amount: number) {
  return Math.round(amount * 100);
}

export function fromMinorUnits(minor: number) {
  return Math.round(minor) / 100;
}
