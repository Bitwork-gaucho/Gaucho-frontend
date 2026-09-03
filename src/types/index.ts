export interface Batch {
  id: string
  name: string
  meatType: string
  description: string
  status: 'UPCOMING' | 'WAITING_TO_FILL' | 'ORDERED' | 'IN_TRANSIT' | 'ARRIVED' | 'READY_FOR_PICKUP' | 'COMPLETED'
  pricePerKg: number
  targetKilos: number
  soldKilos: number
  customerCount: number
  origin?: {
    farm: string
    region: string
    country: string
    coords: string
  }
  comparePricePerKg?: number
  compareRetailer?: string
  savingsPercent?: number
}

export interface Order {
  id: string
  batchId: string
  userEmail: string
  kilos: number
  amount: number
  status: 'PENDING' | 'PAID' | 'CANCELLED'
  receiptId?: string
  createdAt: string
}

export interface Receipt {
  receiptId: string
  orderId: string
  kilos: number
  amount: number
  barcodeData: string
}

export interface Session {
  email: string
  role: 'user' | 'admin'
}

export interface User {
  id: string
  email: string
  role: 'user' | 'admin'
  createdAt: string
}
