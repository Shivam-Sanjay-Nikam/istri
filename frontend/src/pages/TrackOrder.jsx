import React, { useState } from 'react'
import Layout from '../components/Layout'
import InputField from '../components/InputField'
import OrderCard from '../components/OrderCard'
import { getOrdersByPhone } from '../api/orderApi'
import { Search } from 'lucide-react'

export default function TrackOrder() {
    const [phone, setPhone] = useState('')
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)
    const [error, setError] = useState(null)

    const handleTrack = async (e) => {
        e.preventDefault()
        if (!phone) return

        try {
            setLoading(true)
            setError(null)
            const data = await getOrdersByPhone(phone)
            setOrders(data || [])
            setSearched(true)
        } catch (err) {
            setError('Failed to fetch orders.')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Layout>
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-slate-900 mb-6">Track Order</h1>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8">
                    <form onSubmit={handleTrack} className="flex gap-4 items-end">
                        <div className="flex-grow">
                            <InputField
                                id="track-phone"
                                label="Enter Phone Number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition flex items-center gap-2 mb-[1px]"
                        >
                            <Search size={18} />
                            {loading ? 'Searching...' : 'Track'}
                        </button>
                    </form>
                </div>

                {error && <div className="text-red-600 mb-4">{error}</div>}

                <div className="space-y-4">
                    {searched && orders.length === 0 && (
                        <p className="text-center text-slate-500 py-8">No orders found for this number.</p>
                    )}

                    {orders.map(order => (
                        <OrderCard key={order.id} order={order} />
                    ))}
                </div>
            </div>
        </Layout>
    )
}
