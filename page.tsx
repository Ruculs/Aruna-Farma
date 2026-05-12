'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (signInError) {
        setError(
          signInError.message.includes('Invalid login credentials')
            ? 'Email atau password salah.'
            : signInError.message.includes('Email not confirmed')
            ? 'Email belum dikonfirmasi.'
            : signInError.message
        )
        setLoading(false)
        return
      }

      if (!data.session) {
        setError('Sesi gagal dibuat. Coba lagi.')
        setLoading(false)
        return
      }

      setSuccess(true)
      // Full page reload — ensures cookies are written before next request
      window.location.href = '/dashboard'
    } catch {
      setError('Kesalahan jaringan. Periksa koneksi internet.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0f1a 0%, #0d1b2e 100%)',
      fontFamily: 'system-ui, sans-serif',
      padding: '16px',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '16px',
            background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: '32px'
          }}>💊</div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#10b981', margin: 0 }}>Aruna Farma</h1>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>Enterprise Platform</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(17,24,39,0.8)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '24px', padding: '32px',
          backdropFilter: 'blur(12px)',
        }}>
          <h2 style={{ color: '#f9fafb', fontSize: '20px', fontWeight: 600, marginBottom: '8px', textAlign: 'center' }}>
            Selamat Datang
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '14px', textAlign: 'center', marginBottom: '24px' }}>
            Masuk ke sistem manajemen apotek
          </p>

          {/* Status */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: '12px', padding: '10px 14px', marginBottom: '20px'
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
            <span style={{ color: '#10b981', fontSize: '13px', fontWeight: 500 }}>Sistem siap</span>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '12px', padding: '12px', color: '#f87171', fontSize: '13px'
              }}>
                ⚠️ {error}
              </div>
            )}
            {success && (
              <div style={{
                background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: '12px', padding: '12px', color: '#34d399', fontSize: '13px'
              }}>
                ✓ Login berhasil! Mengarahkan ke dashboard...
              </div>
            )}

            <div>
              <label style={{ display: 'block', color: '#d1d5db', fontSize: '13px', marginBottom: '6px' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={loading || success}
                placeholder="nama@email.com"
                autoComplete="email"
                style={{
                  width: '100%', height: '48px', borderRadius: '12px',
                  background: 'rgba(31,41,55,0.8)', border: '1px solid rgba(75,85,99,0.5)',
                  color: '#f9fafb', fontSize: '14px', padding: '0 16px',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#d1d5db', fontSize: '13px', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={loading || success}
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  style={{
                    width: '100%', height: '48px', borderRadius: '12px',
                    background: 'rgba(31,41,55,0.8)', border: '1px solid rgba(75,85,99,0.5)',
                    color: '#f9fafb', fontSize: '14px', padding: '0 48px 0 16px',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '16px'
                  }}
                >
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              style={{
                height: '48px', borderRadius: '12px',
                background: loading || success ? 'rgba(16,185,129,0.5)' : '#10b981',
                border: 'none', color: '#0a0f1a', fontSize: '15px',
                fontWeight: 600, cursor: loading || success ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {loading ? 'Memproses...' : success ? '✓ Berhasil!' : 'Masuk'}
            </button>
          </form>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '24px', paddingTop: '20px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => { setEmail('lheyculit@gmail.com'); setError(null) }}
              disabled={loading || success}
              style={{
                background: 'none', border: 'none', color: '#6b7280',
                fontSize: '13px', cursor: 'pointer'
              }}
            >
              🔒 Isi email admin
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: '#374151', fontSize: '12px', marginTop: '24px' }}>
          Aruna Farma Enterprise Platform v1.0 · Powered by Supabase
        </p>
      </div>
    </div>
  )
}
