'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCcw } from 'lucide-react'
import Link from 'next/link'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('SERVER_RENDER_ERROR:', {
            message: error.message,
            stack: error.stack,
            digest: error.digest,
        })
    }, [error])

    return (
        <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-8 border border-red-500/20">
                <AlertCircle className="text-red-500" size={40} />
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tighter">
                Aduh, Terjadi Kesalahan!
            </h2>

            <p className="text-gray-400 max-w-md mb-10 leading-relaxed">
                Server tidak dapat memuat halaman saat ini. Ini mungkin masalah koneksi atau konfigurasi server.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={() => reset()}
                    className="px-8 py-3 bg-white text-black font-bold rounded-full flex items-center gap-2 hover:bg-gray-200 transition-all active:scale-95 shadow-lg shadow-white/10"
                >
                    <RefreshCcw size={18} /> Coba Lagi
                </button>

                <Link
                    href="/"
                    className="px-8 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-full flex items-center gap-2 hover:bg-white/10 transition-all active:scale-95"
                >
                    Kembali ke Beranda
                </Link>
            </div>

            <p className="mt-12 text-xs text-gray-600 font-mono">
                Error Digest: {error.digest || 'N/A'}
            </p>
        </div>
    )
}
