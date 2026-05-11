'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Search, 
  Package, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  Wifi,
  WifiOff
} from 'lucide-react'
import type { Product } from '@/lib/types'

interface ProductsTableProps {
  initialProducts: Product[]
  totalCount: number
}

const PAGE_SIZES = [10, 25, 50, 100]

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

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function ProductsTable({ initialProducts, totalCount: initialTotalCount }: ProductsTableProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [totalCount, setTotalCount] = useState(initialTotalCount)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [isRealtime, setIsRealtime] = useState(true)
  const router = useRouter()

  const debouncedSearch = useDebounce(search, 300)

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / pageSize)
  const startIndex = (page - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalCount)

  // Fetch products with pagination and search
  // Uses aruna_farma_view_enterprise — 58k+ products, indexed, snake_case columns
  const fetchProducts = useCallback(async (searchTerm: string, currentPage: number, currentPageSize: number) => {
    setLoading(true)
    const supabase = createClient()
    
    let query = supabase
      .from('aruna_farma_view_enterprise')
      .select(
        'id, nama_obat, kode_obat, barcode, kategori, harga_jual, harga_neto, harga_beli, stok, satuan, created_at, updated_at',
        { count: 'exact' }
      )
      .is('deleted_at', null)

    // Search using indexed columns — supported by pg_trgm GIN indexes
    if (searchTerm) {
      query = query.or(
        `nama_obat.ilike.%${searchTerm}%,kode_obat.ilike.%${searchTerm}%,barcode.ilike.%${searchTerm}%`
      )
    }

    // Paginate with .range() — NEVER use .limit() for 60k+ products
    const from = (currentPage - 1) * currentPageSize
    const to = from + currentPageSize - 1

    const { data, count, error } = await query
      .order('nama_obat', { ascending: true })
      .range(from, to)

    if (error) {
      console.error('Error fetching products:', error.message)
    } else {
      // Normalize to Product interface
      const mapped = (data ?? []).map((p: any) => ({
        id: p.id ?? String(p.kode_obat),
        nama_obat: p.nama_obat ?? '',
        kode_obat: p.kode_obat ?? '',
        harga: Number(p.harga_jual ?? p.harga_neto ?? 0),
        hna: Number(p.harga_neto ?? p.harga_beli ?? 0),
        barcode: p.barcode ?? null,
        keterangan: p.kategori ?? null,
        stok: Number(p.stok ?? 0),
        created_at: p.created_at ?? new Date().toISOString(),
        updated_at: p.updated_at ?? new Date().toISOString(),
      }))
      setProducts(mapped)
      setTotalCount(count ?? 0)
    }
    
    setLoading(false)
  }, [])

  // Fetch when search or pagination changes
  useEffect(() => {
    fetchProducts(debouncedSearch, page, pageSize)
  }, [debouncedSearch, page, pageSize, fetchProducts])

  // Reset to first page when search changes
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  // Realtime subscription on source table
  useEffect(() => {
    const supabase = createClient()
    
    const channel = supabase
      .channel('products_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'aruna_farma',
        },
        () => {
          fetchProducts(debouncedSearch, page, pageSize)
        }
      )
      .subscribe((status) => {
        setIsRealtime(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [debouncedSearch, page, pageSize, fetchProducts])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)

    const supabase = createClient()
    // Delete from base table aruna_farma using the UUID id column
    const { error } = await supabase
      .from('aruna_farma_view_enterprise')
      .delete()
      .eq('id', deleteId)

    if (!error) {
      // Refresh data after delete
      fetchProducts(debouncedSearch, page, pageSize)
    }

    setDeleting(false)
    setDeleteId(null)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }

  const handlePageSizeChange = (newSize: string) => {
    setPageSize(parseInt(newSize))
    setPage(1) // Reset to first page
  }

  // Generate page numbers to show
  const pageNumbers = useMemo(() => {
    const pages: number[] = []
    const maxVisible = 5
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push(-1) // Ellipsis
        pages.push(totalPages)
      } else if (page >= totalPages - 2) {
        pages.push(1)
        pages.push(-1)
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push(-1)
        for (let i = page - 1; i <= page + 1; i++) pages.push(i)
        pages.push(-2)
        pages.push(totalPages)
      }
    }
    
    return pages
  }, [page, totalPages])

  return (
    <>
      <Card className="glass-card border-border/30">
        <CardContent className="p-6">
          {/* Header with search and controls */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari nama, kode, atau barcode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11 rounded-xl bg-input/50 border-border/50"
              />
              {loading && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Realtime indicator */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 text-xs">
                {isRealtime ? (
                  <>
                    <Wifi className="h-3 w-3 text-success" />
                    <span className="text-success">Realtime</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Offline</span>
                  </>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchProducts(debouncedSearch, page, pageSize)}
                disabled={loading}
                className="rounded-xl border-border/50"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Results summary */}
          <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
            <span>
              Menampilkan {startIndex + 1}-{endIndex} dari {totalCount.toLocaleString('id-ID')} produk
              {debouncedSearch && ` (hasil pencarian "${debouncedSearch}")`}
            </span>
            <div className="flex items-center gap-2">
              <span>Baris per halaman:</span>
              <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="w-20 h-8 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          {products.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-2xl bg-muted/30 p-6 mb-4">
                <Package className="h-12 w-12 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {search ? 'Tidak ada hasil' : 'Belum ada produk'}
              </h3>
              <p className="text-muted-foreground max-w-sm">
                {search
                  ? 'Coba ubah kata kunci pencarian atau periksa ejaan'
                  : 'Tambahkan produk pertama untuk memulai mengelola inventaris'}
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-border/30 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="font-semibold">Nama Obat</TableHead>
                    <TableHead className="font-semibold">Kode</TableHead>
                    <TableHead className="text-right font-semibold">Harga Jual</TableHead>
                    <TableHead className="text-right font-semibold">HNA</TableHead>
                    <TableHead className="text-center font-semibold">Stok</TableHead>
                    <TableHead className="text-center font-semibold">Status</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          <span className="text-muted-foreground">Memuat data...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => (
                      <TableRow key={product.id} className="hover:bg-muted/20 transition-colors">
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{product.nama_obat}</p>
                            {product.barcode && (
                              <p className="text-xs text-muted-foreground font-mono">{product.barcode}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {product.kode_obat}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-foreground">
                          {formatCurrency(product.harga)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatCurrency(product.hna)}
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {product.stok.toLocaleString('id-ID')}
                        </TableCell>
                        <TableCell className="text-center">{getStockBadge(product.stok)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="rounded-lg">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl">
                              <DropdownMenuItem
                                onClick={() => router.push(`/dashboard/products/${product.id}/edit`)}
                                className="rounded-lg"
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeleteId(product.id)}
                                className="text-destructive rounded-lg"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-6">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(1)}
                disabled={page === 1 || loading}
                className="h-9 w-9 rounded-lg border-border/50"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1 || loading}
                className="h-9 w-9 rounded-lg border-border/50"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {pageNumbers.map((pageNum, idx) => 
                pageNum < 0 ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">...</span>
                ) : (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => handlePageChange(pageNum)}
                    disabled={loading}
                    className={`h-9 w-9 rounded-lg ${page === pageNum ? 'glow-primary' : 'border-border/50'}`}
                  >
                    {pageNum}
                  </Button>
                )
              )}
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages || loading}
                className="h-9 w-9 rounded-lg border-border/50"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(totalPages)}
                disabled={page === totalPages || loading}
                className="h-9 w-9 rounded-lg border-border/50"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl glass-card border-border/30">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Produk?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Produk akan dihapus secara permanen dari sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} className="rounded-xl">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                'Hapus'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
