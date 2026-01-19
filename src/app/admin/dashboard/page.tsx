'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getNewsPosts, deleteNewsPost, updateNewsPost, updateNewsStatus } from '@/actions/news';
import { signOut } from '@/actions/auth';
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
    LogOut,
    Check,
    XOctagon,
    Filter,
    User,
    Tag
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
    const [news, setNews] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [isScrolled] = useState(true);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

    // Filters
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'published' | 'rejected'>('all');
    const [filterCategory, setFilterCategory] = useState('All');

    const router = useRouter();
    const supabase = createClient();

    // Edit Modal State
    const [editPost, setEditPost] = useState<any | null>(null);

    useEffect(() => {
        const checkUser = async () => {
            if (!supabase) return;
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
            }
        };
        checkUser();
        fetchNews();
    }, [supabase, router, filterStatus, filterCategory]);

    async function fetchNews() {
        setIsLoading(true);
        const { data } = await getNewsPosts({
            status: filterStatus === 'all' ? 'all' as any : filterStatus,
            category: filterCategory,
            limit: 100 // Load more for dashboard
        });
        setNews(data || []);
        setIsLoading(false);
    }

    const handleLogout = async () => {
        setIsActionLoading(true);
        const result = await signOut();
        if (result.success) {
            router.push('/');
            router.refresh();
        } else {
            showStatus('error', 'Gagal logout: ' + result.error);
        }
        setIsActionLoading(false);
    };

    const showStatus = (type: 'success' | 'error', message: string) => {
        setStatus({ type, message });
        setTimeout(() => setStatus({ type: null, message: '' }), 5000);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Yakin ingin menghapus berita ini secara permanen?')) return;
        setIsActionLoading(true);
        try {
            const result = await deleteNewsPost(id);
            if (result.success) {
                showStatus('success', 'Berita berhasil dihapus.');
                fetchNews();
            } else {
                showStatus('error', 'Gagal menghapus: ' + result.error);
            }
        } catch (e) {
            showStatus('error', 'Terjadi kesalahan sistem.');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleModeration = async (id: string, newStatus: 'published' | 'rejected') => {
        setIsActionLoading(true);
        try {
            const result = await updateNewsStatus(id, newStatus);
            if (result.success) {
                showStatus('success', `Berita berhasil ${newStatus === 'published' ? 'diterbitkan' : 'ditolak'}.`);
                fetchNews();
            } else {
                showStatus('error', 'Gagal update status: ' + result.error);
            }
        } catch (e) {
            showStatus('error', 'Terjadi kesalahan sistem.');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editPost) return;

        setIsActionLoading(true);
        try {
            const result = await updateNewsPost(editPost.id, editPost);
            if (result.success) {
                showStatus('success', 'Berita berhasil diperbarui!');
                setEditPost(null);
                fetchNews();
            } else {
                showStatus('error', 'Gagal update: ' + result.error);
            }
        } catch (e) {
            showStatus('error', 'Terjadi kesalahan sistem.');
        } finally {
            setIsActionLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-emerald-500/30">
            <Navbar isScrolled={isScrolled} />

            {/* Status Notification */}
            {status.type && (
                <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 ${status.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                    {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <span className="text-sm font-black uppercase tracking-widest">{status.message}</span>
                </div>
            )}

            <main className="pt-32 pb-24 max-w-7xl mx-auto px-4 md:px-6">
                <header className="mb-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                        <div className="flex items-center gap-6">
                            <div className="h-16 w-16 md:h-20 md:w-20 bg-emerald-500/10 rounded-[28px] md:rounded-[32px] flex items-center justify-center border border-emerald-500/20 shadow-inner">
                                <LayoutDashboard className="text-emerald-500" size={32} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase leading-none mb-2">Dashboard</h1>
                                <p className="text-gray-500 font-bold uppercase text-[10px] md:text-xs tracking-[0.2em]">Management System v1.2</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="/admin" className="px-6 md:px-8 py-3.5 md:py-4 bg-[var(--accent)] text-white font-black rounded-2xl flex items-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-emerald-500/30 uppercase tracking-widest text-xs md:text-sm">
                                <Plus size={20} /> Tulis Berita
                            </Link>
                            <button onClick={handleLogout} className="px-6 md:px-8 py-3.5 md:py-4 bg-[var(--card-bg)] border border-[var(--border)] text-red-500 font-black rounded-2xl flex items-center gap-2 hover:bg-red-500/10 transition-all uppercase tracking-widest text-xs md:text-sm shadow-sm group">
                                <LogOut size={20} className="group-hover:translate-x-1 transition-transform" /> Logout
                            </button>
                        </div>
                    </div>

                    {/* Filters bar */}
                    <div className="flex flex-wrap items-center gap-4 bg-[var(--card-bg)] p-4 rounded-[24px] border border-[var(--border)]">
                        <div className="flex items-center gap-2 px-3 text-gray-400">
                            <Filter size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Filters:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {(['all', 'pending', 'published', 'rejected'] as const).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setFilterStatus(s)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === s ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-[var(--background)] border border-[var(--border)] text-gray-500 hover:text-[var(--foreground)]'}`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                        <div className="h-6 w-px bg-[var(--border)] hidden md:block" />
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none text-gray-500 focus:text-[var(--foreground)] focus:border-[var(--accent)]"
                        >
                            {['All', 'Kegiatan', 'Prestasi', 'Pengumuman', 'PPDB'].map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: 'Total', value: news.length, color: 'text-[var(--foreground)]' },
                        { label: 'Pending', value: news.filter(n => n.status === 'pending').length, color: 'text-orange-500' },
                        { label: 'Published', value: news.filter(n => n.status === 'published').length, color: 'text-emerald-500' },
                        { label: 'Featured', value: news.filter(n => n.is_featured).length, color: 'text-yellow-500' },
                    ].map((stat, i) => (
                        <div key={i} className="p-6 rounded-[24px] bg-[var(--card-bg)] border border-[var(--border)] shadow-sm relative overflow-hidden group">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] block mb-2">{stat.label}</span>
                            <div className={`text-4xl font-black tracking-tighter ${stat.color}`}>{stat.value}</div>
                        </div>
                    ))}
                </div>

                <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] overflow-hidden shadow-2xl relative">
                    {isActionLoading && (
                        <div className="absolute inset-0 bg-[var(--background)]/40 backdrop-blur-md z-10 flex items-center justify-center">
                            <Loader2 className="animate-spin text-[var(--accent)]" size={64} />
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-[var(--border)] bg-[var(--background)]/50">
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Content & Author</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hidden lg:table-cell">Details</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 text-center">Status</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 text-right">Moderation / Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-32 text-center">
                                            <Loader2 className="animate-spin text-emerald-500 mx-auto mb-6" size={48} />
                                            <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Synchronizing data...</p>
                                        </td>
                                    </tr>
                                ) : news.length > 0 ? (
                                    news.map((post) => (
                                        <tr key={post.id} className="border-b border-[var(--border)] hover:bg-[var(--background)]/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-6">
                                                    <div className="relative h-16 w-20 rounded-2xl overflow-hidden flex-shrink-0 border border-[var(--border)] shadow-md">
                                                        <Image src={post.image_url} alt="" fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-black text-sm truncate max-w-[200px] md:max-w-md uppercase tracking-tight">{post.title}</h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/5 px-2 py-0.5 rounded-md border border-emerald-500/10">
                                                                <Tag size={10} /> {post.category || 'Kegiatan'}
                                                            </div>
                                                            {post.author_name && (
                                                                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                                    <User size={10} /> {post.author_name}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 hidden lg:table-cell">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                                        <Calendar size={12} />
                                                        {new Date(post.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <div className={`inline-flex px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${post.status === 'published' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                    post.status === 'pending' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                                        'bg-red-500/10 text-red-500 border-red-500/20'
                                                    }`}>
                                                    {post.status || 'pending'}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    {post.status !== 'published' && (
                                                        <button
                                                            onClick={() => handleModeration(post.id, 'published')}
                                                            className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                                            title="Approve & Publish"
                                                        >
                                                            <Check size={20} strokeWidth={3} />
                                                        </button>
                                                    )}
                                                    {post.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleModeration(post.id, 'rejected')}
                                                            className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                            title="Reject"
                                                        >
                                                            <XOctagon size={20} strokeWidth={2.5} />
                                                        </button>
                                                    )}
                                                    <div className="w-px h-8 bg-[var(--border)] mx-1 hidden md:block" />
                                                    <Link href={`/news/${post.id}`} className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-2xl hover:bg-blue-500 hover:text-white transition-all shadow-sm" title="View Article">
                                                        <Eye size={20} strokeWidth={2.5} />
                                                    </Link>
                                                    <button onClick={() => setEditPost(post)} className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl hover:bg-amber-500 hover:text-white transition-all shadow-sm" title="Edit Data">
                                                        <Edit size={20} strokeWidth={2.5} />
                                                    </button>
                                                    <button onClick={() => handleDelete(post.id)} className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm" title="Delete Permanent">
                                                        <Trash2 size={20} strokeWidth={2.5} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-40 text-center text-gray-500">
                                            <div className="h-24 w-24 bg-white/5 rounded-[32px] flex items-center justify-center border border-[var(--border)] mx-auto mb-6">
                                                <FileText className="opacity-20" size={48} />
                                            </div>
                                            <p className="font-black uppercase tracking-[0.3em] text-xs">No records found in database.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {editPost && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500">
                    <div className="w-full max-w-3xl bg-[var(--card-bg)] rounded-[48px] border border-[var(--border)] shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col scale-in">
                        <div className="p-8 md:p-10 border-b border-[var(--border)] flex items-center justify-between bg-[var(--background)]/50">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20">
                                    <Edit className="text-amber-500" size={24} />
                                </div>
                                <h2 className="text-2xl font-black uppercase tracking-tight">Edit Post</h2>
                            </div>
                            <button onClick={() => setEditPost(null)} className="p-3 hover:bg-white/10 rounded-2xl transition-all"><X size={24} /></button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="p-8 md:p-10 space-y-8 overflow-y-auto custom-scrollbar">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Title</label>
                                <input
                                    required
                                    value={editPost.title}
                                    onChange={(e) => setEditPost({ ...editPost, title: e.target.value })}
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl px-6 py-5 outline-none focus:border-emerald-500 transition-all font-black text-lg uppercase tracking-tight shadow-sm"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Content Narrative</label>
                                <textarea
                                    required
                                    rows={10}
                                    value={editPost.content}
                                    onChange={(e) => setEditPost({ ...editPost, content: e.target.value })}
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl px-6 py-5 outline-none focus:border-emerald-500 transition-all resize-none leading-relaxed font-medium shadow-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Category</label>
                                    <select
                                        value={editPost.category || 'Kegiatan'}
                                        onChange={(e) => setEditPost({ ...editPost, category: e.target.value })}
                                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl px-6 py-5 outline-none focus:border-emerald-500 transition-all font-black text-sm uppercase tracking-widest shadow-sm appearance-none cursor-pointer"
                                    >
                                        <option value="Kegiatan">Kegiatan</option>
                                        <option value="Prestasi">Prestasi</option>
                                        <option value="Pengumuman">Pengumuman</option>
                                        <option value="PPDB">PPDB</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Status</label>
                                    <select
                                        value={editPost.status || 'pending'}
                                        onChange={(e) => setEditPost({ ...editPost, status: e.target.value })}
                                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl px-6 py-5 outline-none focus:border-emerald-500 transition-all font-black text-sm uppercase tracking-widest shadow-sm appearance-none cursor-pointer"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="published">Published</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Author Name</label>
                                    <input
                                        value={editPost.author_name || ''}
                                        onChange={(e) => setEditPost({ ...editPost, author_name: e.target.value })}
                                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl px-6 py-5 outline-none focus:border-emerald-500 transition-all font-medium shadow-sm"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Author Role</label>
                                    <input
                                        value={editPost.author_role || ''}
                                        onChange={(e) => setEditPost({ ...editPost, author_role: e.target.value })}
                                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl px-6 py-5 outline-none focus:border-emerald-500 transition-all font-medium shadow-sm"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-6 rounded-3xl bg-[var(--background)] border border-[var(--border)]">
                                <button
                                    type="button"
                                    onClick={() => setEditPost({ ...editPost, is_featured: !editPost.is_featured })}
                                    className={`h-12 w-12 rounded-2xl border transition-all flex items-center justify-center ${editPost.is_featured ? 'bg-yellow-500 text-white border-yellow-500 shadow-lg shadow-yellow-500/20' : 'bg-[var(--card-bg)] border-[var(--border)] text-gray-400'}`}
                                >
                                    <Star size={20} fill={editPost.is_featured ? 'currentColor' : 'none'} />
                                </button>
                                <div>
                                    <p className="text-sm font-black uppercase tracking-widest">Featured Post</p>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Tampilkan di posisi utama halaman depan</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Media Source</label>
                                <input
                                    value={editPost.image_source || ''}
                                    onChange={(e) => setEditPost({ ...editPost, image_source: e.target.value })}
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl px-6 py-5 outline-none focus:border-emerald-500 transition-all font-medium shadow-sm"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isActionLoading}
                                className="w-full py-6 bg-[var(--accent)] text-white font-black text-xl rounded-2xl hover:opacity-90 flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl shadow-emerald-500/20 uppercase tracking-widest"
                            >
                                {isActionLoading ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle2 size={24} />}
                                Synchronize Updates
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
