import { Loader2 } from 'lucide-react'

export default function Loading() {
    return (
        <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center gap-6">
            <div className="relative">
                <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full" />
                <Loader2 className="animate-spin text-purple-500 relative z-10" size={48} />
            </div>
            <div className="text-center space-y-2">
                <h3 className="text-xl font-bold tracking-tight">Menyiapkan Mahakarya</h3>
                <p className="text-gray-500 text-sm animate-pulse">Mohon tunggu sebentar...</p>
            </div>
        </div>
    )
}
