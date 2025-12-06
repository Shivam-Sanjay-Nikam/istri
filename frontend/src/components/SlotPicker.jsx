import React from 'react'
import { Clock } from 'lucide-react'

export default function SlotPicker({ label, slots, selectedSlotId, onSelect }) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">{label}</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {slots.map((slot) => {
                    const isSelected = selectedSlotId === slot.id
                    return (
                        <div
                            key={slot.id}
                            onClick={() => onSelect(slot.id)}
                            className={`relative flex items-start p-4 cursor-pointer rounded-lg border transition-all ${isSelected
                                    ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                                    : 'bg-white border-slate-200 hover:border-slate-300'
                                }`}
                        >
                            <div className="min-w-0 flex-1 text-sm">
                                <div className="font-medium text-slate-900 flex items-center gap-2">
                                    <Clock size={16} className={isSelected ? 'text-blue-500' : 'text-slate-400'} />
                                    {slot.time}
                                </div>
                                <p className="text-slate-500 mt-1">{new Date(slot.date).toLocaleDateString()}</p>
                            </div>
                            <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'
                                }`}>
                                {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                            </div>
                        </div>
                    )
                })}
                {slots.length === 0 && (
                    <div className="text-sm text-slate-500 italic p-2 border border-dashed rounded-md">
                        No slots available.
                    </div>
                )}
            </div>
        </div>
    )
}
