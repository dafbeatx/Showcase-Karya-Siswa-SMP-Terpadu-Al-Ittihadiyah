import React from 'react';
import { X, AlertTriangle, Lock, Loader2, Trash2 } from 'lucide-react';

export default function DeleteModal({
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    handleConfirmDelete,
    deletePassword,
    setDeletePassword,
    isDeleting
}) {
    if (!isDeleteModalOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 bg-black/90 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md bg-[#18181b] border border-red-500/30 rounded-2xl p-6 shadow-2xl shadow-red-900/20 relative">
                <button onClick={() => setIsDeleteModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20} /></button>
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4 text-red-500"><AlertTriangle size={32} /></div>
                    <h3 className="text-xl font-bold text-white mb-2">Hapus Projek?</h3>
                    <p className="text-gray-400 text-sm">Tindakan ini tidak bisa dibatalkan. Masukkan password admin untuk konfirmasi.</p>
                </div>
                <form onSubmit={handleConfirmDelete} className="space-y-4">
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} placeholder="Masukkan Password Admin" className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-red-500 outline-none transition-colors" autoFocus />
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-medium transition-colors">Batal</button>
                        <button type="submit" disabled={isDeleting} className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center justify-center gap-2 transition-colors">
                            {isDeleting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />} Hapus
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
