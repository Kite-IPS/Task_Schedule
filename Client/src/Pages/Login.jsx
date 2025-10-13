import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../Utils/axiosInstance'
import { API_PATH } from '../Utils/apiPath'

const Login = () => {
  const [email, setEmail] = useState('') 
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [remember, setRemember] = useState(false)
  const navigate = useNavigate()

  // Add CSS animations
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes float1 {
        0%, 100% { transform: translateY(0px) translateX(0px); }
        25% { transform: translateY(-20px) translateX(10px); }
        50% { transform: translateY(-10px) translateX(-10px); }
        75% { transform: translateY(-30px) translateX(5px); }
      }
      @keyframes float2 {
        0%, 100% { transform: translateY(0px) translateX(0px); }
        33% { transform: translateY(-15px) translateX(-8px); }
        66% { transform: translateY(-25px) translateX(12px); }
      }
      @keyframes float3 {
        0%, 100% { transform: translateY(0px) translateX(0px); }
        50% { transform: translateY(-18px) translateX(-15px); }
      }
    `
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  // Check if user is already logged in
  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser')
    if (currentUser) {
      navigate('/dashboard')
    }
  }, [navigate])

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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address.')
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
      // Step 1: Login and get token
      const loginRes = await axiosInstance.post(API_PATH.AUTH.LOGIN, {
        email: sanitize.email(email),
        password: sanitize.password(password),
      })

      if (!loginRes.data || !loginRes.data.token) {
        throw new Error('Invalid response from server')
      }

      const token = loginRes.data.token

      // Step 2: Store token temporarily to make authenticated request
      const storageKey = remember ? 'token' : null
      if (storageKey) {
        localStorage.setItem('token', token)
      }

      // Update axios instance with new token for the next request
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`

      // Step 3: Fetch user details from /info/ endpoint
      const userRes = await axiosInstance.get(API_PATH.AUTH.INFO)

      if (!userRes.data) {
        throw new Error('Failed to fetch user information')
      }

      const userDetails = userRes.data

      // Step 4: Store user data and token
      const userData = {
        ...userDetails,
        token: token,
        email: sanitize.email(email),
      }

      try {
        const storageValue = JSON.stringify(userData)
        if (remember) {
          localStorage.setItem('currentUser', storageValue)
          localStorage.setItem('token', token)
        } else {
          sessionStorage.setItem('currentUser', storageValue)
          sessionStorage.setItem('token', token)
        }
      } catch (e) {
        setError('Failed to store user data.')
        return
      }

      // Step 5: Clear form and redirect
      setEmail('')
      setPassword('')
      setError('')
      navigate('/dashboard')
    } catch (err) {
      // Clear auth headers on error
      delete axiosInstance.defaults.headers.common['Authorization']
      localStorage.removeItem('token')
      sessionStorage.removeItem('token')

      if (err.response?.data?.detail) {
        setError(err.response.data.detail)
      } else if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else if (err.message) {
        setError(err.message)
      } else {
        setError('Login failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      {/* Floating background elements */}
      <div style={styles.floatingElements}>
        <div style={{...styles.floatingCircle, ...styles.circle1}}></div>
        <div style={{...styles.floatingCircle, ...styles.circle2}}></div>
        <div style={{...styles.floatingCircle, ...styles.circle3}}></div>
        <div style={{...styles.floatingCircle, ...styles.circle4}}></div>
      </div>

      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Welcome</h1>
          <p style={styles.subtitle}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form} aria-label="login-form">
          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              className='text-gray-900'
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                ...styles.input,
                ...(email ? styles.inputFilled : {})
              }}
              placeholder="Enter your email"
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className='text-gray-900'
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                ...styles.input,
                ...(password ? styles.inputFilled : {})
              }}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <div style={styles.row}>
            <label style={styles.checkboxContainer}>
              <input 
                type="checkbox" 
                checked={remember} 
                onChange={(e) => setRemember(e.target.checked)}
                style={styles.checkbox}
                disabled={loading}
              />
              <span style={styles.checkboxLabel}>Remember me</span>
            </label>
            <a href="#" style={styles.forgot}>Forgot password?</a>
          </div>

          {error && (
            <div role="alert" style={styles.errorContainer}>
              <span style={styles.errorIcon}>⚠</span>
              <span style={styles.error}>{error}</span>
            </div>
          )}

          <button 
            type="submit" 
            style={{
              ...styles.button,
              ...(loading ? styles.buttonLoading : {}),
              opacity: loading ? 0.8 : 1
            }}
            disabled={loading}
          >
            {loading ? (
              <span style={styles.buttonContent}>
                <span style={styles.spinner}></span>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
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
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
    backgroundSize: '400% 400%',
    animation: 'gradientShift 15s ease infinite',
    position: 'relative',
    overflow: 'hidden',
  },
  card: {
    width: '480px',
    padding: '3rem 2.5rem',
    borderRadius: '16px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.3)',
    position: 'relative',
    zIndex: 2,
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1a202c',
    margin: '0 0 0.5rem 0',
    letterSpacing: '-0.025em',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#718096',
    margin: 0,
    fontWeight: '400',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
    letterSpacing: '0.025em',
  },
  input: {
    padding: '0.875rem 1rem',
    fontSize: '1rem',
    borderRadius: '12px',
    border: '2px solid #e2e8f0',
    backgroundColor: '#ffffff',
    transition: 'all 0.2s ease-in-out',
    outline: 'none',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  inputFilled: {
    borderColor: '#0b5fff',
    boxShadow: '0 0 0 3px rgba(11, 95, 255, 0.1)',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '0.5rem',
  },
  checkboxContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
  },
  checkbox: {
    width: '1.125rem',
    height: '1.125rem',
    accentColor: '#0b5fff',
  },
  checkboxLabel: {
    fontSize: '0.875rem',
    color: '#4a5568',
    fontWeight: '500',
  },
  forgot: {
    fontSize: '0.875rem',
    color: '#0b5fff',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'color 0.2s ease',
  },
  button: {
    marginTop: '1rem',
    padding: '0.875rem 1.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    borderRadius: '12px',
    cursor: 'pointer',
    background: 'linear-gradient(135deg, #0b5fff 0%, #1e40af 100%)',
    color: '#ffffff',
    border: 'none',
    transition: 'all 0.2s ease-in-out',
    boxShadow: '0 4px 12px rgba(11, 95, 255, 0.3)',
    letterSpacing: '0.025em',
  },
  buttonLoading: {
    cursor: 'not-allowed',
  },
  buttonContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  spinner: {
    width: '1rem',
    height: '1rem',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    marginTop: '0.5rem',
  },
  errorIcon: {
    fontSize: '1rem',
    color: '#dc2626',
  },
  error: {
    fontSize: '0.875rem',
    color: '#dc2626',
    fontWeight: '500',
  },
  floatingElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 1,
  },
  floatingCircle: {
    position: 'absolute',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
  },
  circle1: {
    width: '120px',
    height: '120px',
    top: '10%',
    right: '20%',
    animation: 'float1 8s ease-in-out infinite',
  },
  circle2: {
    width: '80px',
    height: '80px',
    top: '60%',
    right: '10%',
    animation: 'float2 6s ease-in-out infinite',
  },
  circle3: {
    width: '60px',
    height: '60px',
    top: '30%',
    left: '10%',
    animation: 'float3 7s ease-in-out infinite',
  },
  circle4: {
    width: '100px',
    height: '100px',
    bottom: '15%',
    left: '30%',
    animation: 'float1 9s ease-in-out infinite reverse',
  }
}

export default Login