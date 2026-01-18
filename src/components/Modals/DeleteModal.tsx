'use client';

import React, { useState } from 'react';
import { X, ShieldAlert, Key, Trash2, Loader2 } from 'lucide-react';

interface DeleteModalProps {
    id: string | null;
    onClose: () => void;
    onConfirm: (password: string) => void;
    isDeleting: boolean;
}

export default function DeleteModal({ id, onClose, onConfirm, isDeleting }: DeleteModalProps) {
    const [password, setPassword] = useState('');

    if (!id) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-md bg-[#18181b] border border-white/10 rounded-3xl p-8 relative shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
                    <X size={20} />
                </button>
                <div className="flex flex-col items-center text-center">
                    <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 text-red-500">
                        <ShieldAlert size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Konfirmasi Hapus</h3>
                    <p className="text-gray-400 text-sm mb-6">Tindakan ini tidak bisa dibatalkan. Masukkan Password Admin untuk menghapus karya ini.</p>
                    <div className="w-full relative mb-6">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="password"
                            placeholder="Password Admin"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white focus:border-red-500 outline-none transition-all"
                        />
                    </div>
                    <div className="flex gap-3 w-full">
                        <button onClick={onClose} className="flex-1 py-3 text-sm font-bold text-gray-400 hover:text-white transition-colors">Batal</button>
                        <button
                            onClick={() => onConfirm(password)}
                            disabled={isDeleting || !password}
                            className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isDeleting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />} Hapus Permanen
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
