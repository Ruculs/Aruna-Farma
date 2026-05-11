import { createClient } from '@/lib/supabase/server'
import { ReportsOverview } from '@/components/dashboard/reports-overview'
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

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('aruna_farma_view_enterprise')
    .select('id,nama_obat,kode_obat,barcode,kategori,harga_jual,harga_neto,stok,created_at,updated_at')
    .is('deleted_at', null)
    .gt('stok', 0)
    .order('stok', { ascending: false })
    .range(0, 199)

  const products = (data ?? []).map(mapRow)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Laporan Inventaris</h1>
        <p className="text-muted-foreground">200 produk dengan stok tertinggi</p>
      </div>
      <ReportsOverview products={products} />
    </div>
  )
}
