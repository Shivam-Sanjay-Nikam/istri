import React, { useState } from 'react'
import { supabase } from '../supabase/client'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import InputField from '../components/InputField'
import Loader from '../components/Loader'
import { Lock } from 'lucide-react'

export default function AdminLogin() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            navigate('/admin-dashboard')
        }
    }

    return (
        <Layout>
            <div className="max-w-md mx-auto py-12">
                <div className="bg-white p-8 rounded-lg shadow-md border border-slate-200">
                    <div className="flex justify-center mb-6">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Lock className="text-blue-600" size={24} />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-center text-slate-900 mb-6">Admin Login</h2>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="py-8">
                            <Loader small />
                            <p className="text-center text-sm text-slate-500 mt-2">Verifying credentials...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleLogin} className="space-y-6">
                            <InputField
                                id="email"
                                label="Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <InputField
                                id="password"
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                            >
                                Sign In
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </Layout>
    )
}
