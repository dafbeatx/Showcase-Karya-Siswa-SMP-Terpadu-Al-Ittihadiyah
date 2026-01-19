'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getNewsPosts, deleteNewsPost, updateNewsPost } from '@/actions/news';
import { createClient } from '@/lib/supabase';
import {
    LayoutDashboard,
    Trash2,
    Edit,
    Calendar,
    Eye,
    Loader2,
    FileText,
    Plus,
    X,
    CheckCircle2,
    AlertCircle,
    Star,
    LogOut
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const [news, setNews] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [isScrolled, setIsScrolled] = useState(true);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
    const router = useRouter();
    const supabase = createClient();

    // Edit Modal State
    const [editPost, setEditPost] = useState<any | null>(null);

    useEffect(() => {
        checkUser();
        fetchNews();
    }, []);

    const checkUser = async () => {
        if (!supabase) return;
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push('/login');
        }
    };

    const handleLogout = async () => {
        if (!supabase) return;
        await supabase.auth.signOut();
        router.push('/');
    };

    async function fetchNews() {
        setIsLoading(true);
        const data = await getNewsPosts();
        setNews(data);
        setIsLoading(false);
    }

    const showStatus = (type: 'success' | 'error', message: string) => {
        setStatus({ type, message });
        setTimeout(() => setStatus({ type: null, message: '' }), 5000);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Yakin ingin menghapus berita ini secara permanen?')) return;
        setIsActionLoading(true);
        const result = await deleteNewsPost(id);
        if (result.success) {
            showStatus('success', 'Berita berhasil dihapus.');
            fetchNews();
        } else {
            showStatus('error', 'Gagal menghapus: ' + result.error);
        }
        setIsActionLoading(false);
    };

    const handleToggleFeatured = async (post: any) => {
        setIsActionLoading(true);
        const result = await updateNewsPost(post.id, {
            ...post,
            is_featured: !post.is_featured
        });
        if (result.success) {
            showStatus('success', `Berita ${!post.is_featured ? 'ditandai featured' : 'dilepas dari featured'}.`);
            fetchNews();
        } else {
            showStatus('error', 'Gagal update status: ' + result.error);
        }
        setIsActionLoading(false);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editPost) return;

        setIsActionLoading(true);
        const result = await updateNewsPost(editPost.id, editPost);
        if (result.success) {
            showStatus('success', 'Berita berhasil diperbarui!');
            setEditPost(null);
            fetchNews();
        } else {
            showStatus('error', 'Gagal update: ' + result.error);
        }
        setIsActionLoading(false);
    };

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-purple-500/30">
            <Navbar isScrolled={isScrolled} />

            {/* Status Notification */}
            {status.type && (
                <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 ${status.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                    {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <span className="text-sm font-bold">{status.message}</span>
                </div>
            )}

            <main className="pt-32 pb-24 max-w-7xl mx-auto px-4 md:px-6">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-purple-500/20 rounded-2xl flex items-center justify-center border border-purple-500/20">
                            <LayoutDashboard className="text-purple-500" size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Admin Dashboard</h1>
                            <p className="text-gray-500 text-sm">Kelola semua konten berita SMP Terpadu Al-Ittihadiyah.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/admin" className="px-6 py-3 bg-[var(--accent)] text-white font-bold rounded-2xl flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-purple-500/20">
                            <Plus size={20} /> Buat Berita Baru
                        </Link>
                        <button onClick={handleLogout} className="px-6 py-3 bg-[var(--card-bg)] border border-[var(--border)] text-red-500 font-bold rounded-2xl flex items-center gap-2 hover:bg-red-500/10 transition-all">
                            <LogOut size={20} /> Logout
                        </button>
                    </div>
                </header>

                {/* STATISTICS (Simplified) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                    <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)] shadow-sm">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Total Berita</span>
                        <div className="text-4xl font-black">{news.length}</div>
                    </div>
                    <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)] shadow-sm">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Berita Featured</span>
                        <div className="text-4xl font-black text-yellow-500">{news.filter(n => n.is_featured).length}</div>
                    </div>
                    <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)] shadow-sm">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Hari Ini</span>
                        <div className="text-4xl font-black text-purple-500">
                            {news.filter(n => new Date(n.created_at).toDateString() === new Date().toDateString()).length}
                        </div>
                    </div>
                </div>

                {/* TABLE LIST */}
                <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[32px] overflow-hidden shadow-sm relative">
                    {isActionLoading && (
                        <div className="absolute inset-0 bg-[var(--background)]/40 backdrop-blur-sm z-10 flex items-center justify-center">
                            <Loader2 className="animate-spin text-[var(--accent)]" size={40} />
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-[var(--border)] bg-[var(--background)]/50">
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">Berita</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500 hidden md:table-cell">Tanggal</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500 text-center">Featured</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-20 text-center">
                                            <Loader2 className="animate-spin text-purple-500 mx-auto" size={40} />
                                            <p className="text-gray-500 mt-4 font-medium">Memuat data...</p>
                                        </td>
                                    </tr>
                                ) : news.length > 0 ? (
                                    news.map((post) => (
                                        <tr key={post.id} className="border-b border-[var(--border)] hover:bg-gray-500/5 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative h-12 w-16 rounded-xl overflow-hidden flex-shrink-0 border border-[var(--border)]">
                                                        <Image src={post.image_url} alt="" fill className="object-cover" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-bold text-sm truncate max-w-[200px] md:max-w-md">{post.title}</h4>
                                                        <p className="text-[10px] text-gray-500 truncate">{post.content.substring(0, 50)}...</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 hidden md:table-cell">
                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Calendar size={12} /> {new Date(post.created_at).toLocaleDateString('id-ID')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleToggleFeatured(post)}
                                                    className={`p-2 rounded-xl border transition-all ${post.is_featured ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500 shadow-lg shadow-yellow-500/10' : 'bg-gray-500/5 border-[var(--border)] text-gray-400 opacity-30 hover:opacity-100 hover:text-yellow-500'}`}
                                                >
                                                    <Star size={18} fill={post.is_featured ? "currentColor" : "none"} />
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={`/news/${post.id}`} className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all">
                                                        <Eye size={18} />
                                                    </Link>
                                                    <button onClick={() => setEditPost(post)} className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl hover:bg-amber-500 hover:text-white transition-all">
                                                        <Edit size={18} />
                                                    </button>
                                                    <button onClick={() => handleDelete(post.id)} className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-32 text-center text-gray-500">
                                            <FileText className="mx-auto mb-4 opacity-20" size={48} />
                                            <p>Belum ada berita yang diterbitkan.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* EDIT MODAL */}
            {editPost && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="w-full max-w-2xl bg-[var(--card-bg)] rounded-[32px] border border-[var(--border)] shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
                        <div className="p-6 md:p-8 border-b border-[var(--border)] flex items-center justify-between bg-[var(--background)]/50">
                            <h2 className="text-xl font-bold flex items-center gap-2"><Edit size={20} className="text-purple-500" /> Edit Berita</h2>
                            <button onClick={() => setEditPost(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="p-6 md:p-8 space-y-6 overflow-y-auto">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Judul</label>
                                <input
                                    required
                                    value={editPost.title}
                                    onChange={(e) => setEditPost({ ...editPost, title: e.target.value })}
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl px-6 py-4 outline-none focus:border-purple-500 transition-all font-bold"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Konten</label>
                                <textarea
                                    required
                                    rows={10}
                                    value={editPost.content}
                                    onChange={(e) => setEditPost({ ...editPost, content: e.target.value })}
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl px-6 py-4 outline-none focus:border-purple-500 transition-all resize-none leading-relaxed"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Sumber Foto</label>
                                <input
                                    value={editPost.image_source || ''}
                                    onChange={(e) => setEditPost({ ...editPost, image_source: e.target.value })}
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl px-6 py-4 outline-none focus:border-purple-500 transition-all"
                                />
                            </div>

                            <button
                                disabled={isActionLoading}
                                className="w-full py-5 bg-[var(--accent)] text-white font-extrabold rounded-2xl hover:opacity-90 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                            >
                                {isActionLoading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={24} />}
                                Simpan Perubahan
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
