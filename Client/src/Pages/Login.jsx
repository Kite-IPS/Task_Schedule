import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../Utils/axiosInstance'
import { API_PATH } from '../Utils/apiPath'
import { Lock, Mail, Eye, EyeOff, Shield, Zap, Star, Heart, Sparkles } from 'lucide-react';


const Login = () => {
  const [email, setEmail] = useState('') 
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [remember, setRemember] = useState(false)
  const navigate = useNavigate()
  const [showImage, setShowImage] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true)


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
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
      }
      @keyframes floatRotate {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-30px) rotate(180deg); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 0.6; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.05); }
      }
      @keyframes slideInLeft {
        from {
          opacity: 0;
          transform: translateX(-50px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(50px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      /* Media queries for responsive design */
      @media (max-width: 1024px) {
        .image-section {
          display: none !important;
        }
        .form-section {
          max-width: 500px !important;
        }
      }

      @media (max-width: 768px) {
        .login-card {
          padding: 2rem 1.5rem !important;
        }
        .login-title {
          font-size: 1.75rem !important;
        }
        .content-wrapper {
          padding: 1rem !important;
        }
      }

      @media (max-width: 480px) {
        .login-card {
          padding: 1.75rem 1.25rem !important;
        }
        .login-title {
          font-size: 1.5rem !important;
        }
        .login-subtitle {
          font-size: 0.9rem !important;
        }
        .password-input {
          padding-right: 3rem !important;
        }
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

  // Toggle image section based on viewport width so mobile doesn't render the image
  useEffect(() => {
    const onResize = () => {
      try {
        setShowImage(window.innerWidth >= 1024)
      } catch (e) {
        // ignore (server-side or restricted env)
      }
    }
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])


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
      const loginRes = await axiosInstance.post(API_PATH.AUTH.LOGIN, {
        email: sanitize.email(email),
        password: sanitize.password(password),
      })


      if (!loginRes.data || !loginRes.data.token) {
        throw new Error('Invalid response from server')
      }


      const token = loginRes.data.token
      const storageKey = remember ? 'token' : null
      if (storageKey) {
        localStorage.setItem('token', token)
      }


      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
      const userRes = await axiosInstance.get(API_PATH.AUTH.INFO)


      if (!userRes.data) {
        throw new Error('Failed to fetch user information')
      }


      const userDetails = userRes.data
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


      setEmail('')
      setPassword('')
      setError('')
      navigate('/dashboard')
    } catch (err) {
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
      {/* Background Gradient */}
      <div style={styles.backgroundOverlay}></div>


      {/* Floating Icons */}
      <div style={styles.floatingIcons}>
        <div style={{...styles.iconWrapper, ...styles.icon1}}>
          <Shield style={styles.icon} size={32} />
        </div>
        <div style={{...styles.iconWrapper, ...styles.icon2}}>
          <Zap style={styles.icon} size={28} />
        </div>
        <div style={{...styles.iconWrapper, ...styles.icon3}}>
          <Star style={styles.icon} size={24} />
        </div>
        <div style={{...styles.iconWrapper, ...styles.icon4}}>
          <Heart style={styles.icon} size={30} />
        </div>
        <div style={{...styles.iconWrapper, ...styles.icon5}}>
          <Sparkles style={styles.icon} size={26} />
        </div>
        <div style={{...styles.iconWrapper, ...styles.icon6}}>
          <Lock style={styles.icon} size={28} />
        </div>
      </div>


      {/* Main Content Container */}
      <div style={styles.contentWrapper} className="content-wrapper">
        {/* Left Side - Floating Image (Desktop Only) */}
        {showImage && (
          <div style={styles.imageSection} className="image-section">
            <div style={styles.imageContainer}>
              <img 
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=700&fit=crop" 
                alt="Workspace"
                style={styles.image}
              />
              <div style={styles.imageBorder}></div>
            </div>
            
            {/* Decorative Elements */}
            <div style={{...styles.decorCircle, ...styles.decor1}}></div>
            <div style={{...styles.decorCircle, ...styles.decor2}}></div>
          </div>
        )}


        {/* Right Side - Login Form */}
        <div style={styles.formSection} className="form-section">
          <div style={styles.card} className="login-card">
            <div style={styles.header}>
              <div style={styles.iconBadge}>
                <Lock size={24} color="#667eea" />
              </div>
              <h1 style={styles.title} className="login-title">Welcome Back</h1>
              <p style={styles.subtitle} className="login-subtitle">Sign in to continue your journey</p>
            </div>


            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.fieldGroup}>
                <label style={styles.label} htmlFor="email">
                  Email Address
                </label>
                <div style={styles.inputWrapper}>
                  <Mail size={18} style={styles.inputIcon} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={styles.input}
                    placeholder="Enter your email"
                    autoComplete="email"
                    disabled={loading}
                  />
                </div>
              </div>


              <div style={styles.fieldGroup}>
                <label style={styles.label} htmlFor="password">
                  Password
                </label>
                <div style={styles.inputWrapper}>
                  <Lock size={18} style={styles.inputIcon} />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={styles.passwordInput}
                    className="password-input"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
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
                <div style={styles.errorContainer}>
                  <span style={styles.errorIcon}>⚠</span>
                  <span style={styles.error}>{error}</span>
                </div>
              )}


              <button 
                type="submit" 
                style={{
                  ...styles.button,
                  opacity: loading ? 0.8 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
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


              <div style={styles.divider}>
                <span style={styles.dividerText}>New to our platform?</span>
              </div>


              <a href="#" style={styles.signupLink}>
                Create an account
              </a>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}


const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#0a0a0a',
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, #1a0000 0%, #000000 25%, #1a0000 50%, #0a0a0a 75%, #000000 100%)',
    backgroundSize: '400% 400%',
    animation: 'gradientShift 15s ease infinite',
    opacity: 1,
    zIndex: 0,
  },
  floatingIcons: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 1,
  },
  iconWrapper: {
    position: 'absolute',
    padding: '1rem',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  icon: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  icon1: {
    top: '10%',
    left: '10%',
    animation: 'float 6s ease-in-out infinite',
  },
  icon2: {
    top: '20%',
    right: '15%',
    animation: 'floatRotate 8s ease-in-out infinite',
    animationDelay: '1s',
  },
  icon3: {
    bottom: '15%',
    left: '8%',
    animation: 'pulse 4s ease-in-out infinite',
    animationDelay: '0.5s',
  },
  icon4: {
    top: '60%',
    right: '10%',
    animation: 'float 7s ease-in-out infinite',
    animationDelay: '2s',
  },
  icon5: {
    bottom: '25%',
    right: '20%',
    animation: 'floatRotate 9s ease-in-out infinite',
  },
  icon6: {
    top: '40%',
    left: '5%',
    animation: 'pulse 5s ease-in-out infinite',
    animationDelay: '1.5s',
  },
  contentWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4rem',
    maxWidth: '1200px',
    width: '100%',
    position: 'relative',
    zIndex: 2,
  },
  imageSection: {
    flex: 1,
    display: 'block',
    position: 'relative',
    animation: 'slideInLeft 0.8s ease-out',
  },
  imageContainer: {
    position: 'relative',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    animation: 'float 6s ease-in-out infinite',
  },
  image: {
    width: '100%',
    height: 'auto',
    display: 'block',
    borderRadius: '24px',
  },
  imageBorder: {
    position: 'absolute',
    top: '-10px',
    left: '-10px',
    right: '-10px',
    bottom: '-10px',
    borderRadius: '24px',
    background: 'linear-gradient(135deg, #dc2626, #991b1b, #dc2626)',
    zIndex: -1,
    opacity: 0.5,
    filter: 'blur(20px)',
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: '50%',
    background: 'rgba(220, 38, 38, 0.1)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(220, 38, 38, 0.2)',
  },
  decor1: {
    width: '150px',
    height: '150px',
    top: '-50px',
    right: '-50px',
    animation: 'pulse 4s ease-in-out infinite',
  },
  decor2: {
    width: '100px',
    height: '100px',
    bottom: '-30px',
    left: '-30px',
    animation: 'pulse 5s ease-in-out infinite',
    animationDelay: '1s',
  },
  formSection: {
    flex: 1,
    maxWidth: '480px',
    width: '100%',
    animation: 'slideInRight 0.8s ease-out',
  },
  card: {
    padding: '3rem',
    borderRadius: '24px',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.125)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2.5rem',
  },
  iconBadge: {
    width: '60px',
    height: '60px',
    margin: '0 auto 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '16px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '2px solid rgba(102, 126, 234, 0.3)',
    backdropFilter: 'blur(10px)',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 0 0.5rem 0',
    letterSpacing: '-0.025em',
  },
  subtitle: {
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.7)',
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
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: '0.025em',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '1rem',
    color: 'rgba(255, 255, 255, 0.5)',
    pointerEvents: 'none',
    zIndex: 1,
  },
  input: {
    width: '100%',
    padding: '0.875rem 1rem 0.875rem 3rem',
    fontSize: '1rem',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    transition: 'all 0.2s ease-in-out',
    outline: 'none',
    color: '#ffffff',
  },
  passwordInput: {
    width: '100%',
    padding: '0.875rem 3.5rem 0.875rem 3rem',
    fontSize: '1rem',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    transition: 'all 0.2s ease-in-out',
    outline: 'none',
    color: '#ffffff',
  },
  eyeButton: {
    position: 'absolute',
    right: '1rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'rgba(255, 255, 255, 0.5)',
    padding: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s',
    zIndex: 1,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '0.25rem',
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
    accentColor: '#667eea',
    cursor: 'pointer',
  },
  checkboxLabel: {
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  forgot: {
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.9)',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'color 0.2s ease',
  },
  button: {
    marginTop: '0.5rem',
    padding: '1rem 1.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#ffffff',
    border: 'none',
    transition: 'all 0.2s ease-in-out',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
    letterSpacing: '0.025em',
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
    padding: '0.875rem 1rem',
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(220, 38, 38, 0.3)',
    borderRadius: '12px',
  },
  errorIcon: {
    fontSize: '1rem',
    color: '#fca5a5',
  },
  error: {
    fontSize: '0.875rem',
    color: '#fca5a5',
    fontWeight: '500',
  },
  divider: {
    position: 'relative',
    textAlign: 'center',
    marginTop: '0.5rem',
  },
  dividerText: {
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '500',
  },
  signupLink: {
    textAlign: 'center',
    fontSize: '0.9375rem',
    color: 'rgba(255, 255, 255, 0.9)',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'color 0.2s',
  },
}


export default Login
