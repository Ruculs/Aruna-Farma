'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FileText, Settings, Package, Zap } from 'lucide-react'

const actions = [
  {
    title: 'Tambah Produk',
    description: 'Tambahkan obat baru ke inventaris',
    href: '/dashboard/products/new',
    icon: Plus,
    primary: true,
  },
  {
    title: 'Kelola Produk',
    description: 'Lihat dan edit produk yang ada',
    href: '/dashboard/products',
    icon: Package,
    primary: false,
  },
  {
    title: 'Lihat Laporan',
    description: 'Analisis dan statistik inventaris',
    href: '/dashboard/reports',
    icon: FileText,
    primary: false,
  },
  {
    title: 'Pengaturan',
    description: 'Konfigurasi sistem',
    href: '/dashboard/settings',
    icon: Settings,
    primary: false,
  },
]

export function QuickActions() {
  return (
    <Card className="glass-card border-border/30">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-accent/20 p-2">
            <Zap className="h-5 w-5 text-accent" />
          </div>
          <div>
            <CardTitle className="text-lg">Aksi Cepat</CardTitle>
            <p className="text-sm text-muted-foreground">Akses fitur utama</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action) => (
          <Link key={action.href} href={action.href} className="block">
            <Button
              variant={action.primary ? 'default' : 'ghost'}
              className={`w-full justify-start h-auto py-3 px-4 rounded-xl transition-all duration-200 ${
                action.primary 
                  ? 'bg-primary hover:bg-primary/90 glow-primary' 
                  : 'hover:bg-muted/50'
              }`}
            >
              <div className={`rounded-lg p-2 mr-3 ${action.primary ? 'bg-primary-foreground/20' : 'bg-muted'}`}>
                <action.icon className={`h-4 w-4 ${action.primary ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
              </div>
              <div className="text-left">
                <p className={`font-medium ${action.primary ? 'text-primary-foreground' : 'text-foreground'}`}>
                  {action.title}
                </p>
                <p className={`text-xs ${action.primary ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  {action.description}
                </p>
              </div>
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
