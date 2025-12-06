import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Shirt, Menu, X, Search, CalendarPlus, Languages } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

export default function Layout({ children }) {
    const [isOpen, setIsOpen] = React.useState(false)
    const location = useLocation()
    const { t, toggleLanguage, language } = useLanguage()

    const navs = [
        { name: t('nav.bookNow'), path: '/' },
        { name: t('nav.trackOrder'), path: '/track' },
        { name: t('nav.admin'), path: '/admin-login' },
    ]

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <nav className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                                    <Shirt size={20} />
                                </div>
                                <span className="font-bold text-xl text-slate-800">{t('nav.brand')}</span>
                            </Link>
                        </div>

                        {/* Desktop Nav */}
                        <div className="hidden sm:flex sm:space-x-8 sm:items-center">
                            {navs.map((nav) => (
                                <Link
                                    key={nav.path}
                                    to={nav.path}
                                    className={`px-1 pt-1 text-sm font-medium border-b-2 transition-colors ${location.pathname === nav.path
                                        ? 'border-blue-500 text-slate-900'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                        }`}
                                >
                                    {nav.name}
                                </Link>
                            ))}
                            <button
                                onClick={toggleLanguage}
                                className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-full text-sm font-medium text-slate-700 transition-colors"
                            >
                                <Languages size={16} />
                                {language === 'en' ? 'हिंदी' : 'English'}
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="flex items-center gap-3 sm:hidden">
                            <button
                                onClick={toggleLanguage}
                                className="text-slate-500 hover:text-slate-700 p-1"
                                title="Switch Language"
                            >
                                <span className="font-bold text-xs border border-slate-300 rounded px-1 py-0.5">
                                    {language === 'en' ? 'हि' : 'EN'}
                                </span>
                            </button>
                            <Link
                                to="/"
                                className="text-slate-500 hover:text-slate-700 p-1"
                                title="Book Now"
                            >
                                <CalendarPlus size={22} />
                            </Link>
                            <Link
                                to="/track"
                                className="text-slate-500 hover:text-slate-700 p-1"
                                title="Track Order"
                            >
                                <Search size={22} />
                            </Link>
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none"
                            >
                                {isOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Nav */}
                {isOpen && (
                    <div className="sm:hidden bg-white border-t border-slate-100">
                        <div className="pt-2 pb-3 space-y-1">
                            {navs.map((nav) => (
                                <Link
                                    key={nav.path}
                                    to={nav.path}
                                    onClick={() => setIsOpen(false)}
                                    className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${location.pathname === nav.path
                                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                                        : 'border-transparent text-slate-500 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700'
                                        }`}
                                >
                                    {nav.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </nav>

            <main className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            <footer className="bg-white border-t border-slate-200 mt-auto">
                <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                    <p className="text-center text-sm text-slate-500">
                        &copy; {new Date().getFullYear()} Istriwala. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    )
}
