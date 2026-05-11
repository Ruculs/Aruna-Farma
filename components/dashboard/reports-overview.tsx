'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Package, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react'
import type { Product } from '@/lib/types'

interface ReportsOverviewProps {
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

export function ReportsOverview({ products }: ReportsOverviewProps) {
  // Calculate statistics
  const totalProducts = products.length
  const totalStok = products.reduce((acc, p) => acc + p.stok, 0)
  const totalValue = products.reduce((acc, p) => acc + (p.harga * p.stok), 0)
  const totalHnaValue = products.reduce((acc, p) => acc + (p.hna * p.stok), 0)
  const potentialProfit = totalValue - totalHnaValue

  const lowStockProducts = products.filter(p => p.stok > 0 && p.stok <= 10)
  const outOfStockProducts = products.filter(p => p.stok === 0)
  const highValueProducts = [...products]
    .sort((a, b) => (b.harga * b.stok) - (a.harga * a.stok))
    .slice(0, 5)

  const summaryCards = [
    {
      title: 'Total Jenis Produk',
      value: totalProducts.toLocaleString('id-ID'),
      subtitle: `${totalStok.toLocaleString('id-ID')} unit total stok`,
      icon: Package,
      iconColor: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Nilai Inventaris',
      value: formatCurrency(totalValue),
      subtitle: 'Berdasarkan harga jual',
      icon: DollarSign,
      iconColor: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Modal Inventaris',
      value: formatCurrency(totalHnaValue),
      subtitle: 'Berdasarkan HNA',
      icon: TrendingUp,
      iconColor: 'text-chart-2',
      bgColor: 'bg-chart-2/10',
    },
    {
      title: 'Potensi Keuntungan',
      value: formatCurrency(potentialProfit),
      subtitle: 'Jika semua terjual',
      icon: TrendingUp,
      iconColor: 'text-success',
      bgColor: 'bg-success/10',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <CardTitle>Peringatan Stok Menipis</CardTitle>
            </div>
            <CardDescription>
              Produk dengan stok 10 unit atau kurang
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">
                Tidak ada produk dengan stok menipis
              </p>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Produk</TableHead>
                      <TableHead className="text-center">Stok</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStockProducts.slice(0, 5).map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{product.nama_obat}</p>
                            <p className="text-xs text-muted-foreground">{product.kode_obat}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-warning text-warning-foreground">
                            {product.stok}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {lowStockProducts.length > 5 && (
              <p className="text-sm text-muted-foreground mt-3 text-center">
                +{lowStockProducts.length - 5} produk lainnya
              </p>
            )}
          </CardContent>
        </Card>

        {/* Out of Stock */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-destructive" />
              <CardTitle>Stok Habis</CardTitle>
            </div>
            <CardDescription>
              Produk yang perlu segera di-restock
            </CardDescription>
          </CardHeader>
          <CardContent>
            {outOfStockProducts.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">
                Semua produk masih tersedia
              </p>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Produk</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {outOfStockProducts.slice(0, 5).map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{product.nama_obat}</p>
                            <p className="text-xs text-muted-foreground">{product.kode_obat}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="destructive">Habis</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {outOfStockProducts.length > 5 && (
              <p className="text-sm text-muted-foreground mt-3 text-center">
                +{outOfStockProducts.length - 5} produk lainnya
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* High Value Products */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-success" />
            <CardTitle>Produk Nilai Tertinggi</CardTitle>
          </div>
          <CardDescription>
            5 produk dengan nilai inventaris tertinggi
          </CardDescription>
        </CardHeader>
        <CardContent>
          {highValueProducts.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">
              Belum ada data produk
            </p>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Produk</TableHead>
                    <TableHead className="text-right">Harga</TableHead>
                    <TableHead className="text-center">Stok</TableHead>
                    <TableHead className="text-right">Nilai Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {highValueProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.nama_obat}</p>
                          <p className="text-xs text-muted-foreground">{product.kode_obat}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(product.harga)}
                      </TableCell>
                      <TableCell className="text-center">
                        {product.stok.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(product.harga * product.stok)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
