import { createClient } from '@/lib/supabase/server'
import { ProductsTable } from '@/components/dashboard/products-table'
import { ProductsHeader } from '@/components/dashboard/products-header'
import type { Product } from '@/lib/types'

function mapRow(p: any): Product {
  return {
    id: p.id ?? String(p.kode_obat ?? Math.random()),
    nama_obat: p.nama_obat ?? '',
    kode_obat: String(p.kode_obat ?? ''),
    harga: Number(p.harga_jual ?? p.harga_neto ?? 0),
    hna: Number(p.harga_neto ?? p.harga_beli ?? 0),
    barcode: p.barcode ?? null,
    keterangan: p.kategori ?? null,
    stok: Number(p.stok ?? 0),
    created_at: p.created_at ?? new Date().toISOString(),
    updated_at: p.updated_at ?? new Date().toISOString(),
  }
}

async function getProducts() {
  const supabase = await createClient()
  const { data, count, error } = await supabase
    .from('aruna_farma_view_enterprise')
    .select('id,nama_obat,kode_obat,barcode,kategori,harga_jual,harga_neto,harga_beli,stok,satuan,created_at,updated_at', { count: 'exact' })
    .is('deleted_at', null)
    .order('nama_obat', { ascending: true })
    .range(0, 24)

  if (error) {
    console.error('products fetch error:', error.message)
    return { products: [], totalCount: 0 }
  }
  return { products: (data ?? []).map(mapRow), totalCount: count ?? 0 }
}

export default async function ProductsPage() {
  const { products, totalCount } = await getProducts()
  return (
    <div className="space-y-6">
      <ProductsHeader totalProducts={totalCount} />
      <ProductsTable initialProducts={products} totalCount={totalCount} />
    </div>
  )
}
