'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface ProductsHeaderProps {
  totalProducts: number
}

export function ProductsHeader({ totalProducts }: ProductsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Manajemen Produk</h1>
        <p className="text-muted-foreground">
          {totalProducts.toLocaleString('id-ID')} produk terdaftar
        </p>
      </div>
      <Link href="/dashboard/products/new">
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Produk
        </Button>
      </Link>
    </div>
  )
}
