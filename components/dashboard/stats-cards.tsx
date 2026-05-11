'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Package, DollarSign, AlertTriangle, XCircle, TrendingUp, TrendingDown } from 'lucide-react'
import type { DashboardStats } from '@/lib/types'

interface StatsCardsProps {
  stats: DashboardStats
}

function formatCurrency(value: number): string {
  if (value >= 1000000000) {
    return `Rp ${(value / 1000000000).toFixed(1)}M`
  }
  if (value >= 1000000) {
    return `Rp ${(value / 1000000).toFixed(1)}Jt`
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Produk',
      value: stats.totalProducts.toLocaleString('id-ID'),
      description: 'Jenis obat terdaftar',
      icon: Package,
      iconColor: 'text-primary',
      bgColor: 'bg-primary/20',
      glowClass: 'glow-primary',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Nilai Inventaris',
      value: formatCurrency(stats.totalValue),
      description: 'Total nilai stok',
      icon: DollarSign,
      iconColor: 'text-success',
      bgColor: 'bg-success/20',
      glowClass: '',
      trend: '+8.2%',
      trendUp: true,
    },
    {
      title: 'Stok Menipis',
      value: stats.lowStockCount.toLocaleString('id-ID'),
      description: 'Stok <= 10 unit',
      icon: AlertTriangle,
      iconColor: 'text-warning',
      bgColor: 'bg-warning/20',
      glowClass: '',
      trend: stats.lowStockCount > 0 ? 'Perlu perhatian' : 'Aman',
      trendUp: stats.lowStockCount === 0,
    },
    {
      title: 'Stok Habis',
      value: stats.outOfStockCount.toLocaleString('id-ID'),
      description: 'Perlu restok segera',
      icon: XCircle,
      iconColor: 'text-destructive',
      bgColor: 'bg-destructive/20',
      glowClass: '',
      trend: stats.outOfStockCount > 0 ? 'Kritis' : 'Aman',
      trendUp: stats.outOfStockCount === 0,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card 
          key={card.title} 
          className={`glass-card border-border/30 overflow-hidden transition-all duration-300 hover:scale-[1.02] ${card.glowClass}`}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </p>
                <div className="text-3xl font-bold text-foreground">
                  {card.value}
                </div>
                <div className="flex items-center gap-2">
                  {card.trendUp ? (
                    <TrendingUp className="h-3 w-3 text-success" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-destructive" />
                  )}
                  <span className={`text-xs font-medium ${card.trendUp ? 'text-success' : 'text-destructive'}`}>
                    {card.trend}
                  </span>
                </div>
              </div>
              <div className={`rounded-2xl p-3 ${card.bgColor}`}>
                <card.icon className={`h-6 w-6 ${card.iconColor}`} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
