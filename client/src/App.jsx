import { BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  return (
   <ThemeProvider>
    <BrowserRouter>
      <Routes>
        <Route path = "/" element = {<Navigate to = "/register"/>} />
        <Route path = "/register" element = {<Register />} />
        <Route path = "/login" element = {<Login/>} />
        <Route path = "/dashboard" element={<Dashboard />} />
        <Route path = "/admin/dashboard" element = {<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
   </ThemeProvider>
  )
}

export default App