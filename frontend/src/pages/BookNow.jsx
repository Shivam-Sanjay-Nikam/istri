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

    useEffect(() => {
        loadSlots()
    }, [])

    const loadSlots = async () => {
        try {
            setLoading(true)
            const data = await getSlots()
            setSlots(data)
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
                <div className="max-w-md mx-auto text-center py-12">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="text-green-600" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Order Confirmed!</h2>
                    <p className="text-slate-600 mb-6">Your laundry pickup has been scheduled successfully.</p>
                    <button
                        onClick={() => navigate('/track')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition"
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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Book Service</h1>
                    <p className="text-slate-500 mt-2">Schedule your pickup and dropoff.</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4">
                        <h2 className="text-lg font-semibold text-slate-800 border-b pb-2">Details</h2>
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
                        <InputField
                            id="address"
                            label="Address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                            placeholder="Enter full pickup address"
                        />
                        <InputField
                            id="num_clothes"
                            label="Estimated Number of Clothes"
                            type="number"
                            value={formData.num_clothes}
                            onChange={handleChange}
                            required
                            min="1"
                        />
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                        <h2 className="text-lg font-semibold text-slate-800 border-b pb-4 mb-4">Pickup Slot</h2>
                        {loading ? <p>Loading slots...</p> : (
                            <SlotPicker
                                label="Select a time"
                                slots={slots.pickup || []}
                                selectedSlotId={formData.pickup_slot_id}
                                onSelect={(id) => setFormData(prev => ({ ...prev, pickup_slot_id: id }))}
                            />
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                        <h2 className="text-lg font-semibold text-slate-800 border-b pb-4 mb-4">Dropoff Slot</h2>
                        {loading ? <p>Loading slots...</p> : (
                            <SlotPicker
                                label="Select a time"
                                slots={slots.dropoff || []}
                                selectedSlotId={formData.dropoff_slot_id}
                                onSelect={(id) => setFormData(prev => ({ ...prev, dropoff_slot_id: id }))}
                            />
                        )}
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                        >
                            {submitting ? 'Booking...' : 'Confirm Booking'}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    )
}
