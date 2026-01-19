'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getNewsPosts, deleteNewsPost, updateNewsPost } from '@/actions/news';
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
    LogOut
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
    }, [supabase, router]);

    async function fetchNews() {
        setIsLoading(true);
        const result = await getNewsPosts(); // Note: getNewsPosts returns data directly from previous implementation, but let's be careful
        setNews(Array.isArray(result) ? result : []);
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

    const handleToggleFeatured = async (post: any) => {
        setIsActionLoading(true);
        try {
            const result = await updateNewsPost(post.id, {
                ...post,
                is_featured: !post.is_featured
            });
            if (result.success) {
                showStatus('success', `Berita ${!post.is_featured ? 'ditandai sebagai unggulan' : 'dilepas dari unggulan'}.`);
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
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-purple-500/30">
            <Navbar isScrolled={isScrolled} />

            {/* Status Notification */}
            {status.type && (
                <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 ${status.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                    {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <span className="text-sm font-black uppercase tracking-widest">{status.message}</span>
                </div>
            )}

            <main className="pt-32 pb-24 max-w-7xl mx-auto px-4 md:px-6">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                    <div className="flex items-center gap-6">
                        <div className="h-20 w-20 bg-purple-500/10 rounded-[32px] flex items-center justify-center border border-purple-500/20 shadow-inner">
                            <LayoutDashboard className="text-purple-500" size={40} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tight uppercase leading-none mb-2">Dashboard</h1>
                            <p className="text-gray-500 font-bold uppercase text-xs tracking-[0.2em]">Management System v1.1</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="px-8 py-4 bg-[var(--accent)] text-white font-black rounded-2xl flex items-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-purple-500/30 uppercase tracking-widest text-sm">
                            <Plus size={20} /> Tulis Berita
                        </Link>
                        <button onClick={handleLogout} className="px-8 py-4 bg-[var(--card-bg)] border border-[var(--border)] text-red-500 font-black rounded-2xl flex items-center gap-2 hover:bg-red-500/10 transition-all uppercase tracking-widest text-sm shadow-sm group">
                            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" /> Logout
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {[
                        { label: 'Total Berita', value: news.length, color: 'text-[var(--foreground)]' },
                        { label: 'Featured Berita', value: news.filter(n => n.is_featured).length, color: 'text-yellow-500' },
                        { label: 'Publikasi Hari Ini', value: news.filter(n => new Date(n.created_at).toDateString() === new Date().toDateString()).length, color: 'text-purple-500' }
                    ].map((stat, i) => (
                        <div key={i} className="p-8 rounded-[32px] bg-[var(--card-bg)] border border-[var(--border)] shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <FileText size={80} />
                            </div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] block mb-4">{stat.label}</span>
                            <div className={`text-6xl font-black tracking-tighter ${stat.color}`}>{stat.value}</div>
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
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Content Overview</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hidden lg:table-cell">Publish Date</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 text-center">Status</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-32 text-center">
                                            <Loader2 className="animate-spin text-purple-500 mx-auto mb-6" size={48} />
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
                                                        <h4 className="font-black text-base truncate max-w-[200px] md:max-w-md uppercase tracking-tight">{post.title}</h4>
                                                        <p className="text-xs text-gray-500 truncate font-medium mt-1 uppercase tracking-wider">{post.content.substring(0, 60)}...</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 hidden lg:table-cell">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-[var(--foreground)]">{new Date(post.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{new Date(post.created_at).getFullYear()}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <button
                                                    onClick={() => handleToggleFeatured(post)}
                                                    className={`p-3 rounded-2xl border transition-all ${post.is_featured ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500 shadow-xl shadow-yellow-500/10' : 'bg-[var(--background)] border-[var(--border)] text-gray-500 opacity-30 hover:opacity-100 hover:text-yellow-500 shadow-sm'}`}
                                                    title={post.is_featured ? "Featured" : "Mark as Featured"}
                                                >
                                                    <Star size={20} fill={post.is_featured ? "currentColor" : "none"} strokeWidth={2.5} />
                                                </button>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <Link href={`/news/${post.id}`} className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-2xl hover:bg-blue-500 hover:text-white transition-all shadow-sm" title="View Source">
                                                        <Eye size={20} strokeWidth={2.5} />
                                                    </Link>
                                                    <button onClick={() => setEditPost(post)} className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl hover:bg-amber-500 hover:text-white transition-all shadow-sm" title="Quick Edit">
                                                        <Edit size={20} strokeWidth={2.5} />
                                                    </button>
                                                    <button onClick={() => handleDelete(post.id)} className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm" title="Purge Record">
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
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl px-6 py-5 outline-none focus:border-purple-500 transition-all font-black text-lg uppercase tracking-tight shadow-sm"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Content Narrative</label>
                                <textarea
                                    required
                                    rows={10}
                                    value={editPost.content}
                                    onChange={(e) => setEditPost({ ...editPost, content: e.target.value })}
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl px-6 py-5 outline-none focus:border-purple-500 transition-all resize-none leading-relaxed font-medium shadow-sm"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Media Source</label>
                                <input
                                    value={editPost.image_source || ''}
                                    onChange={(e) => setEditPost({ ...editPost, image_source: e.target.value })}
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl px-6 py-5 outline-none focus:border-purple-500 transition-all font-medium shadow-sm"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isActionLoading}
                                className="w-full py-6 bg-[var(--accent)] text-white font-black text-xl rounded-2xl hover:opacity-90 flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl shadow-purple-500/20 uppercase tracking-widest"
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
