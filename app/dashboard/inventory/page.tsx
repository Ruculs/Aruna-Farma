import { createClient } from '@/lib/supabase/server'
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

export default async function InventoryPage() {
  const supabase = await createClient()

  const [totalRes, lowRes, outRes, criticalRes] = await Promise.all([
    supabase.from('aruna_farma_view_enterprise').select('*', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('aruna_farma_view_enterprise').select('*', { count: 'exact', head: true }).is('deleted_at', null).gt('stok', 0).lte('stok', 10),
    supabase.from('aruna_farma_view_enterprise').select('*', { count: 'exact', head: true }).is('deleted_at', null).eq('stok', 0),
    supabase.from('aruna_farma_view_enterprise').select('id,nama_obat,kode_obat,stok,harga_jual,satuan').is('deleted_at', null).lte('stok', 10).order('stok', { ascending: true }).range(0, 19),
  ])

  const items = (criticalRes.data ?? []).map(mapRow)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gradient">Manajemen Inventaris</h1>
        <p className="text-muted-foreground mt-1">Monitor stok dan kelola inventaris apotek</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total SKU', value: (totalRes.count ?? 0).toLocaleString('id-ID'), color: 'text-primary' },
          { label: 'Stok Menipis', value: (lowRes.count ?? 0).toLocaleString('id-ID'), color: 'text-warning' },
          { label: 'Stok Habis', value: (outRes.count ?? 0).toLocaleString('id-ID'), color: 'text-destructive' },
        ].map(c => (
          <div key={c.label} className="glass-card rounded-2xl p-5">
            <p className="text-sm text-muted-foreground">{c.label}</p>
            <p className={`text-3xl font-bold mt-1 ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">Produk Stok Kritis</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left py-3 text-muted-foreground font-medium">Nama Produk</th>
                <th className="text-left py-3 text-muted-foreground font-medium">Kode</th>
                <th className="text-right py-3 text-muted-foreground font-medium">Stok</th>
                <th className="text-right py-3 text-muted-foreground font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map(p => (
                <tr key={p.id} className="border-b border-border/20 hover:bg-white/5">
                  <td className="py-3">{p.nama_obat}</td>
                  <td className="py-3 text-muted-foreground font-mono text-xs">{p.kode_obat}</td>
                  <td className="py-3 text-right font-bold">{p.stok}</td>
                  <td className="py-3 text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      p.stok === 0 ? 'bg-destructive/20 text-destructive' : 'bg-warning/20 text-warning'
                    }`}>
                      {p.stok === 0 ? 'Habis' : 'Menipis'}
                    </span>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">Semua stok aman</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
