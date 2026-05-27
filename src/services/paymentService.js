const delay = (ms) => new Promise(r => setTimeout(r, ms))

export const paymentService = {
  async processPayment(orderId, paymentDetails) {
    await delay(1200)
    console.log(`[mock] processing payment for order ${orderId}`)
    return {
      success: true,
      receiptId: `rcpt-${Date.now()}`,
      barcodeData: `GAUCHO-${orderId}-${Date.now()}`,
    }
  },

  async issueRefund(orderId) {
    await delay(800)
    console.log(`[mock] refund issued for order ${orderId}`)
    return { success: true }
  },

  async bulkRefund(orderIds) {
    await delay(1000)
    console.log(`[mock] bulk refund for ${orderIds.length} orders`)
    return { success: true, refunded: orderIds.length }
  },

  async getReceipt(orderId) {
    await delay(400)
    return {
      orderId,
      receiptId: `rcpt-${orderId}`,
      barcodeData: `GAUCHO-${orderId}`,
      issuedAt: new Date().toISOString(),
    }
  },

  async confirmDelivery(orderId) {
    await delay(500)
    console.log(`[mock] delivery confirmed for order ${orderId}`)
    return { success: true }
  },
}
