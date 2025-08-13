export type PaymentLink = { id: string; url: string; provider?: string }

export async function createPaymentLink(_order: any): Promise<PaymentLink | null> {
  const id = process.env.RAZORPAY_KEY_ID
  const secret = process.env.RAZORPAY_KEY_SECRET
  if (!id || !secret) {
    console.warn("[payments] Razorpay env missing, not creating link")
    return null
  }
  // Placeholder implementation; integrate with provider later
  return null
}
