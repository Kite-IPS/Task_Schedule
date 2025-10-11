import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const [email, setEmail] = useState('') 
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [remember, setRemember] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    try {
      const stored = localStorage.getItem('currentUser')
      if (stored) {
        navigate('/dashboard')
      }
    } catch (e) {}
  }, [navigate])

  useEffect(() => { }, [])

  const sanitize = {
    email: (s) => String(s || '').trim().toLowerCase().replace(/[^a-z0-9@._+-]/gi, ''),
    password: (s) => String(s || '').trim(),
  }

  const validate = () => {
    const cleanEmail = sanitize.email(email)
    const cleanPassword = sanitize.password(password)

    if (!cleanEmail) {
      setError('Please enter your email.')
      return false
    }
    if (!cleanPassword) {
      setError('Please enter your password.')
      return false
    }
    setError('')
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setError('')

    try {
      // const res = await fetch('/api/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ identifier: identifier.trim(), password }),
      // })

      const payloadEmail = sanitize.email(email)
      const payloadPassword = sanitize.password(password)

      // Mock response that resembles a real fetch Response with json()
      const res = {
        ok: true,
        status: 200,
        json: async () => ({
          user: { id: 1, name: payloadEmail.includes('@') ? payloadEmail.split('@')[0] : payloadEmail, email: payloadEmail.includes('@') ? payloadEmail : null },
          token: 'mock-jwt-token-abc123',
        }),
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.detail || 'Login failed')
      }

      // Parse response like a real fetch
      const data = await res.json()

      // On success: save currentUser (from response) and redirect to dashboard
      const currentUser = data?.user || { id: 1, name: payloadEmail.trim() }
      try {
        const storageVal = JSON.stringify({ ...currentUser, token: data?.token })
        if (remember) localStorage.setItem('currentUser', storageVal)
        else sessionStorage.setItem('currentUser', storageVal)
      } catch (e) {
        setError('Failed to store user data in browser.')
        return false
      }
      setEmail('')
      setPassword('')
      setError('')
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
  <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.card} aria-label="login-form">
        <h2 style={styles.title}>Sign in</h2>

        <label style={styles.label} htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          placeholder="you@example.com"
          autoComplete="email"
        />

        <label style={styles.label} htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          placeholder="Your password"
          autoComplete="current-password"
        />

        <div style={styles.row}>
          <label style={styles.checkboxLabel}>
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            <span style={{ marginLeft: 8 }}>Remember me</span>
          </label>
          <a href="#" style={styles.forgot}>Forgot password?</a>
        </div>

        {error && <div role="alert" style={styles.error}>{error}</div>}

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '6rem 3rem 4rem 8rem',
    backgroundImage: "url('/loginBg.jpg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  },
  card: {
    width: '520px',
    padding: '2.5rem',
    borderRadius: 8,
    boxShadow: '0 6px 20px rgba(10,10,10,0.12)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    background: 'rgba(255,255,255,0.92)'
  },
  title: { margin: 0, marginBottom: '0.5rem' },
  label: { fontSize: 14, fontWeight: 600, marginTop: '0.5rem' },
  input: {
    padding: '0.6rem 0.75rem',
    fontSize: 14,
    borderRadius: 6,
    border: '1px solid #ddd',
  },
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' },
  checkboxLabel: { display: 'inline-flex', alignItems: 'center', fontSize: 13, color: '#333' },
  forgot: { fontSize: 13, color: '#0b5fff', textDecoration: 'none' },
  button: {
    marginTop: '1rem',
    padding: '0.6rem 0.75rem',
    fontSize: 15,
    borderRadius: 6,
    cursor: 'pointer',
    background: '#0b5fff',
    color: '#fff',
    border: 'none'
  },
  error: {
    marginTop: '0.25rem',
    color: '#b00020',
    fontSize: 13,
  }
}

export default Login