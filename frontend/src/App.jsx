import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'

// Lazy load pages
const BookNow = lazy(() => import('./pages/BookNow'))
const TrackOrder = lazy(() => import('./pages/TrackOrder'))
const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))

function App() {
    return (
        <BrowserRouter>
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center bg-slate-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            }>
                <Routes>
                    <Route path="/" element={<BookNow />} />
                    <Route path="/track" element={<TrackOrder />} />
                    <Route path="/admin-login" element={<AdminLogin />} />
                    <Route path="/admin-dashboard" element={<AdminDashboard />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    )
}

export default App
