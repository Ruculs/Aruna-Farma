'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Loader2, Pill, Eye, EyeOff, Shield, CheckCircle2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const supabase = createClient()
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials') || signInError.message.includes('invalid_credentials')) {
          setError('Email atau password salah.')
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('Email belum dikonfirmasi. Hubungi administrator.')
        } else {
          setError(signInError.message)
        }
        setLoading(false)
        return
      }

      if (!data.session) {
        setError('Sesi gagal dibuat. Coba lagi.')
        setLoading(false)
        return
      }

      setSuccess(true)
      // Full page reload — ensures session cookie is sent on next request
      window.location.href = '/dashboard'
    } catch {
      setError('Kesalahan jaringan. Periksa koneksi internet Anda.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/20 border border-primary/30 mb-6">
            <Pill className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gradient mb-2">Aruna Farma</h1>
          <p className="text-muted-foreground text-sm">Enterprise Platform</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-3xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-1">Selamat Datang</h2>
            <p className="text-sm text-muted-foreground">Masuk ke sistem manajemen apotek</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 p-3 text-sm text-success">
                <CheckCircle2 className="h-4 w-4" />
                <span>Login berhasil! Mengarahkan ke dashboard...</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={loading || success}
                autoComplete="email"
                className="h-12 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={loading || success}
                  autoComplete="current-password"
                  className="h-12 rounded-xl pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 rounded-xl" disabled={loading || success}>
              {loading ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Memproses...</>
              ) : success ? (
                <><CheckCircle2 className="mr-2 h-5 w-5" />Berhasil!</>
              ) : 'Masuk'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border/30">
            <button
              type="button"
              onClick={() => { setEmail('lheyculit@gmail.com'); setError(null) }}
              disabled={loading || success}
              className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Shield className="h-4 w-4" />
              Isi email admin
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
