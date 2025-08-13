export async function sendAdminNewOrderEmail(orderId: string, email: string) {
  log(`[mail] admin notified of new order ${orderId} from ${email}`)
}

export async function sendOrderReceivedEmail(email: string, orderId: string) {
  log(`[mail] user ${email} received order confirmation for ${orderId}`)
}

export async function sendOrderApprovedEmail(email: string, orderId: string, paymentLink?: string | null) {
  log(`[mail] order ${orderId} for ${email} approved${paymentLink ? ` with link ${paymentLink}` : ""}`)
}

export async function sendOrderRejectedEmail(email: string, orderId: string, note?: string) {
  log(`[mail] order ${orderId} for ${email} rejected${note ? `: ${note}` : ""}`)
}

function log(message: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn(message)
    return
  }
  // Real email implementation would go here
  console.log(message)
}
