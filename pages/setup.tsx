import nextI18nConfig from '@/next-i18next.config'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { ShieldCheck, Eye, EyeOff, CheckCircle, AlertTriangle, KeyRound } from 'lucide-react'

export default function SetupPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    secret: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess(`✅ ${data.message} — ${data.user.email}`)
        setTimeout(() => router.push('/login'), 2500)
      } else {
        setError(data.error || 'Something went wrong')
      }
    } catch (e) {
      setError('Network error')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
      padding: '20px',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(30,41,59,0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(148,163,184,0.1)',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <ShieldCheck size={28} color="white" />
          </div>
          <h1 style={{ color: 'white', fontSize: '22px', fontWeight: 700, margin: 0 }}>Setup Admin</h1>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '6px' }}>
            Create or reset an administrator account
          </p>
          <div style={{
            marginTop: '12px', padding: '8px 12px',
            background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: '8px', fontSize: '11px', color: '#fbbf24'
          }}>
            ⚠️ This page is for initial setup only. Keep the URL secret.
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Setup Secret */}
          <div>
            <label style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              <KeyRound size={12} style={{ display: 'inline', marginRight: '5px' }} />
              Setup Secret Key *
            </label>
            <input
              type="password"
              required
              placeholder="Enter your SETUP_SECRET"
              value={form.secret}
              onChange={e => setForm({ ...form, secret: e.target.value })}
              style={inputStyle}
            />
            <p style={{ color: '#64748b', fontSize: '11px', marginTop: '4px' }}>
              Default: <code style={{ color: '#f59e0b' }}>karvex-setup-2024</code> (set SETUP_SECRET in .env to change)
            </p>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid rgba(148,163,184,0.1)', paddingTop: '16px' }}>
            <p style={{ color: '#64748b', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              Admin Account Details
            </p>
          </div>

          {/* Name row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>First Name *</label>
              <input type="text" required placeholder="Jan" value={form.firstName}
                onChange={e => setForm({ ...form, firstName: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Last Name *</label>
              <input type="text" required placeholder="Kowalski" value={form.lastName}
                onChange={e => setForm({ ...form, lastName: e.target.value })} style={inputStyle} />
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={labelStyle}>Email *</label>
            <input type="email" required placeholder="admin@company.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} />
          </div>

          {/* Password */}
          <div>
            <label style={labelStyle}>Password *</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                required
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                style={{ ...inputStyle, paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 0
                }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div style={{
              padding: '10px 14px', background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px',
              color: '#f87171', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <AlertTriangle size={14} /> {error}
            </div>
          )}
          {success && (
            <div style={{
              padding: '10px 14px', background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px',
              color: '#34d399', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <CheckCircle size={14} /> {success}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '13px', background: loading ? '#374151' : 'linear-gradient(135deg, #f59e0b, #ef4444)',
              border: 'none', borderRadius: '12px', color: 'white', fontWeight: 700,
              fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.02em',
              transition: 'all 0.2s', marginTop: '4px',
            }}
          >
            {loading ? 'Creating Admin...' : 'Create / Reset Admin Account'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/login')}
            style={{
              padding: '10px', background: 'none', border: '1px solid rgba(148,163,184,0.2)',
              borderRadius: '10px', color: '#64748b', fontSize: '13px', cursor: 'pointer',
            }}
          >
            ← Back to Login
          </button>
        </form>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  background: 'rgba(15,23,42,0.6)',
  border: '1px solid rgba(148,163,184,0.15)',
  borderRadius: '10px',
  color: 'white',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '12px',
  fontWeight: 600,
  display: 'block',
  marginBottom: '6px',
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale ?? 'tr', ['common'], nextI18nConfig as any)) }
})
