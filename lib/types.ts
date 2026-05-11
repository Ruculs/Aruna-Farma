export interface Product {
  id: string
  nama_obat: string
  kode_obat: string
  harga: number
  hna: number
  barcode: string | null
  keterangan: string | null
  stok: number
  created_at: string
  updated_at: string
}

export interface ProductFormData {
  nama_obat: string
  kode_obat: string
  harga: number
  hna: number
  barcode?: string
  keterangan?: string
  stok: number
}

export interface DashboardStats {
  totalProducts: number
  totalValue: number
  lowStockCount: number
  outOfStockCount: number
}

export interface User {
  id: string
  email: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
  }
}
