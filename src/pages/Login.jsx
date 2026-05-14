import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const { login } = useApp()
  const navigate = useNavigate()

  const handleLogin = () => {
    if (!email.includes('.edu') && !email.includes('@')) {
      setError('Please use a valid .edu or company email')
      return
    }
    login(email)
    navigate('/dashboard')
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo-box large" />
        <h1>Ambi</h1>
        <p className="login-subtitle">Discover and rank the best cafes to study at</p>
        <h2>Welcome to Ambi!</h2>
        <p>Sign in with your .edu email to get started</p>
        <input
          type="email"
          placeholder="you@university.edu"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          className="login-input"
        />
        {error && <p className="error-text">{error}</p>}
        <button onClick={handleLogin} className="login-btn">Sign In</button>
      </div>
    </div>
  )
}