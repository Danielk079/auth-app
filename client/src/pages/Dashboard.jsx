import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')

    if (!token || !storedUser) {
      navigate('/login')
      return
    }

    setUser(JSON.parse(storedUser))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition"
          >
            Logout
          </button>
        </div>

        {/* Welcome card */}
        <div className="bg-gray-900 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-white text-xl font-semibold">
                Welcome back, {user.username}! 
              </h2>
              <p className="text-gray-400 text-sm">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-900 rounded-2xl p-5">
            <p className="text-gray-400 text-sm mb-1">Username</p>
            <p className="text-white font-semibold">{user.username}</p>
          </div>
          <div className="bg-gray-900 rounded-2xl p-5">
            <p className="text-gray-400 text-sm mb-1">Email</p>
            <p className="text-white font-semibold">{user.email}</p>
          </div>
          <div className="bg-gray-900 rounded-2xl p-5">
            <p className="text-gray-400 text-sm mb-1">User ID</p>
            <p className="text-white font-semibold text-xs">{user._id}</p>
          </div>
          <div className="bg-gray-900 rounded-2xl p-5">
            <p className="text-gray-400 text-sm mb-1">Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-green-500 font-semibold">Active</p>
            </div>
          </div>
        </div>

        {/* Token card */}
        <div className="bg-gray-900 rounded-2xl p-5">
          <p className="text-gray-400 text-sm mb-2">Your JWT Token</p>
          <p className="text-blue-400 text-xs break-all font-mono">
            {localStorage.getItem('token')}
          </p>
        </div>

      </div>
    </div>
  )
}

export default Dashboard