import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useTheme } from '../context/ThemeContext'

function AdminDashboard() {
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()
  const [admin, setAdmin] = useState(null)
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')

    if (!token || !storedUser) {
      navigate('/login')
      return
    }

    const parsedUser = JSON.parse(storedUser)

    if (parsedUser.role !== 'admin') {
      navigate('/dashboard')
      return
    }

    setAdmin(parsedUser)
    fetchData(token)
  }, [])

  const fetchData = async (token) => {
    try {
      const config = {
        headers: { authorization: `Bearer ${token}` }
      }

      const [statsRes, usersRes] = await Promise.all([
        axios.get('https://auth-app-backend-7t1a.onrender.com/api/admin/stats', config),
        axios.get('https://auth-app-backend-7t1a.onrender.com/api/admin/users', config),
      ])

      setStats(statsRes.data)
      setUsers(usersRes.data)
    } catch (error) {
      setError('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return

    try {
      const token = localStorage.getItem('token')
      await axios.delete(
        `https://auth-app-backend-7t1a.onrender.com/api/admin/users/${userId}`,
        { headers: { authorization: `Bearer ${token}` } }
      )
      setUsers(users.filter(user => user._id !== userId))
      setSelectedUser(null)
    } catch (error) {
      setError('Failed to delete user')
    }
  }

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

  const formatDate = (date) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleString()
  }

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A'
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-950' : 'bg-gray-100'}`}>
        <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Loading...
        </p>
      </div>
    )
  }

  return (
    <div className={`min-h-screen px-4 py-8 transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-gray-100'}`}>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className={`fixed top-10 right-25 p-2 rounded-full text-xl transition ${isDark ? 'bg-gray-800 text-yellow-400' : 'bg-white text-gray-800 shadow'}`}
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Admin Dashboard
            </h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Welcome back, {admin?.username} 
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition"
          >
            Logout
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {/* Stats cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className={`rounded-2xl p-5 transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-white shadow'}`}>
              <p className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Total Users
              </p>
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalUsers}
              </p>
            </div>
            <div className={`rounded-2xl p-5 transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-white shadow'}`}>
              <p className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Total Admins
              </p>
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalAdmins}
              </p>
            </div>
            <div className={`rounded-2xl p-5 transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-white shadow'}`}>
              <p className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Active (7 days)
              </p>
              <p className={`text-3xl font-bold text-green-500`}>
                {stats.recentlyActive}
              </p>
            </div>
            <div className={`rounded-2xl p-5 transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-white shadow'}`}>
              <p className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Latest Joined
              </p>
              <p className={`text-3xl font-bold text-blue-500`}>
                {stats.latestUsers.length}
              </p>
            </div>
          </div>
        )}

        {/* Users table */}
        <div className={`rounded-2xl overflow-hidden transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-white shadow'}`}>
          <div className="p-6 border-b border-gray-700">
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              All Users ({users.length})
            </h2>
          </div>

          {users.length === 0 ? (
            <div className="p-6">
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                No users found
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`text-left text-sm ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
                    <th className="px-6 py-3">User</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Last Login</th>
                    <th className="px-6 py-3">Last Duration</th>
                    <th className="px-6 py-3">Joined</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      className={`border-t text-sm transition-colors ${isDark ? 'border-gray-800 hover:bg-gray-800' : 'border-gray-100 hover:bg-gray-50'}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {user.username}
                          </span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {user.email}
                      </td>
                      <td className={`px-6 py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatDate(user.lastLogin)}
                      </td>
                      <td className={`px-6 py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatDuration(user.lastLoginDuration)}
                      </td>
                      <td className={`px-6 py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* User detail modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-4 z-50">
            <div className={`w-full max-w-md rounded-2xl p-6 transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>

              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  User Details
                </h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className={`text-xl ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}
                >
                  ✕
                </button>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-bold">
                    {selectedUser.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {selectedUser.username}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {selectedUser.email}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-6">
                <div className={`flex justify-between py-2 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>User ID</span>
                  <span className={`text-xs font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {selectedUser._id}
                  </span>
                </div>
                <div className={`flex justify-between py-2 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Joined</span>
                  <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatDate(selectedUser.createdAt)}
                  </span>
                </div>
                <div className={`flex justify-between py-2 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Last Login</span>
                  <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatDate(selectedUser.lastLogin)}
                  </span>
                </div>
                <div className={`flex justify-between py-2 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Last Session</span>
                  <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatDuration(selectedUser.lastLoginDuration)}
                  </span>
                </div>
                <div className={`flex justify-between py-2 ${isDark ? '' : ''}`}>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Sessions</span>
                  <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {selectedUser.loginHistory?.length || 0}
                  </span>
                </div>
              </div>

              {/* Login history */}
              {selectedUser.loginHistory?.length > 0 && (
                <div>
                  <p className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Login History
                  </p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedUser.loginHistory.slice().reverse().map((session, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg text-xs ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
                      >
                        <div className="flex justify-between mb-1">
                          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Login</span>
                          <span className={isDark ? 'text-white' : 'text-gray-900'}>
                            {formatDate(session.loginTime)}
                          </span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Logout</span>
                          <span className={isDark ? 'text-white' : 'text-gray-900'}>
                            {formatDate(session.logoutTime)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Duration</span>
                          <span className="text-blue-400">
                            {formatDuration(session.duration)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Delete button */}
              <button
                onClick={() => handleDelete(selectedUser._id)}
                className="w-full mt-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition"
              >
                Delete User
              </button>

            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default AdminDashboard