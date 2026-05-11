import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/dashboard/product-form'
import type { Product } from '@/lib/types'

interface EditProductPageProps {
  params: Promise<{ id: string }>
}

async function getProduct(id: string): Promise<Product | null> {
  const supabase = await createClient()

  // Fetch from enterprise view using UUID id
  const { data, error } = await supabase
    .from('aruna_farma_view_enterprise')
    .select('id, nama_obat, kode_obat, barcode, kategori, harga_jual, harga_neto, harga_beli, stok, created_at, updated_at')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    nama_obat: data.nama_obat ?? '',
    kode_obat: data.kode_obat ?? '',
    harga: Number(data.harga_jual ?? data.harga_neto ?? 0),
    hna: Number(data.harga_neto ?? data.harga_beli ?? 0),
    barcode: data.barcode ?? null,
    keterangan: data.kategori ?? null,
    stok: Number(data.stok ?? 0),
    created_at: data.created_at ?? new Date().toISOString(),
    updated_at: data.updated_at ?? new Date().toISOString(),
  }
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Edit Produk</h1>
        <p className="text-muted-foreground">Ubah informasi produk {product.nama_obat}</p>
      </div>
      <ProductForm product={product} />
    </div>
  )
}
