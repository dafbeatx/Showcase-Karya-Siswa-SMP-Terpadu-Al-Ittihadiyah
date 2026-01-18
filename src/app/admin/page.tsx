'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { uploadNewsPost, uploadNewsImage, getNewsPosts, deleteNewsPost } from '@/actions/news';
import { Sparkles, Send, Loader2, ImageIcon, Trash2, Calendar, FileText, AlertCircle, CheckCircle2, X } from 'lucide-react';
import Image from 'next/image';
import { compressImage } from '@/utils/helpers';

export default function AdminPage() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploadingImg, setIsUploadingImg] = useState(false);
    const [news, setNews] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Status Notification State
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
        type: null,
        message: ''
    });

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        image_url: '',
        image_source: ''
    });

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        fetchNews();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const showStatus = (type: 'success' | 'error', message: string) => {
        setStatus({ type, message });
        setTimeout(() => setStatus({ type: null, message: '' }), 5000);
    };

    async function fetchNews() {
        setIsLoading(true);
        try {
            const data = await getNewsPosts();
            setNews(data);
        } finally {
            setIsLoading(false);
        }
    }

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'Smpterpadualittihadiyah.12345') {
            setIsAuthenticated(true);
        } else {
            showStatus('error', 'Password yang Anda masukkan salah.');
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingImg(true);
        try {
            // 1. Client-side compression
            let finalFile: File = file;
            if (file.size > 1 * 1024 * 1024) { // If > 1MB, compress
                const compressedBlob = await compressImage(file);
                finalFile = new File([compressedBlob], file.name, { type: 'image/jpeg' });
            }

            // 2. Upload to Supabase (via Server Action)
            const url = await uploadNewsImage(finalFile);
            setFormData(prev => ({ ...prev, image_url: url }));
            showStatus('success', 'Gambar berhasil diunggah dan dikompres.');
        } catch (error: any) {
            console.error(error);
            showStatus('error', 'Gagal upload gambar: ' + (error.message || 'Terjadi kesalahan sistem.'));
        } finally {
            setIsUploadingImg(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.image_url) return showStatus('error', 'Silakan upload foto berita terlebih dahulu.');

        setIsSubmitting(true);
        try {
            await uploadNewsPost(formData);
            showStatus('success', 'Berita berhasil diterbitkan!');
            setFormData({ title: '', content: '', image_url: '', image_source: '' });
            fetchNews();
        } catch (error: any) {
            showStatus('error', 'Gagal menerbitkan: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Yakin ingin menghapus berita ini?')) return;
        try {
            await deleteNewsPost(id);
            showStatus('success', 'Berita telah dihapus.');
            fetchNews();
        } catch (error: any) {
            showStatus('error', 'Gagal menghapus: ' + error.message);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-6 relative">
                {/* Status Notification */}
                {status.type && (
                    <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300 ${status.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}>
                        {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        <span className="text-sm font-bold">{status.message}</span>
                        <button onClick={() => setStatus({ type: null, message: '' })} className="ml-4 hover:opacity-70"><X size={16} /></button>
                    </div>
                )}

                <form onSubmit={handleLogin} className="w-full max-w-sm space-y-6">
                    <div className="text-center space-y-2 mb-8">
                        <h1 className="text-3xl font-bold">Admin Login</h1>
                        <p className="text-gray-500 text-sm">Masukkan password untuk akses panel berita.</p>
                    </div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password Admin"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-purple-500 outline-none transition-all"
                    />
                    <button className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-all active:scale-95 shadow-xl shadow-white/5">
                        Masuk Sekarang
                    </button>
                    <a href="/" className="block text-center text-sm text-gray-500 hover:text-white transition-colors">Kembali ke Beranda</a>
                </form>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#09090b] text-white selection:bg-purple-500/30">
            <Navbar isScrolled={isScrolled} mobileMenuOpen={false} setMobileMenuOpen={() => { }} setIsModalOpen={() => { }} />

            {/* Status Notification */}
            {status.type && (
                <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 ${status.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-500'
                    }`}>
                    {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <span className="text-sm font-bold">{status.message}</span>
                    <button onClick={() => setStatus({ type: null, message: '' })} className="ml-4 hover:opacity-70"><X size={16} /></button>
                </div>
            )}

            <main className="pt-32 pb-24 max-w-7xl mx-auto px-4 md:px-6">
                <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-start">

                    {/* LEFT: FORM UPLOAD */}
                    <section className="space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-500/20">
                                <Sparkles className="text-purple-500" size={20} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Tulis Berita Baru</h1>
                                <p className="text-gray-500 text-sm">Kelola informasi sekolah dengan mudah.</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Judul Berita</label>
                                <input
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Ketik judul berita yang menarik..."
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-purple-500 outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Konten Lengkap</label>
                                <textarea
                                    required
                                    rows={8}
                                    value={formData.content}
                                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                    placeholder="Tuliskan berita lengkap di sini..."
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-purple-500 outline-none transition-all resize-none"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Foto Utama</label>
                                    <div className="relative group overflow-hidden rounded-2xl border-2 border-white/5 border-dashed hover:border-purple-500/50 transition-all aspect-video flex flex-col items-center justify-center bg-black/20">
                                        {isUploadingImg ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="animate-spin text-purple-500" />
                                                <span className="text-xs text-gray-500">Mengunggah & Kompres...</span>
                                            </div>
                                        ) : formData.image_url ? (
                                            <div className="relative w-full h-full">
                                                <Image src={formData.image_url} alt="Preview" fill className="object-cover" />
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))} className="bg-red-500 p-3 rounded-full"><Trash2 size={20} /></button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-3 text-gray-500">
                                                <ImageIcon size={40} />
                                                <span className="text-sm">Klik untuk upload foto</span>
                                            </div>
                                        )}
                                        <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" disabled={isUploadingImg} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Sumber Foto (Opsional)</label>
                                    <input
                                        value={formData.image_source}
                                        onChange={(e) => setFormData(prev => ({ ...prev, image_source: e.target.value }))}
                                        placeholder="Contoh: Dokumentasi OSIS"
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-purple-500 outline-none transition-all"
                                    />
                                    <p className="text-[10px] text-gray-500 ml-1">Akan ditampilkan di bawah foto berita.</p>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || isUploadingImg}
                                className="w-full py-5 bg-white text-black font-extrabold rounded-2xl hover:bg-gray-200 flex justify-center items-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : <Send size={20} />} Terbitkan Sekarang
                            </button>
                        </form>
                    </section>

                    {/* RIGHT: LIST BERITA */}
                    <aside className="space-y-8 bg-white/5 border border-white/10 p-6 rounded-3xl sticky top-32">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <FileText className="text-purple-400" size={20} /> Riwayat Berita
                            </h2>
                            <span className="text-[10px] font-bold bg-white/10 px-2 py-1 rounded-full text-gray-400">{news.length}</span>
                        </div>

                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {isLoading ? (
                                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-purple-500" /></div>
                            ) : news.length > 0 ? (
                                news.map(post => (
                                    <div key={post.id} className="group p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-white/20 transition-all flex gap-4">
                                        <div className="relative h-16 w-16 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                                            <Image src={post.image_url} alt={post.title} fill className="object-cover" />
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <h4 className="text-sm font-bold truncate mb-1">{post.title}</h4>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] text-gray-500 flex items-center gap-1"><Calendar size={10} /> {new Date(post.created_at).toLocaleDateString('id-ID')}</span>
                                                <button onClick={() => handleDelete(post.id)} className="p-1.5 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 text-sm py-12">Belum ada berita.</p>
                            )}
                        </div>
                    </aside>

                </div>
            </main>

            <Footer />
        </div>
    );
}
