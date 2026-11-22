import { redirect } from "next/navigation"

/** Legacy redirect: the original checkout success page now lives at /payment/success. */
export default function LegacyCheckoutSuccessPage() {
  redirect("/payment/success")
}
