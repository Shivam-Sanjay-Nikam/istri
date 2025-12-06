import React, { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import InputField from '../components/InputField'
import OrderCard from '../components/OrderCard'
import { adminGetOrders, adminUpdateStatus, adminAddSlot, adminRemoveSlot } from '../api/adminApi'
import { getSlots } from '../api/slotApi'
import { Trash2, Plus, LogOut } from 'lucide-react'

export default function AdminDashboard() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [orders, setOrders] = useState([])
    const [slots, setSlots] = useState({ pickup: [], dropoff: [] })
    const [activeTab, setActiveTab] = useState('orders') // 'orders' or 'slots'

    // Slot Form
    const [newSlot, setNewSlot] = useState({
        slot_type: 'pickup',
        date: '',
        time: ''
    })

    // Auth check
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                navigate('/admin-login')
            } else {
                loadData()
            }
        })
    }, [navigate])

    const loadData = async () => {
        setLoading(true)
        try {
            const [orderData, slotData] = await Promise.all([
                adminGetOrders(),
                getSlots() // This gets only active slots. Admin might want all, but for removal active is fine.
            ])
            setOrders(orderData || [])
            setSlots(slotData || { pickup: [], dropoff: [] })
        } catch (error) {
            console.error('Error loading data:', error)
            alert('Failed to load dashboard data.')
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/admin-login')
    }

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await adminUpdateStatus(orderId, newStatus)
            // Optimistic update or reload
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
        } catch (error) {
            console.error(error)
            alert('Failed to update status')
        }
    }

    const handleAddSlot = async (e) => {
        e.preventDefault()
        try {
            await adminAddSlot(newSlot)
            alert('Slot added!')
            setNewSlot({ ...newSlot, time: '' }) // Reset time, keep date/type
            const updatedSlots = await getSlots()
            setSlots(updatedSlots)
        } catch (error) {
            console.error(error)
            alert('Failed to add slot')
        }
    }

    const handleRemoveSlot = async (id) => {
        if (!confirm('Are you sure you want to remove this slot?')) return
        try {
            await adminRemoveSlot(id)
            const updatedSlots = await getSlots()
            setSlots(updatedSlots)
        } catch (error) {
            console.error(error)
            alert('Failed to remove slot')
        }
    }

    // Stats calculation
    const today = new Date().toISOString().split('T')[0]
    const todaysOrders = orders.filter(o => o.created_at.startsWith(today))
    const todaysIncome = todaysOrders.reduce((sum, order) => sum + (order.num_clothes * 8), 0)

    if (loading) return <Layout><div className="text-center py-20">Loading Dashboard...</div></Layout>

    return (
        <Layout>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Admin Dashboard</h1>
                <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-md text-sm font-medium">
                    <LogOut size={18} /> Logout
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                    <p className="text-sm font-medium text-slate-500 uppercase">Today's Orders</p>
                    <p className="text-2xl font-bold text-slate-900">{todaysOrders.length}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                    <p className="text-sm font-medium text-slate-500 uppercase">Today's Income</p>
                    <p className="text-2xl font-bold text-green-600">₹{todaysIncome}</p>
                </div>
            </div>

            <div className="mb-6 flex space-x-4 border-b border-slate-200 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`pb-2 px-1 whitespace-nowrap ${activeTab === 'orders' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-slate-500'}`}
                >
                    Active Orders
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`pb-2 px-1 whitespace-nowrap ${activeTab === 'history' ? 'border-b-2 border-green-500 text-green-600 font-medium' : 'text-slate-500'}`}
                >
                    History (Paid)
                </button>
                <button
                    onClick={() => setActiveTab('slots')}
                    className={`pb-2 px-1 whitespace-nowrap ${activeTab === 'slots' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-slate-500'}`}
                >
                    Manage Slots
                </button>
            </div>

            {activeTab === 'orders' && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold mb-4">Active Orders</h2>
                    {orders.filter(o => o.status !== 'Paid').length === 0 && <p className="text-slate-500">No active orders.</p>}
                    {orders.filter(o => o.status !== 'Paid').map(order => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            isAdmin
                            onUpdateStatus={handleUpdateStatus}
                        />
                    ))}
                </div>
            )}

            {activeTab === 'history' && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold mb-4">Paid / Completed Orders</h2>
                    {orders.filter(o => o.status === 'Paid').length === 0 && <p className="text-slate-500">No paid orders yet.</p>}
                    {orders.filter(o => o.status === 'Paid').map(order => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            isAdmin
                            onUpdateStatus={handleUpdateStatus}
                        />
                    ))}
                </div>
            )}

            {activeTab === 'slots' && (
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="w-full lg:w-1/3">
                        <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200 sticky top-24">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Plus size={20} className="text-blue-500" /> Add New Slot
                            </h3>
                            <form onSubmit={handleAddSlot} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                    <select
                                        className="block w-full rounded-md border-slate-300 shadow-sm border p-2 bg-white"
                                        value={newSlot.slot_type}
                                        onChange={e => setNewSlot({ ...newSlot, slot_type: e.target.value })}
                                    >
                                        <option value="pickup">Pickup</option>
                                        <option value="dropoff">Dropoff</option>
                                    </select>
                                </div>
                                <InputField
                                    id="slot-date"
                                    label="Date"
                                    type="date"
                                    value={newSlot.date}
                                    onChange={e => setNewSlot({ ...newSlot, date: e.target.value })}
                                    required
                                />
                                <InputField
                                    id="slot-time"
                                    label="Time Range"
                                    placeholder="e.g. 9:00 AM - 12:00 PM"
                                    value={newSlot.time}
                                    onChange={e => setNewSlot({ ...newSlot, time: e.target.value })}
                                    required
                                />
                                <button className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 font-medium transition shadow-sm">
                                    Add Slot
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div>
                            <h3 className="text-lg font-bold mb-2 text-slate-700">Active Pickup Slots</h3>
                            <div className="bg-white rounded-lg border border-slate-200 divide-y">
                                {slots.pickup?.map(slot => (
                                    <div key={slot.id} className="p-4 flex justify-between items-center hover:bg-slate-50">
                                        <div>
                                            <div className="font-medium text-slate-900">{slot.time}</div>
                                            <div className="text-sm text-slate-500">{new Date(slot.date).toLocaleDateString()}</div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveSlot(slot.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                                            title="Remove Slot"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                                {(!slots.pickup || slots.pickup.length === 0) && <div className="p-4 text-slate-500 italic">No pickup slots.</div>}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold mb-2 text-slate-700">Active Dropoff Slots</h3>
                            <div className="bg-white rounded-lg border border-slate-200 divide-y">
                                {slots.dropoff?.map(slot => (
                                    <div key={slot.id} className="p-4 flex justify-between items-center hover:bg-slate-50">
                                        <div>
                                            <div className="font-medium text-slate-900">{slot.time}</div>
                                            <div className="text-sm text-slate-500">{new Date(slot.date).toLocaleDateString()}</div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveSlot(slot.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                                            title="Remove Slot"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                                {(!slots.dropoff || slots.dropoff.length === 0) && <div className="p-4 text-slate-500 italic">No dropoff slots.</div>}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    )
}
