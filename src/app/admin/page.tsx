'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { uploadNewsPost, uploadNewsImage } from '@/actions/news';
import { Sparkles, Send, Loader2, ImageIcon, Trash2, AlertCircle, CheckCircle2, X } from 'lucide-react';
import Image from 'next/image';
import { compressImage } from '@/utils/helpers';
import Link from 'next/link';

export default function AdminPage() {
    const isScrolled = true;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploadingImg, setIsUploadingImg] = useState(false);

    // Status Notification State
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info' | null; message: string }>({
        type: null,
        message: ''
    });

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        image_url: '',
        image_source: '',
        category: 'Kegiatan',
        author_name: '',
        author_role: ''
    });

    const showStatus = (type: 'success' | 'error', message: string) => {
        setStatus({ type, message });
        setTimeout(() => setStatus({ type: null, message: '' }), 5000);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 1. Validation
        if (!file.type.startsWith('image/')) {
            return showStatus('error', 'File harus berupa gambar (JPG, PNG, dll).');
        }
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            return showStatus('error', 'Ukuran gambar terlalu besar (Maks 10MB sebelum kompres).');
        }

        setIsUploadingImg(true);
        setStatus({ type: 'info', message: 'Mengompres gambar...' });

        try {
            // 2. Client-side optimization (Convert to WebP & Resize)
            const compressedBlob = await compressImage(file);
            const finalFile = new File([compressedBlob], 'upload.webp', { type: 'image/webp' });

            setStatus({ type: 'info', message: 'Mengunggah gambar...' });

            // 3. Upload to Supabase
            const url = await uploadNewsImage(finalFile);
            setFormData(prev => ({ ...prev, image_url: url }));
            showStatus('success', 'Gambar berhasil dioptimalkan & diunggah.');
        } catch (error) {
            console.error(error);
            showStatus('error', 'Gagal memproses gambar: ' + (error instanceof Error ? error.message : 'Terjadi kesalahan.'));
        } finally {
            setIsUploadingImg(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.image_url) return showStatus('error', 'Silakan upload foto berita terlebih dahulu.');

        setIsSubmitting(true);
        try {
            const result = await uploadNewsPost(formData);
            if (result.success) {
                showStatus('success', 'Berita berhasil diterbitkan!');
                setFormData({
                    title: '',
                    content: '',
                    image_url: '',
                    image_source: '',
                    category: 'Kegiatan',
                    author_name: '',
                    author_role: ''
                });
                // Redirect back to home after success maybe?
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            } else {
                showStatus('error', 'Gagal menerbitkan: ' + (result.error || 'Terjadi kesalahan.'));
            }
        } catch (error) {
            console.error('Submit Error:', error);
            showStatus('error', 'Gagal menerbitkan: ' + (error instanceof Error ? error.message : 'Terjadi kesalahan sistem.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-emerald-500/30">
            <Navbar isScrolled={isScrolled} />

            {/* Status Notification */}
            {status.type && (
                <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 ${status.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                    status.type === 'info' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                        'bg-red-500/10 border-red-500/20 text-red-500'
                    }`}>
                    {status.type === 'success' ? <CheckCircle2 size={20} /> :
                        status.type === 'info' ? <Loader2 className="animate-spin" size={20} /> :
                            <AlertCircle size={20} />}
                    <span className="text-sm font-bold">{status.message}</span>
                    <button onClick={() => setStatus({ type: null, message: '' })} className="ml-4 hover:opacity-70"><X size={16} /></button>
                </div>
            )}

            <main className="pt-24 md:pt-32 pb-16 md:pb-24 max-w-4xl mx-auto px-4 md:px-6">
                <header className="text-center space-y-3 md:space-y-4 mb-8 md:mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] md:text-xs font-black uppercase tracking-widest animate-fade-in-up">
                        <Sparkles size={16} /> Bagikan Cerita Sekolahmu
                    </div>
                    <h1 className="text-3xl md:text-6xl font-black tracking-tight">Tulis <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-green-500">Berita</span> Baru</h1>
                    <p className="text-gray-500 text-sm md:text-base font-medium">Informasi prestasi, kegiatan, atau pengumuman resmi sekolah.</p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8 bg-[var(--card-bg)] border border-[var(--border)] p-6 md:p-12 rounded-[32px] md:rounded-[40px] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-green-500 opacity-50"></div>

                    <div className="space-y-1.5 md:space-y-3">
                        <label className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Judul Berita</label>
                        <input
                            required
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Apa judul berita hari ini?"
                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl px-5 py-4 md:px-6 md:py-5 text-base md:text-lg font-bold text-[var(--foreground)] focus:border-[var(--accent)] outline-none transition-all shadow-sm"
                        />
                    </div>

                    <div className="space-y-1.5 md:space-y-3">
                        <label className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Konten Lengkap</label>
                        <textarea
                            required
                            rows={8}
                            value={formData.content}
                            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                            placeholder="Ceritakan sedetail mungkin..."
                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl px-5 py-4 md:px-6 md:py-5 text-sm md:text-base text-[var(--foreground)] focus:border-[var(--accent)] outline-none transition-all resize-none leading-relaxed shadow-sm font-medium"
                        />
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        <div className="space-y-1.5 md:space-y-3">
                            <label className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Kategori</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl px-5 py-4 md:px-6 md:py-5 text-sm md:text-base font-bold text-[var(--foreground)] focus:border-[var(--accent)] outline-none transition-all shadow-sm appearance-none cursor-pointer"
                            >
                                <option value="Kegiatan">Kegiatan</option>
                                <option value="Prestasi">Prestasi</option>
                                <option value="Pengumuman">Pengumuman</option>
                                <option value="PPDB">PPDB</option>
                            </select>
                        </div>

                        <div className="space-y-1.5 md:space-y-3">
                            <label className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Nama Penulis</label>
                            <input
                                value={formData.author_name}
                                onChange={(e) => setFormData(prev => ({ ...prev, author_name: e.target.value }))}
                                placeholder="Admin / Nama Siswa"
                                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl px-5 py-4 md:px-6 md:py-5 text-sm md:text-base font-bold text-[var(--foreground)] focus:border-[var(--accent)] outline-none transition-all shadow-sm"
                            />
                        </div>

                        <div className="space-y-1.5 md:space-y-3">
                            <label className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Jabatan/Peran</label>
                            <input
                                value={formData.author_role}
                                onChange={(e) => setFormData(prev => ({ ...prev, author_role: e.target.value }))}
                                placeholder="OSIS / Guru / Siswa"
                                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl px-5 py-4 md:px-6 md:py-5 text-sm md:text-base font-bold text-[var(--foreground)] focus:border-[var(--accent)] outline-none transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Foto Utama</label>
                            <div className="relative group overflow-hidden rounded-3xl border-2 border-[var(--border)] border-dashed hover:border-[var(--accent)]/50 transition-all aspect-video flex flex-col items-center justify-center bg-[var(--background)]/50 shadow-sm cursor-pointer">
                                {isUploadingImg ? (
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="animate-spin text-[var(--accent)]" size={32} />
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Memproses Foto...</span>
                                    </div>
                                ) : formData.image_url ? (
                                    <div className="relative w-full h-full">
                                        <Image src={formData.image_url} alt="Preview" fill className="object-cover" />
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button type="button" onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))} className="bg-red-500 p-4 rounded-full shadow-lg hover:scale-110 active:scale-90 transition-all"><Trash2 size={24} className="text-white" /></button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-4 text-gray-500 group-hover:text-[var(--accent)] transition-colors">
                                        <div className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center border border-[var(--border)]"><ImageIcon size={32} /></div>
                                        <span className="text-sm font-bold uppercase tracking-widest">Klik untuk unggah</span>
                                    </div>
                                )}
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" disabled={isUploadingImg} />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Sumber Foto (Opsional)</label>
                                <input
                                    value={formData.image_source}
                                    onChange={(e) => setFormData(prev => ({ ...prev, image_source: e.target.value }))}
                                    placeholder="Dokumentasi Panitia"
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl px-6 py-5 text-[var(--foreground)] focus:border-[var(--accent)] outline-none transition-all shadow-sm"
                                />
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">Contoh: Dokumentasi OSIS / Nama Siswa</p>
                            </div>

                            <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 space-y-2">
                                <h4 className="text-xs font-bold text-blue-500 uppercase tracking-widest">Informasi</h4>
                                <p className="text-xs text-blue-500/70 leading-relaxed font-medium">Berita yang Anda kirim akan melalui proses moderasi oleh admin sebelum ditampilkan sebagai featured.</p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || isUploadingImg}
                        className="w-full py-4.5 md:py-6 bg-[var(--accent)] text-white font-black text-base md:text-xl rounded-xl md:rounded-2xl hover:opacity-90 flex justify-center items-center gap-2 md:gap-3 transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-emerald-500/20 uppercase tracking-widest"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                        <span>{isSubmitting ? 'Menerbitkan...' : 'Terbitkan Cerita'}</span>
                    </button>
                </form>

                <div className="mt-12 text-center">
                    <Link href="/" className="text-gray-500 hover:text-[var(--foreground)] transition-colors font-bold text-sm uppercase tracking-[0.2em]">Batal & Kembali ke Beranda</Link>
                </div>
            </main>

            <Footer />
        </div >
    );
}
