import { BrowserRouter, Routes, Route } from 'react-router-dom'
import BookNow from './pages/BookNow'
import TrackOrder from './pages/TrackOrder'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<BookNow />} />
                <Route path="/track" element={<TrackOrder />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
