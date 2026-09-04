import { Batch, Order, Receipt, Session, Shipment, Notification, WaitingListEntry } from '../types'

// Mock data
const mockBatches: Batch[] = [
  {
    id: 'batch-001',
    name: '2026-001',
    meatType: 'Ribeye, 250 g bøffer',
    description: 'Estancia La Cumbre · Córdoba · græsfodret, mørnet 21 dage',
    status: 'WAITING_TO_FILL',
    pricePerKg: 149,
    targetKilos: 500,
    soldKilos: 315,
    customerCount: 24,
    origin: {
      farm: 'Estancia La Cumbre',
      region: 'Córdoba',
      country: 'Argentina',
      coords: '34.6°S · 64.3°W'
    },
    comparePricePerKg: 299,
    compareRetailer: 'Føtex',
    savingsPercent: 50
  },
  {
    id: 'batch-002',
    name: '2026-002',
    meatType: 'Bife de Chorizo, 350g',
    description: 'Premium cut from grass-fed cattle',
    status: 'ORDERED',
    pricePerKg: 189,
    targetKilos: 400,
    soldKilos: 380,
    customerCount: 18,
    origin: {
      farm: 'Estancia Del Rio',
      region: 'Buenos Aires',
      country: 'Argentina',
      coords: '35.1°S · 63.5°W'
    }
  },
  {
    id: 'batch-003',
    name: '2026-003',
    meatType: 'Brisket',
    description: 'Slow-cooked perfection',
    status: 'WAITING_TO_FILL',
    pricePerKg: 79,
    targetKilos: 300,
    soldKilos: 150,
    customerCount: 12,
    origin: {
      farm: 'Estancia Victoria',
      region: 'La Pampa',
      country: 'Argentina',
      coords: '36.5°S · 65.1°W'
    }
  }
]

const mockOrders: Map<string, Order[]> = new Map()
const mockReceipts: Map<string, Receipt> = new Map()
const mockShipments: Map<string, Shipment> = new Map()
const mockNotifications: Map<string, Notification[]> = new Map()
const mockWaitingLists: Map<string, WaitingListEntry[]> = new Map()

// Simulate storage
let sessions: Map<string, Session> = new Map()

