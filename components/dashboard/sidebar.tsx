'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Package, Settings, Pill, TrendingUp, Shield, Warehouse } from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Produk', href: '/dashboard/products', icon: Package },
  { name: 'Inventaris', href: '/dashboard/inventory', icon: Warehouse },
  { name: 'Laporan', href: '/dashboard/reports', icon: TrendingUp },
  { name: 'Pengaturan', href: '/dashboard/settings', icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-72 flex-shrink-0 border-r border-sidebar-border bg-sidebar lg:flex lg:flex-col">
      <div className="flex h-20 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sidebar-primary glow-primary">
          <Pill className="h-6 w-6 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gradient">Aruna Farma</h1>
          <p className="text-xs text-sidebar-foreground/50">Enterprise Platform</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground glow-primary'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-2 rounded-xl bg-sidebar-accent/50 px-4 py-3">
          <Shield className="h-4 w-4 text-success" />
          <div>
            <p className="text-xs font-medium text-sidebar-foreground">Enterprise v1.0</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              <p className="text-xs text-sidebar-foreground/50">Sistem Aktif</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
