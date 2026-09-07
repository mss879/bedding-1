"use client";

import { useEffect } from "react";
import { useCart } from "./CartContext";

/**
 * Empties the basket once the order-confirmed page renders.
 *
 * Card orders keep their basket right through the redirect to the gateway, so
 * that a declined or abandoned payment leaves the shopper something to retry
 * with. Clearing therefore happens here — the one page that only renders after
 * an order is actually confirmed — rather than at submit.
 */
export function ClearCartOnMount() {
  const { clearCart } = useCart();
  useEffect(() => {
    clearCart();
  }, [clearCart]);
  return null;
}
