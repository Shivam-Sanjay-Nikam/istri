import React from 'react'
import { Package, Calendar, MapPin, Phone } from 'lucide-react'
import clsx from 'clsx'

export default function OrderCard({ order, isAdmin, onUpdateStatus }) {
    const statusColors = {
        'Booked': 'bg-yellow-100 text-yellow-800',
        'Picked': 'bg-blue-100 text-blue-800',
        'Delivered': 'bg-purple-100 text-purple-800',
        'Paid': 'bg-green-100 text-green-800',
        'Pending': 'bg-gray-100 text-gray-800', // Backward compatibility
        'Cancelled': 'bg-red-100 text-red-800',
    }

    const statusColor = statusColors[order.status] || 'bg-slate-100 text-slate-800'

    return (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <Package size={20} className="text-blue-500" />
                        Order #{order.id.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Placed on {new Date(order.created_at).toLocaleDateString()}
                    </p>
                </div>
                <span className={clsx("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", statusColor)}>
                    {order.status}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                <div className="flex items-start gap-2">
                    <MapPin size={16} className="mt-0.5 text-slate-400" />
                    <span>{order.address}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Phone size={16} className="text-slate-400" />
                    <span>{order.phone}</span>
                </div>
                <div className="flex items-start gap-2 col-span-1 md:col-span-2">
                    <div className="grid grid-cols-2 gap-4 w-full bg-slate-50 p-3 rounded-md">
                        <div>
                            <span className="block text-xs uppercase tracking-wider text-slate-500 font-semibold">Pickup</span>
                            <span className="block text-slate-800 font-medium">
                                {order.pickup_slot ? `${order.pickup_slot.time} (${new Date(order.pickup_slot.date).toLocaleDateString()})` : 'N/A'}
                            </span>
                        </div>
                        <div>
                            <span className="block text-xs uppercase tracking-wider text-slate-500 font-semibold">Dropoff</span>
                            <span className="block text-slate-800 font-medium">
                                {order.dropoff_slot ? `${order.dropoff_slot.time} (${new Date(order.dropoff_slot.date).toLocaleDateString()})` : 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4 font-medium text-slate-900">
                    <span>{order.num_clothes} Clothes</span>
                    <span className="text-green-600">Total: ₹{order.num_clothes * 8}</span>
                </div>
            </div>

            {isAdmin && (
                <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2 justify-end">
                    <select
                        value={order.status}
                        onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                        className="block w-40 rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-1.5 border"
                    >
                        {Object.keys(statusColors).map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    )
}
