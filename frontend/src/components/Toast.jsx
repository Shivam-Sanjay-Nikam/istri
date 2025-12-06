import React, { useEffect } from 'react'
import { CheckCircle, AlertCircle, X } from 'lucide-react'

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
    useEffect(() => {
        if (duration) {
            const timer = setTimeout(onClose, duration)
            return () => clearTimeout(timer)
        }
    }, [duration, onClose])

    if (!message) return null

    const styles = {
        success: 'bg-white border-green-200 text-slate-800 shadow-lg shadow-green-500/10',
        error: 'bg-white border-red-200 text-slate-800 shadow-lg shadow-red-500/10'
    }

    const icons = {
        success: <CheckCircle className="text-green-500" size={20} />,
        error: <AlertCircle className="text-red-500" size={20} />
    }

    return (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border ${styles[type]} transform transition-all animate-in slide-in-from-top-2`}>
            {icons[type]}
            <p className="text-sm font-medium">{message}</p>
            <button onClick={onClose} className="ml-2 text-slate-400 hover:text-slate-600">
                <X size={16} />
            </button>
        </div>
    )
}
