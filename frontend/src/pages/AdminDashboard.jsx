import React, { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import InputField from '../components/InputField'
import OrderCard from '../components/OrderCard'
import Modal from '../components/Modal'
import Toast from '../components/Toast'
import Loader from '../components/Loader'
import { adminGetOrders, adminUpdateStatus, adminAddSlot, adminRemoveSlot } from '../api/adminApi'
import { getSlots } from '../api/slotApi'
import { Trash2, Plus, LogOut } from 'lucide-react'

export default function AdminDashboard() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [orders, setOrders] = useState([])
    const [slots, setSlots] = useState({ pickup: [], dropoff: [] })
    const [activeTab, setActiveTab] = useState('orders') // 'orders' or 'slots'

    // UI States
    const [toast, setToast] = useState(null)
    const [isAddSlotOpen, setIsAddSlotOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [slotToDelete, setSlotToDelete] = useState(null)

    // Slot Form
    const [newSlot, setNewSlot] = useState({
        slot_type: 'pickup',
        date: '',
        startTime: '',
        endTime: ''
    })
    const [isRecurring, setIsRecurring] = useState(false) // New State

    // Auth check
    useEffect(() => {
        // Check for active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                navigate('/admin-login')
            } else {
                loadData()
            }
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                navigate('/admin-login')
            }
        })

        return () => subscription.unsubscribe()
    }, [navigate])

    const loadData = async () => {
        setLoading(true)
        try {
            const [orderData, slotData] = await Promise.all([
                adminGetOrders(),
                getSlots()
            ])
            setOrders(orderData || [])
            setSlots(slotData || { pickup: [], dropoff: [] })
        } catch (error) {
            console.error('Error loading data:', error)
            showToast('Failed to load dashboard data.', 'error')
        } finally {
            setLoading(false)
        }
    }

    const showToast = (message, type = 'success') => {
        setToast({ message, type })
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
    }

    const handleUpdateStatus = async (orderId, newStatus) => {
        // Optimistic Update
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
        showToast(`Order status updated to ${newStatus}`)

        try {
            await adminUpdateStatus(orderId, newStatus)
        } catch (error) {
            console.error(error)
            showToast('Failed to update status', 'error')
            // Revert on failure
            loadData()
        }
    }

    const formatTime = (timeStr) => {
        if (!timeStr) return ''
        const [hours, minutes] = timeStr.split(':')
        const h = parseInt(hours)
        const ampm = h >= 12 ? 'PM' : 'AM'
        const h12 = h % 12 || 12
        return `${h12}:${minutes} ${ampm}`
    }

    const handleAddSlot = async (e) => {
        e.preventDefault()
        if (!newSlot.startTime || !newSlot.endTime) {
            showToast('Please select both start and end times', 'error')
            return
        }

        const timeRange = `${formatTime(newSlot.startTime)} - ${formatTime(newSlot.endTime)}`
        const slotPayload = {
            slot_type: newSlot.slot_type,
            date: newSlot.date,
            time: timeRange,
            repeat_days: isRecurring ? 30 : 0
        }

        // Optimistic UI Update (Show at least the first one immediately)
        const optimisticId = Math.random().toString(36).substr(2, 9)
        const optimisticSlot = {
            slot_type: newSlot.slot_type,
            date: newSlot.date,
            time: timeRange,
            id: optimisticId,
            is_active: true
        }

        setSlots(prev => ({
            ...prev,
            [newSlot.slot_type]: [...(prev[newSlot.slot_type] || []), optimisticSlot]
        }))

        showToast(isRecurring ? 'Adding recurring slots (this may take a moment)...' : 'Slot added (saving...)')
        setIsAddSlotOpen(false)
        setNewSlot({ slot_type: 'pickup', date: '', startTime: '', endTime: '' })
        setIsRecurring(false)

        try {
            await adminAddSlot(slotPayload)
            showToast(isRecurring ? '30 days of slots added!' : 'Slot saved successfully!')
            // Reload to get real IDs and all generated slots
            const updatedSlots = await getSlots()
            setSlots(updatedSlots)
        } catch (error) {
            console.error(error)
            showToast('Failed to add slot', 'error')
            // Revert
            const updatedSlots = await getSlots()
            setSlots(updatedSlots)
        }
    }

    const confirmDeleteSlot = (id) => {
        setSlotToDelete(id)
        setIsDeleteModalOpen(true)
    }

    const handleRemoveSlot = async () => {
        if (!slotToDelete) return

        // Optimistic Update
        const id = slotToDelete
        setSlots(prev => {
            const newPickup = prev.pickup.filter(s => s.id !== id)
            const newDropoff = prev.dropoff.filter(s => s.id !== id)
            return { pickup: newPickup, dropoff: newDropoff }
        })

        showToast('Slot removed')
        setIsDeleteModalOpen(false)

        try {
            await adminRemoveSlot(id)
        } catch (error) {
            console.error(error)
            showToast('Failed to remove slot', 'error')
            // Revert
            loadData()
        }
    }

    // Stats calculation
    const today = new Date().toISOString().split('T')[0]
    const todaysOrders = orders.filter(o => o.created_at.startsWith(today))
    const todaysIncome = todaysOrders.reduce((sum, order) => sum + (order.num_clothes * 8), 0)

    if (loading) return <Layout><Loader /></Layout>

    return (
        <Layout>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Admin Dashboard</h1>
                <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-md text-sm font-medium transition-colors hover:bg-red-100">
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
                <div className="space-y-6">
                    <div className="flex justify-end">
                        <button
                            onClick={() => setIsAddSlotOpen(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 flex items-center gap-2 shadow-sm"
                        >
                            <Plus size={20} /> Add New Slot
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                                            onClick={() => confirmDeleteSlot(slot.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
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
                                            onClick={() => confirmDeleteSlot(slot.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
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

            {/* Modals */}
            <Modal isOpen={isAddSlotOpen} onClose={() => setIsAddSlotOpen(false)} title="Add New Slot">
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
                        className="w-full" // Explicit width
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <InputField
                            id="slot-start-time"
                            label="Start Time"
                            type="time"
                            value={newSlot.startTime}
                            onChange={e => setNewSlot({ ...newSlot, startTime: e.target.value })}
                            required
                        />
                        <InputField
                            id="slot-end-time"
                            label="End Time"
                            type="time"
                            value={newSlot.endTime}
                            onChange={e => setNewSlot({ ...newSlot, endTime: e.target.value })}
                            required
                        />
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="recurring"
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                            checked={isRecurring}
                            onChange={e => setIsRecurring(e.target.checked)}
                        />
                        <label htmlFor="recurring" className="text-sm text-slate-700 select-none cursor-pointer">
                            Repeat daily for next 30 days
                        </label>
                    </div>
                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={() => setIsAddSlotOpen(false)}
                            className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm"
                        >
                            Add Slot
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Remove Slot">
                <div className="space-y-4">
                    <p className="text-slate-600">Are you sure you want to remove this slot? This action cannot be undone.</p>
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleRemoveSlot}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-sm"
                        >
                            Remove
                        </button>
                    </div>
                </div>
            </Modal>

        </Layout>
    )
}
