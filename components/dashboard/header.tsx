'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LogOut, Menu, User, Pill, Bell, Shield } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Package, Settings, TrendingUp } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Produk', href: '/dashboard/products', icon: Package },
  { name: 'Laporan', href: '/dashboard/reports', icon: TrendingUp },
  { name: 'Pengaturan', href: '/dashboard/settings', icon: Settings },
]

interface DashboardHeaderProps {
  user: SupabaseUser
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    // Full page redirect to clear session cookies properly
    window.location.href = '/auth/login'
  }

  const userInitials = user.email?.substring(0, 2).toUpperCase() || 'U'
  const isAdmin = user.email === 'admin@arunafarma.com'

  return (
    <header className="flex h-20 items-center justify-between border-b border-border bg-card/50 backdrop-blur-xl px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden rounded-xl">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 bg-sidebar border-sidebar-border">
            <div className="flex h-20 items-center gap-3 border-b border-sidebar-border px-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sidebar-primary glow-primary">
                <Pill className="h-6 w-6 text-sidebar-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient">Aruna Farma</h1>
                <p className="text-xs text-sidebar-foreground/50">Enterprise Platform</p>
              </div>
            </div>
            <nav className="space-y-2 p-4">
              <p className="px-3 mb-3 text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider">
                Menu Utama
              </p>
              {navigation.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/dashboard' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground glow-primary'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </SheetContent>
        </Sheet>
        <div className="lg:hidden flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
            <Pill className="h-5 w-5 text-primary" />
          </div>
          <span className="font-bold text-gradient">Aruna Farma</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="rounded-xl relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
            3
          </span>
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-12 rounded-xl pl-2 pr-4 gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-foreground">
                  {isAdmin ? 'Administrator' : user.email?.split('@')[0]}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isAdmin ? 'Admin' : 'User'}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 rounded-xl p-2" align="end" forceMount>
            <DropdownMenuLabel className="font-normal p-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold leading-none">
                    {isAdmin ? 'Administrator' : 'User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>
            {isAdmin && (
              <>
                <DropdownMenuSeparator />
                <div className="px-3 py-2">
                  <div className="flex items-center gap-2 text-xs">
                    <Shield className="h-3 w-3 text-success" />
                    <span className="text-success font-medium">Admin Access</span>
                  </div>
                </div>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
              <Link href="/dashboard/settings">
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Pengaturan</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleSignOut} 
              className="text-destructive cursor-pointer rounded-lg"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Keluar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
