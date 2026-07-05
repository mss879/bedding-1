import { cookies } from "next/headers";
import { ADMIN_COOKIE, isValidAdminToken } from "./session";

/** True when the current request carries a valid admin session cookie. */
export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return isValidAdminToken(store.get(ADMIN_COOKIE)?.value);
}
