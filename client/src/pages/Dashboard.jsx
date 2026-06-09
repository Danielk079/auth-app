import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useTheme } from '../context/ThemeContext'

function Dashboard() {
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')

    if (!token || !storedUser) {
      navigate('/login')
      return
    }

    const parsedUser = JSON.parse(storedUser)

    // If admin tries to access user dashboard, redirect to admin dashboard
    if (parsedUser.role === 'admin') {
      navigate('/admin/dashboard')
      return
    }

    setUser(parsedUser)
  }, [])

  const handleLogout = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'))
      await axios.post('https://auth-app-backend-7t1a.onrender.com/api/auth/logout', {
        userId: storedUser._id,
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      navigate('/login')
    }
  }

  if (!user) return null

  return (
    <div className={`min-h-screen px-4 py-8 transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-gray-100'}`}>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className={`fixed top-7 right-30 p-2 rounded-full text-xl transition ${isDark ? 'bg-gray-800 text-yellow-400' : 'bg-white text-gray-800 shadow'}`}
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition"
          >
            Logout
          </button>
        </div>

        {/* Welcome card */}
        <div className={`rounded-2xl p-6 mb-6 transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-white shadow'}`}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Welcome back, {user.username}! 👋
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className={`rounded-2xl p-5 transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-white shadow'}`}>
            <p className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Username
            </p>
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {user.username}
            </p>
          </div>
          <div className={`rounded-2xl p-5 transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-white shadow'}`}>
            <p className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Email
            </p>
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {user.email}
            </p>
          </div>
          <div className={`rounded-2xl p-5 transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-white shadow'}`}>
            <p className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Role
            </p>
            <p className={`font-semibold capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {user.role}
            </p>
          </div>
          <div className={`rounded-2xl p-5 transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-white shadow'}`}>
            <p className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Status
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-green-500 font-semibold">Active</p>
            </div>
          </div>
        </div>

        {/* User ID card */}
        <div className={`rounded-2xl p-5 transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-white shadow'}`}>
          <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            User ID
          </p>
          <p className={`text-xs font-mono break-all ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
            {user._id}
          </p>
        </div>

      </div>
    </div>
  )
}

export default Dashboard