```javascript
import React from 'react'
import { Shirt } from 'lucide-react'

export default function Loader({ small = false }) {
    const containerClass = small 
        ? "flex flex-col items-center justify-center w-full p-2" 
        : "flex flex-col items-center justify-center min-h-[50vh] w-full p-4"

    return (
        <div className={containerClass}>
            <div className={`relative ${ small ? 'scale-75 origin-center' : '' } `}>
                {/* Ironing Board / Item */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-slate-200 rounded-full"></div>
                
                {/* Iron Animation */}
                <div className="animate-ironing text-blue-600">
                    <svg 
                        width="48" 
                        height="48" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    >
                        <path d="M21.8 13.9C21.4 12.2 19.9 11 18.1 11H9.9C7.8 11 6 12.8 6 15V19H21V16.6C21 16.2 21.8 13.9 21.8 13.9Z" />
                        <path d="M9.9 11C11 11 11.8 5 15 5H18" />
                    </svg>
                </div>
                
                {/* Steam Puffs */}
                <div className="absolute -top-4 right-0 w-2 h-2 bg-slate-300 rounded-full opacity-0 animate-steam-1"></div>
                <div className="absolute -top-6 right-2 w-3 h-3 bg-slate-200 rounded-full opacity-0 animate-steam-2"></div>
            </div>
            <p className={`mt - 8 text - slate - 500 font - medium animate - pulse text - sm uppercase tracking - widest ${ small ? 'mt-4 text-xs' : '' } `}>
                {small ? 'Loading...' : 'Ironing out the details...'}
            </p>
        </div>
    )
}
```
