'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ArrowRight, Package } from 'lucide-react'
import type { Product } from '@/lib/types'

interface LowStockAlertProps {
  products: Product[]
}

export function LowStockAlert({ products }: LowStockAlertProps) {
  if (products.length === 0) {
    return (
      <Card className="glass-card border-border/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="rounded-lg bg-success/20 p-2">
              <Package className="h-4 w-4 text-success" />
            </div>
            Stok Aman
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Semua produk memiliki stok yang cukup. Tidak ada peringatan saat ini.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-card border-warning/30 border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="rounded-lg bg-warning/20 p-2 animate-pulse">
            <AlertTriangle className="h-4 w-4 text-warning" />
          </div>
          Peringatan Stok
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground truncate text-sm">
                {product.nama_obat}
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                {product.kode_obat}
              </p>
            </div>
            <Badge 
              variant={product.stok === 0 ? 'destructive' : 'outline'}
              className={product.stok === 0 ? '' : 'border-warning text-warning'}
            >
              {product.stok === 0 ? 'Habis' : `${product.stok} unit`}
            </Badge>
          </div>
        ))}
        
        <Button asChild variant="outline" className="w-full rounded-xl border-warning/30 text-warning hover:bg-warning/10 hover:text-warning mt-2">
          <Link href="/dashboard/products?filter=low-stock">
            Lihat Semua
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
