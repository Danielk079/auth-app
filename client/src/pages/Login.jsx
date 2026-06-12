import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { useTheme } from '../context/ThemeContext'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDark, toggleTheme } = useTheme()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Pick up success message from Register page
  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message)
    }
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await axios.post(
        'https://auth-app-backend-7t1a.onrender.com/api/auth/login',
        formData
      )

      console.log('User role:', response.data.role) // ← add this line
      console.log('Full response:', response.data)  // ← and this

      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify({
        _id: response.data._id,
        username: response.data.username,
        email: response.data.email,
        role: response.data.role,
      }))

      if (response.data.role === 'admin') {
        navigate('/admin/dashboard')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-gray-100'}`}>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className={`fixed top-4 right-4 p-2 rounded-full text-xl transition ${isDark ? 'bg-gray-800 text-yellow-400' : 'bg-white text-gray-800 shadow'}`}
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      <div className={`w-full max-w-md rounded-2xl shadow-xl p-8 transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Welcome Back
          </h1>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Sign in to your account
          </p>
        </div>

        {/* Success message */}
        {success && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500 rounded-lg">
            <p className="text-green-500 text-sm">{success}</p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-blue-500 transition ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-900 border-gray-300'}`}
            />
          </div>

                    {/* Password */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-blue-500 transition pr-12 ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-900 border-gray-300'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-lg transition ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

        </form>

        {/* Register link */}
        <p className={`text-center mt-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">
            Create one
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Login