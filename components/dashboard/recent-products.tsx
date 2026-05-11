'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Package, Clock } from 'lucide-react'
import type { Product } from '@/lib/types'

interface RecentProductsProps {
  products: Product[]
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function getStockBadge(stok: number) {
  if (stok === 0) {
    return <Badge variant="destructive" className="font-medium">Habis</Badge>
  }
  if (stok <= 10) {
    return <Badge className="bg-warning text-warning-foreground font-medium">Menipis</Badge>
  }
  return <Badge className="bg-success text-success-foreground font-medium">Tersedia</Badge>
}

export function RecentProducts({ products }: RecentProductsProps) {
  return (
    <Card className="glass-card border-border/30">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/20 p-2">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Produk Terbaru</CardTitle>
            <p className="text-sm text-muted-foreground">Daftar produk yang baru ditambahkan</p>
          </div>
        </div>
        <Link href="/dashboard/products">
          <Button variant="outline" size="sm" className="rounded-xl border-border/50">
            Lihat Semua
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-2xl bg-muted/30 p-6 mb-4">
              <Package className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground mb-4">Belum ada produk</p>
            <Link href="/dashboard/products/new">
              <Button size="sm" className="rounded-xl">
                Tambah Produk Pertama
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="flex items-center justify-between rounded-xl bg-muted/20 p-4 transition-all duration-200 hover:bg-muted/40 hover:scale-[1.01]"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="font-semibold text-foreground truncate">{product.nama_obat}</p>
                    {getStockBadge(product.stok)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 font-mono">
                    {product.kode_obat} <span className="text-muted-foreground/50">•</span> Stok: {product.stok.toLocaleString('id-ID')} unit
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p className="font-bold text-foreground text-lg">
                    {formatCurrency(product.harga)}
                  </p>
                  <p className="text-xs text-muted-foreground">per unit</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
