import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('All fields are required')
      return
    }
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-grid-bg" />
        <div className="auth-orb" />
        <div className="auth-orb2" />
        <div className="auth-brand">
          <h1 className="auth-logo">Taskr</h1>
          <p className="auth-brand-tag">// task management system</p>
        </div>
        <div className="auth-bottom">
          <div className="auth-status-pill">
            <span className="auth-dot" />
            System online
          </div>
          <p className="auth-version">v1.0.0 — built with<br />MERN stack</p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-header">
          <h2>Welcome back</h2>
          <p className="auth-subtitle">Enter your credentials to continue</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email" type="email" name="email"
              placeholder="you@example.com"
              value={form.email} onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password" type="password" name="password"
              placeholder="••••••••"
              value={form.password} onChange={handleChange}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="spinner" /> : <>Sign In <span>→</span></>}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  )
}

export default Login