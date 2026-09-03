import { Batch, Order, Receipt, Session } from '../types'

// Mock data
const mockBatches: Batch[] = [
  {
    id: 'batch-001',
    name: 'BATCH ÅØ001',
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
    name: 'BATCH ÅØ002',
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
    name: 'BATCH ÅØ003',
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

  async getReceipt(orderId: string): Promise<Receipt | null> {
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
  }
}
