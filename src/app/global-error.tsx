'use client'

import { RefreshCcw } from 'lucide-react'

// Global Error must have html and body tags because it replaces the root layout
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <html lang="id">
            <body className="bg-[#09090b] text-white flex flex-col items-center justify-center min-h-screen p-6 text-center">
                <h2 className="text-3xl font-bold mb-4">CRITICAL SYSTEM ERROR</h2>
                <p className="text-gray-400 max-w-md mb-8">
                    Aplikasi mengalami kegagalan fatal di tingkat sistem (Layout Error).
                </p>
                <button
                    onClick={() => reset()}
                    className="px-8 py-3 bg-white text-black font-bold rounded-full flex items-center gap-2"
                >
                    <RefreshCcw size={18} /> Restart Aplikasi
                </button>
                <p className="mt-8 text-[10px] text-gray-700 font-mono">
                    Digest: {error.digest}
                </p>
            </body>
        </html>
    )
}