export const mockApi = {
  // Auth
  async requestLoginCode(email: string): Promise<{ success: boolean }> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    return { success: true }
  },

  async verifyLoginCode(email: string, code: string): Promise<{ success: boolean; session?: Session; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Mock: any 6-digit code works, but "000000" fails
    if (code === '000000') {
      return { success: false, error: 'Invalid code' }
    }

    const session: Session = {
      email,
      role: email.includes('admin') ? 'admin' : 'user'
    }
    sessions.set(email, session)
    return { success: true, session }
  },

  async logout(email: string): Promise<{ success: boolean }> {
    sessions.delete(email)
    return { success: true }
  },

  // Batches
  async getBatches(): Promise<Batch[]> {
    await new Promise(resolve => setTimeout(resolve, 800))
    return mockBatches
  },

  async getBatchById(id: string): Promise<Batch | null> {
    await new Promise(resolve => setTimeout(resolve, 600))
    return mockBatches.find(b => b.id === id) || null
  },

  // Orders
  async createOrder(batchId: string, email: string, kilos: number): Promise<Order> {
    await new Promise(resolve => setTimeout(resolve, 1200))

    const batch = mockBatches.find(b => b.id === batchId)
    if (!batch) throw new Error('Batch not found')

    const order: Order = {
      id: `ord-${Date.now()}`,
      batchId,
      userEmail: email,
      kilos,
      amount: kilos * batch.pricePerKg,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    }

    if (!mockOrders.has(email)) {
      mockOrders.set(email, [])
    }
    mockOrders.get(email)!.push(order)

    return order
  },

  async getOrderByBatchAndUser(batchId: string, email: string): Promise<Order | null> {
    await new Promise(resolve => setTimeout(resolve, 400))
    const userOrders = mockOrders.get(email) || []
    return userOrders.find(o => o.batchId === batchId) || null
  },

  async getUserOrders(email: string): Promise<Order[]> {
    await new Promise(resolve => setTimeout(resolve, 600))
    return mockOrders.get(email) || []
  },

  async cancelOrder(orderId: string): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 800))

    for (const orders of mockOrders.values()) {
      const order = orders.find(o => o.id === orderId)
      if (order) {
        order.status = 'CANCELLED'
        return { success: true }
      }
    }

    return { success: false }
  },

  // Payments
  async processPayment(orderId: string): Promise<{ success: boolean; receiptId?: string }> {
    await new Promise(resolve => setTimeout(resolve, 2000))

    const receiptId = `rcpt-${Date.now()}`

    // Find and update order
    for (const orders of mockOrders.values()) {
      const order = orders.find(o => o.id === orderId)
      if (order) {
        order.status = 'PAID'
        order.receiptId = receiptId

        // Create receipt
        const receipt: Receipt = {
          receiptId,
          orderId,
          kilos: order.kilos,
          amount: order.amount,
          barcodeData: `${orderId}|${Date.now()}`
        }
        mockReceipts.set(receiptId, receipt)

        return { success: true, receiptId }
      }
    }

    return { success: false }
  },

  // Keyed by receiptId, which is what both callers hold: checkout navigates
  // with the id processPayment returned, and order history with order.receiptId.
  async getReceipt(receiptId: string): Promise<Receipt | null> {
    await new Promise(resolve => setTimeout(resolve, 400))

    return mockReceipts.get(receiptId) ?? null
  },

  async getReceiptByOrder(orderId: string): Promise<Receipt | null> {
    await new Promise(resolve => setTimeout(resolve, 400))

    for (const receipt of mockReceipts.values()) {
      if (receipt.orderId === orderId) {
        return receipt
      }
    }

    return null
  },

  // Admin
  async createBatch(batch: Omit<Batch, 'id'>): Promise<Batch> {
    await new Promise(resolve => setTimeout(resolve, 1000))

    const newBatch: Batch = {
      ...batch,
      id: `batch-${Date.now()}`
    }
    mockBatches.push(newBatch)
    return newBatch
  },

  async updateBatch(id: string, updates: Partial<Batch>): Promise<Batch | null> {
    await new Promise(resolve => setTimeout(resolve, 1000))

    const batch = mockBatches.find(b => b.id === id)
    if (!batch) return null

    Object.assign(batch, updates)
    return batch
  },

  async deleteBatch(id: string): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 800))

    const index = mockBatches.findIndex(b => b.id === id)
    if (index === -1) return { success: false }

    mockBatches.splice(index, 1)
    return { success: true }
  },

  async getAllOrders(): Promise<Order[]> {
    await new Promise(resolve => setTimeout(resolve, 600))

    const allOrders: Order[] = []
    for (const orders of mockOrders.values()) {
      allOrders.push(...orders)
    }
    return allOrders
  },

  // Shipment Tracking
  async getShipmentStatus(shipmentId: string): Promise<Shipment | null> {
    await new Promise(resolve => setTimeout(resolve, 400))
    return mockShipments.get(shipmentId) || null
  },

  async getShipmentETA(shipmentId: string): Promise<string | null> {
    await new Promise(resolve => setTimeout(resolve, 300))
    const shipment = mockShipments.get(shipmentId)
    return shipment?.eta || null
  },

  async updateBatchStatus(batchId: string, status: string, shipmentDetails?: Partial<Shipment>): Promise<Batch | null> {
    await new Promise(resolve => setTimeout(resolve, 800))

    const batch = mockBatches.find(b => b.id === batchId)
    if (!batch) return null

    batch.status = status as any

    // Create or update shipment if provided
    if (shipmentDetails && (status === 'IN_TRANSIT' || status === 'AT_CUSTOMS')) {
      const shipmentId = `ship-${batchId}-${Date.now()}`
      const shipment: Shipment = {
        id: shipmentId,
        batchId,
        status: status === 'AT_CUSTOMS' ? 'AT_CUSTOMS' : 'IN_TRANSIT',
        eta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...shipmentDetails
      }
      mockShipments.set(shipmentId, shipment)
      batch.shipmentId = shipmentId

      // Trigger notifications
      const userEmails = new Set<string>()
      const orders = mockOrders.get(batch.id) || []
      for (const order of orders) {
        userEmails.add(order.userEmail)
      }

      for (const email of userEmails) {
        this.triggerNotification(email, batchId,
          status === 'ORDERED' ? 'ORDERED' :
          status === 'IN_TRANSIT' ? 'IN_TRANSIT' :
          'AT_CUSTOMS'
        )
      }
    }

    return batch
  },

  // Notifications
  async getNotifications(email: string): Promise<Notification[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockNotifications.get(email) || []
  },

  async markNotificationRead(notificationId: string): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 200))

    for (const notifications of mockNotifications.values()) {
      const notif = notifications.find(n => n.id === notificationId)
      if (notif) {
        notif.status = 'READ'
        return { success: true }
      }
    }
    return { success: false }
  },

  async triggerNotification(email: string, batchId: string, type: string, message?: string): Promise<Notification> {
    const notification: Notification = {
      id: `notif-${Date.now()}`,
      email,
      batchId,
      type: type as any,
      status: 'UNREAD',
      message: message || `Batch ${batchId} update: ${type}`,
      createdAt: new Date().toISOString()
    }

    if (!mockNotifications.has(email)) {
      mockNotifications.set(email, [])
    }
    mockNotifications.get(email)!.push(notification)

    return notification
  },

  // Waiting List
  async addToWaitingList(batchId: string, email: string): Promise<WaitingListEntry> {
    await new Promise(resolve => setTimeout(resolve, 600))

    if (!mockWaitingLists.has(batchId)) {
      mockWaitingLists.set(batchId, [])
    }

    const waitingList = mockWaitingLists.get(batchId)!
    const position = waitingList.length + 1

    const entry: WaitingListEntry = {
      id: `wait-${batchId}-${email}-${Date.now()}`,
      batchId,
      email,
      position,
      addedAt: new Date().toISOString()
    }

    waitingList.push(entry)
    return entry
  },

  async getWaitingList(batchId: string): Promise<WaitingListEntry[]> {
    await new Promise(resolve => setTimeout(resolve, 400))
    return mockWaitingLists.get(batchId) || []
  },

  async isInWaitingList(batchId: string, email: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 300))
    const waitingList = mockWaitingLists.get(batchId) || []
    return waitingList.some(e => e.email === email)
  },

  async assignFromWaitingList(batchId: string): Promise<WaitingListEntry | null> {
    await new Promise(resolve => setTimeout(resolve, 500))

    const waitingList = mockWaitingLists.get(batchId)
    if (!waitingList || waitingList.length === 0) return null

    const entry = waitingList.shift()!

    // Notify the person
    if (entry) {
      await this.triggerNotification(entry.email, batchId, 'WAITING_LIST_AVAILABLE',
        'A slot has opened up in this batch!')
    }

    return entry
  },

  // Payment & Refunds
  async issueRefund(orderId: string): Promise<{ success: boolean; amount?: number }> {
    await new Promise(resolve => setTimeout(resolve, 1000))

    for (const orders of mockOrders.values()) {
      const order = orders.find(o => o.id === orderId)
      if (order) {
        const amount = order.amount
        order.status = 'CANCELLED'
        return { success: true, amount }
      }
    }

    return { success: false }
  },

  async bulkRefund(orderIds: string[]): Promise<{ success: boolean; refundedCount: number; totalAmount: number }> {
    await new Promise(resolve => setTimeout(resolve, 1500))

    let refundedCount = 0
    let totalAmount = 0

    for (const orderId of orderIds) {
      for (const orders of mockOrders.values()) {
        const order = orders.find(o => o.id === orderId)
        if (order && order.status !== 'CANCELLED') {
          totalAmount += order.amount
          order.status = 'CANCELLED'
          refundedCount++
          break
        }
      }
    }

    return { success: true, refundedCount, totalAmount }
  },

  async getRefundStatus(orderId: string): Promise<{ status: string; amount?: number } | null> {
    await new Promise(resolve => setTimeout(resolve, 300))

    for (const orders of mockOrders.values()) {
      const order = orders.find(o => o.id === orderId)
      if (order) {
        return { status: order.status, amount: order.amount }
      }
    }

    return null
  },

  // Barcode & Delivery Confirmation
  async generateBarcode(orderId: string): Promise<{ barcodeData: string; receiptId: string } | null> {
    await new Promise(resolve => setTimeout(resolve, 400))

    for (const orders of mockOrders.values()) {
      const order = orders.find(o => o.id === orderId)
      if (order && order.receiptId) {
        return {
          barcodeData: `${order.id}|${order.receiptId}|${Date.now()}`,
          receiptId: order.receiptId
        }
      }
    }

    return null
  },

  async confirmDelivery(orderId: string): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 500))

    for (const orders of mockOrders.values()) {
      const order = orders.find(o => o.id === orderId)
      if (order) {
        order.deliveryConfirmedAt = new Date().toISOString()
        return { success: true }
      }
    }

    return { success: false }
  },

  async validateBarcode(barcodeData: string): Promise<{ valid: boolean; orderId?: string }> {
    await new Promise(resolve => setTimeout(resolve, 300))

    // Simple validation: barcode should contain | separator
    if (!barcodeData.includes('|')) {
      return { valid: false }
    }

    const parts = barcodeData.split('|')
    if (parts.length < 2) {
      return { valid: false }
    }

    return { valid: true, orderId: parts[0] }
  },

  // Batch History & Analytics
  async getCompletedBatches(): Promise<Batch[]> {
    await new Promise(resolve => setTimeout(resolve, 600))
    return mockBatches.filter(b => b.status === 'COMPLETED')
  },

  async getBatchAnalytics(batchId: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 500))

    const batch = mockBatches.find(b => b.id === batchId)
    if (!batch) return null

    const orders = mockOrders.get(batchId) || []
    const paidOrders = orders.filter(o => o.status === 'PAID')
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.amount, 0)

    return {
      batchId,
      meatType: batch.meatType,
      status: batch.status,
      totalCustomers: batch.customerCount,
      paidCustomers: paidOrders.length,
      soldKilos: batch.soldKilos,
      targetKilos: batch.targetKilos,
      totalRevenue,
      averageOrderSize: paidOrders.length > 0 ? batch.soldKilos / paidOrders.length : 0
    }
  }
}
