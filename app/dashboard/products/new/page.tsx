import { ProductForm } from '@/components/dashboard/product-form'

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Tambah Produk Baru</h1>
        <p className="text-muted-foreground">Masukkan informasi produk obat baru</p>
      </div>

      <ProductForm />
    </div>
  )
}
