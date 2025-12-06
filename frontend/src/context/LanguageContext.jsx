import React, { createContext, useState, useContext } from 'react'
import { translations } from '../utils/translations'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState('en') // 'en' or 'hi'

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'hi' : 'en')
    }

    const t = (path) => {
        const keys = path.split('.')
        let current = translations[language]
        for (const key of keys) {
            if (current[key] === undefined) return path
            current = current[key]
        }
        return current
    }

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export const useLanguage = () => useContext(LanguageContext)
