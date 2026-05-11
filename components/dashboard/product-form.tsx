'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Loader2, ArrowLeft, Save } from 'lucide-react'
import type { Product, ProductFormData } from '@/lib/types'
import Link from 'next/link'

interface ProductFormProps {
  product?: Product
}

export function ProductForm({ product }: ProductFormProps) {
  const isEditing = !!product
  const router = useRouter()

  const [formData, setFormData] = useState<ProductFormData>({
    nama_obat: product?.nama_obat || '',
    kode_obat: product?.kode_obat || '',
    harga: product?.harga || 0,
    hna: product?.hna || 0,
    barcode: product?.barcode || '',
    keterangan: product?.keterangan || '',
    stok: product?.stok || 0,
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validation
    if (!formData.nama_obat.trim()) {
      setError('Nama obat harus diisi')
      setLoading(false)
      return
    }
    if (!formData.kode_obat.trim()) {
      setError('Kode obat harus diisi')
      setLoading(false)
      return
    }
    if (formData.harga < 0) {
      setError('Harga tidak boleh negatif')
      setLoading(false)
      return
    }
    if (formData.stok < 0) {
      setError('Stok tidak boleh negatif')
      setLoading(false)
      return
    }

    const supabase = createClient()

    if (isEditing) {
      // Update aruna_farma base table — only columns that exist there
      const { error: updateError } = await supabase
        .from('aruna_farma')
        .update({
          'NAMA OBAT': formData.nama_obat.trim(),
          HNA: formData.hna,
          'HNA+PPN': Math.round(formData.hna * 1.11),
          barcode: formData.barcode?.trim() || null,
          KETERANGAN: formData.keterangan?.trim() || null,
          stok: formData.stok,
          updated_at: new Date().toISOString(),
        })
        .eq('id', product.id)

      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }
    } else {
      // Insert into aruna_farma — UPPERCASE columns for the raw schema
      const { error: insertError } = await supabase.from('aruna_farma').insert({
        'NAMA OBAT': formData.nama_obat.trim(),
        'KODE OBAT': parseInt(formData.kode_obat) || 0,
        HNA: formData.hna,
        'HNA+PPN': Math.round(formData.hna * 1.11),
        barcode: formData.barcode?.trim() || null,
        KETERANGAN: formData.keterangan?.trim() || null,
        stok: formData.stok,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (insertError) {
        if (insertError.code === '23505') {
          setError('Kode obat sudah digunakan')
        } else {
          setError(insertError.message)
        }
        setLoading(false)
        return
      }
    }

    router.push('/dashboard/products')
    router.refresh()
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Informasi Produk' : 'Informasi Produk Baru'}</CardTitle>
        <CardDescription>
          {isEditing
            ? 'Perbarui detail produk obat'
            : 'Lengkapi form berikut untuk menambah produk baru'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="nama_obat">Nama Obat *</Label>
              <Input
                id="nama_obat"
                name="nama_obat"
                placeholder="Contoh: Paracetamol 500mg"
                value={formData.nama_obat}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kode_obat">Kode Obat *</Label>
              <Input
                id="kode_obat"
                name="kode_obat"
                placeholder="Contoh: PCT500"
                value={formData.kode_obat}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              <Input
                id="barcode"
                name="barcode"
                placeholder="Contoh: 8991234567890"
                value={formData.barcode}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="harga">Harga Jual (Rp) *</Label>
              <Input
                id="harga"
                name="harga"
                type="number"
                placeholder="0"
                value={formData.harga}
                onChange={handleChange}
                disabled={loading}
                min={0}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hna">HNA (Rp)</Label>
              <Input
                id="hna"
                name="hna"
                type="number"
                placeholder="0"
                value={formData.hna}
                onChange={handleChange}
                disabled={loading}
                min={0}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stok">Stok *</Label>
              <Input
                id="stok"
                name="stok"
                type="number"
                placeholder="0"
                value={formData.stok}
                onChange={handleChange}
                disabled={loading}
                min={0}
                required
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="keterangan">Keterangan</Label>
              <Textarea
                id="keterangan"
                name="keterangan"
                placeholder="Catatan tambahan tentang produk..."
                value={formData.keterangan}
                onChange={handleChange}
                disabled={loading}
                rows={3}
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Link href="/dashboard/products">
              <Button type="button" variant="outline" disabled={loading}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Menyimpan...' : 'Menambahkan...'}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? 'Simpan Perubahan' : 'Tambah Produk'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
