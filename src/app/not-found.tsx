import Link from 'next/link'
import { FileQuestion, Home } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mb-8 border border-emerald-500/20">
                <FileQuestion className="text-emerald-500" size={40} />
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tighter">
                Halaman Tidak Ditemukan
            </h2>

            <p className="text-gray-400 max-w-md mb-10 leading-relaxed">
                Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
            </p>

            <Link
                href="/"
                className="px-8 py-3 bg-white text-black font-bold rounded-full flex items-center gap-2 hover:bg-gray-200 transition-all active:scale-95 shadow-lg shadow-white/10"
            >
                <Home size={18} /> Kembali ke Beranda
            </Link>
        </div>
    )
}
