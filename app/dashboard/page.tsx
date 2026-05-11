import { createClient } from '@/lib/supabase/server'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { RecentProducts } from '@/components/dashboard/recent-products'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { LowStockAlert } from '@/components/dashboard/low-stock-alert'
import type { Product, DashboardStats } from '@/lib/types'

function mapRow(p: any): Product {
  return {
    id: p.id ?? String(p.kode_obat ?? Math.random()),
    nama_obat: p.nama_obat ?? '',
    kode_obat: String(p.kode_obat ?? ''),
    harga: Number(p.harga_jual ?? p.harga_neto ?? p.harga ?? 0),
    hna: Number(p.harga_neto ?? p.harga_beli ?? p.hna ?? 0),
    barcode: p.barcode ?? null,
    keterangan: p.kategori ?? p.keterangan ?? null,
    stok: Number(p.stok ?? 0),
    created_at: p.created_at ?? new Date().toISOString(),
    updated_at: p.updated_at ?? new Date().toISOString(),
  }
}

async function getData() {
  const supabase = await createClient()

  // Try enterprise view first, fallback to aruna_farma
  const VIEW = 'aruna_farma_view_enterprise'

  const [totalRes, valueRes, lowRes, outRes, recentRes, alertRes] = await Promise.all([
    supabase.from(VIEW).select('*', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from(VIEW).select('harga_jual, stok').is('deleted_at', null).gt('stok', 0),
    supabase.from(VIEW).select('*', { count: 'exact', head: true }).is('deleted_at', null).gt('stok', 0).lte('stok', 10),
    supabase.from(VIEW).select('*', { count: 'exact', head: true }).is('deleted_at', null).eq('stok', 0),
    supabase.from(VIEW).select('id,nama_obat,kode_obat,barcode,kategori,harga_jual,harga_neto,stok,created_at,updated_at').is('deleted_at', null).order('updated_at', { ascending: false }).range(0, 7),
    supabase.from(VIEW).select('id,nama_obat,kode_obat,barcode,kategori,harga_jual,harga_neto,stok,created_at,updated_at').is('deleted_at', null).lte('stok', 10).order('stok', { ascending: true }).range(0, 4),
  ])

  const totalValue = (valueRes.data ?? []).reduce(
    (s: number, p: any) => s + Number(p.harga_jual ?? 0) * Number(p.stok ?? 0), 0
  )

  const stats: DashboardStats = {
    totalProducts: totalRes.count ?? 0,
    totalValue,
    lowStockCount: lowRes.count ?? 0,
    outOfStockCount: outRes.count ?? 0,
  }

  return {
    stats,
    recentProducts: (recentRes.data ?? []).map(mapRow),
    lowStockProducts: (alertRes.data ?? []).map(mapRow),
  }
}

export default async function DashboardPage() {
  const { stats, recentProducts, lowStockProducts } = await getData()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Selamat datang di Aruna Farma Enterprise Platform</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-success/10 border border-success/20">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="text-sm font-medium text-success">Sistem Online</span>
        </div>
      </div>
      <StatsCards stats={stats} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2"><RecentProducts products={recentProducts} /></div>
        <div className="space-y-6">
          <QuickActions />
          <LowStockAlert products={lowStockProducts} />
        </div>
      </div>
    </div>
  )
}
