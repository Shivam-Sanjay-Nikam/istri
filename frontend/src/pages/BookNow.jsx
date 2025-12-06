import React, { useEffect, useState } from 'react'
import { getSlots } from '../api/slotApi'
import { createOrder } from '../api/orderApi'
import Layout from '../components/Layout'
import InputField from '../components/InputField'
import SlotPicker from '../components/SlotPicker'
import { useNavigate } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'

export default function BookNow() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [slots, setSlots] = useState({ pickup: [], dropoff: [] })

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        num_clothes: '',
        pickup_slot_id: '',
        dropoff_slot_id: ''
    })

    const [error, setError] = useState(null)

    const [availableDropoffSlots, setAvailableDropoffSlots] = useState([])

    useEffect(() => {
        loadSlots()
    }, [])

    useEffect(() => {
        if (!formData.pickup_slot_id || !slots.pickup || !slots.dropoff) {
            setAvailableDropoffSlots(slots.dropoff || [])
            return
        }

        const pickupSlot = slots.pickup.find(s => s.id === formData.pickup_slot_id)
        if (!pickupSlot) {
            setAvailableDropoffSlots(slots.dropoff || [])
            return
        }

        const pickupDate = new Date(pickupSlot.date)
        // Filter dropoff slots: must be at least 1 day (24h approx, but strict date check is safer) after pickup
        // "at least one day later" -> Dropoff Date > Pickup Date
        const nextDay = new Date(pickupDate)
        nextDay.setDate(pickupDate.getDate() + 1)
        nextDay.setHours(0, 0, 0, 0)

        const filtered = (slots.dropoff || []).filter(slot => {
            const slotDate = new Date(slot.date)
            slotDate.setHours(0, 0, 0, 0)
            return slotDate >= nextDay
        })

        setAvailableDropoffSlots(filtered)

        // Reset dropoff choice if it becomes invalid
        if (formData.dropoff_slot_id) {
            const currentDropoffValid = filtered.find(s => s.id === formData.dropoff_slot_id)
            if (!currentDropoffValid) {
                setFormData(prev => ({ ...prev, dropoff_slot_id: '' }))
            }
        }

    }, [formData.pickup_slot_id, slots.pickup, slots.dropoff])

    const loadSlots = async () => {
        try {
            setLoading(true)
            const data = await getSlots()
            setSlots(data)
            setAvailableDropoffSlots(data.dropoff || [])
        } catch (err) {
            setError('Failed to load slots. Please try again later.')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }))
    }

    const totalCost = formData.num_clothes ? parseInt(formData.num_clothes) * 8 : 0

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.pickup_slot_id || !formData.dropoff_slot_id) {
            setError('Please select both pickup and dropoff slots.')
            return
        }

        try {
            setSubmitting(true)
            setError(null)
            await createOrder({
                ...formData,
                num_clothes: parseInt(formData.num_clothes)
            })
            setSuccess(true)
        } catch (err) {
            setError(err.message || 'Failed to place order.')
            console.error(err)
        } finally {
            setSubmitting(false)
        }
    }

    if (success) {
        return (
            <Layout>
                <div className="max-w-md mx-auto text-center py-12 px-4">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="text-green-600" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Order Confirmed!</h2>
                    <p className="text-slate-600 mb-6">Your laundry pickup has been scheduled successfully.</p>
                    <button
                        onClick={() => navigate('/track')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition w-full sm:w-auto"
                    >
                        Track Status
                    </button>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Book Service</h1>
                    <p className="text-slate-500 mt-1">Schedule your pickup and dropoff.</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 border border-red-100 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200 space-y-4">
                        <h2 className="text-lg font-semibold text-slate-800 border-b pb-2">Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                id="name"
                                label="Full Name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="e.g. John Doe"
                            />
                            <InputField
                                id="phone"
                                label="Phone Number"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                placeholder="e.g. 9876543210"
                            />
                        </div>
                        <InputField
                            id="address"
                            label="Address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                            placeholder="Enter full pickup address"
                        />
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end bg-slate-50 p-3 rounded-md border border-slate-100">
                            <div className="flex-grow w-full sm:w-auto">
                                <InputField
                                    id="num_clothes"
                                    label="Number of Clothes"
                                    type="number"
                                    value={formData.num_clothes}
                                    onChange={handleChange}
                                    required
                                    min="1"
                                />
                            </div>
                            <div className="flex-shrink-0 w-full sm:w-auto p-2 bg-white rounded border border-slate-200 shadow-sm">
                                <span className="block text-xs text-slate-500 uppercase font-bold tracking-wider">Total Cost</span>
                                <span className="block text-xl font-bold text-green-600">₹{totalCost}</span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 italic">* Rate: ₹8 per piece</p>
                    </div>

                    <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                        <h2 className="text-lg font-semibold text-slate-800 border-b pb-4 mb-4">Pickup Slot</h2>
                        {loading ? <p className="text-slate-500">Loading slots...</p> : (
                            <SlotPicker
                                label="Select a time"
                                slots={slots.pickup || []}
                                selectedSlotId={formData.pickup_slot_id}
                                onSelect={(id) => setFormData(prev => ({ ...prev, pickup_slot_id: id }))}
                            />
                        )}
                    </div>

                    {formData.pickup_slot_id && (
                        <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                            <h2 className="text-lg font-semibold text-slate-800 border-b pb-4 mb-4">Dropoff Slot</h2>
                            {loading ? <p className="text-slate-500">Loading slots...</p> : (
                                <SlotPicker
                                    label="Select a time (at least 1 day after pickup)"
                                    slots={availableDropoffSlots}
                                    selectedSlotId={formData.dropoff_slot_id}
                                    onSelect={(id) => setFormData(prev => ({ ...prev, dropoff_slot_id: id }))}
                                />
                            )}
                        </div>
                    )}

                    <div className="pt-4 pb-8">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {submitting ? 'Booking...' : `Confirm Booking • ₹${totalCost}`}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    )
}
