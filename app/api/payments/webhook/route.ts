import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/paystack";
import { confirmPaymentAndActivate } from "@/lib/confirmPayment";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  const validSignature = await verifyWebhookSignature(rawBody, signature);
  if (!validSignature) {
    // Never trust an unsigned or incorrectly-signed webhook — this is the
    // difference between "a real payment happened" and "anyone on the
    // internet can grant themselves a free subscription."
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true }); // ignore events we don't act on
  }

  const result = await confirmPaymentAndActivate(event.data.reference as string);
  return NextResponse.json({ received: true, result });
}
