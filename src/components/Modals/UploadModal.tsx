'use client';

import React, { useState } from 'react';
import { X, Sparkles, Edit3, ImageIcon, Link as LinkIcon, Upload, Loader2, Send, FolderOpen } from 'lucide-react';
import { compressImage } from '@/utils/helpers';
import { uploadImage } from '@/actions/projects';

interface UploadModalProps {
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
    onSubmit: (formData: any) => Promise<void>;
    isSubmitting: boolean;
}

export default function UploadModal({ isModalOpen, setIsModalOpen, onSubmit, isSubmitting }: UploadModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        student_name: '',
        class: '',
        category: '',
        description: '',
        image_url: '',
        drive_link: '',
        tags: ''
    });

    const [imageUploadMode, setImageUploadMode] = useState<'file' | 'link'>('file');
    const [isProcessingImg, setIsProcessingImg] = useState(false);
    const [isCustomCategory, setIsCustomCategory] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const predefinedFormCategories = ["Tech", "Art", "Science"];

    if (!isModalOpen) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCategorySelect = (cat: string) => {
        if (cat === "Custom") {
            setIsCustomCategory(true);
            setFormData(prev => ({ ...prev, category: '' }));
        } else {
            setIsCustomCategory(false);
            setFormData(prev => ({ ...prev, category: cat }));
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsProcessingImg(true);
            try {
                // Just store the file, compression and upload will happen on submit or could happen now.
                // Let's do it on select for better UX feedback.
                setSelectedFile(file);
            } finally {
                setIsProcessingImg(false);
            }
        }
    };

    const handleSubmitInternal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.category.trim()) return alert("Isi kategori!");

        let finalImageUrl = formData.image_url;

        try {
            if (imageUploadMode === 'file' && selectedFile) {
                // Upload to Supabase Storage
                finalImageUrl = await uploadImage(selectedFile);
            }

            await onSubmit({ ...formData, image_url: finalImageUrl });
            setIsModalOpen(false);
            setFormData({
                title: '',
                student_name: '',
                class: '',
                category: '',
                description: '',
                image_url: '',
                drive_link: '',
                tags: ''
            });
            setSelectedFile(null);
        } catch (error: any) {
            alert("Terjadi kesalahan: " + error.message);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center px-0 md:px-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-2xl bg-[#121214] border-t md:border border-white/10 rounded-t-3xl md:rounded-3xl p-6 md:p-8 h-[85vh] md:max-h-[90vh] overflow-y-auto relative shadow-2xl shadow-purple-900/20">
                <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto mb-6 md:hidden"></div>
                <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 p-2 rounded-full hover:bg-white/10 transition-colors hidden md:block"><X size={20} /></button>
                <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-gray-400 md:hidden"><X size={24} /></button>

                <h2 className="text-xl md:text-2xl font-bold mb-1 flex items-center gap-2 text-white"><Sparkles className="text-purple-500" /> Submit Karya</h2>
                <p className="text-gray-400 text-xs md:text-sm mb-6">Bagikan karyamu kepada seluruh teman sekolah.</p>

                <form onSubmit={handleSubmitInternal} className="space-y-4 pb-10 md:pb-0">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase ml-1">Judul Karya</label>
                            <input required name="title" value={formData.title} onChange={handleInputChange} placeholder="Misal: Robot Pintar" className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500 outline-none transition-colors" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase ml-1">Nama Siswa / Tim</label>
                            <input required name="student_name" value={formData.student_name} onChange={handleInputChange} placeholder="Misal: Ahmad & Tim" className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500 outline-none transition-colors" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase ml-1">Kategori</label>
                        <div className="flex gap-2 flex-wrap">
                            {[...predefinedFormCategories, "Custom"].map(cat => (
                                <button type="button" key={cat} onClick={() => handleCategorySelect(cat)}
                                    className={`flex-1 py-2.5 rounded-xl text-xs md:text-sm border transition-all ${(!isCustomCategory && formData.category === cat) || (isCustomCategory && cat === "Custom") ? 'bg-purple-600/20 border-purple-500 text-purple-300 font-bold' : 'bg-zinc-900 border-white/10 text-gray-400 hover:border-white/30'}`}>
                                    {cat === "Custom" ? "Lainnya..." : cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {isCustomCategory && (
                        <div className="relative animate-fade-in-up">
                            <Edit3 className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500" size={16} />
                            <input required name="category" value={formData.category} onChange={handleInputChange} placeholder="Ketik nama kategori..." className="w-full bg-zinc-900 border border-purple-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none" />
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase ml-1">Deskripsi</label>
                        <textarea required name="description" value={formData.description} onChange={handleInputChange} rows={3} placeholder="Ceritakan sedikit tentang karya ini..." className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500 outline-none resize-none" />
                    </div>

                    <div className="space-y-2 pt-2 border-t border-white/5 mt-2">
                        <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase ml-1 mb-2 block">Upload Media (Cover)</label>

                        <div className="flex gap-3 mb-3">
                            <button type="button" onClick={() => setImageUploadMode('file')} className={`flex-1 py-3 text-xs md:text-sm rounded-xl border flex items-center justify-center gap-2 transition-all ${imageUploadMode === 'file' ? 'bg-white text-black border-white shadow-lg' : 'bg-zinc-900 border-white/10 text-gray-400 hover:bg-zinc-800'}`}>
                                <ImageIcon size={16} /> Upload File
                            </button>
                            <button type="button" onClick={() => setImageUploadMode('link')} className={`flex-1 py-3 text-xs md:text-sm rounded-xl border flex items-center justify-center gap-2 transition-all ${imageUploadMode === 'link' ? 'bg-white text-black border-white shadow-lg' : 'bg-zinc-900 border-white/10 text-gray-400 hover:bg-zinc-800'}`}>
                                <LinkIcon size={16} /> Link Drive
                            </button>
                        </div>

                        <div className="animate-fade-in">
                            {imageUploadMode === 'file' ? (
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-zinc-900/50 border-2 border-white/10 border-dashed rounded-xl flex flex-col items-center justify-center pointer-events-none group-hover:border-purple-500/50 transition-colors">
                                        {isProcessingImg ? (
                                            <div className="flex flex-col items-center">
                                                <Loader2 className="animate-spin text-purple-500 mb-2" size={24} />
                                                <span className="text-gray-400 text-xs">Processing...</span>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload size={24} className="text-gray-500 mb-2" />
                                                <span className="text-gray-400 text-xs font-medium">Klik untuk pilih Foto</span>
                                                {selectedFile && <span className="text-green-400 text-[10px] mt-1 font-bold">{selectedFile.name} siap upload!</span>}
                                            </>
                                        )}
                                    </div>
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="w-full h-24 opacity-0 cursor-pointer" disabled={isProcessingImg} />
                                </div>
                            ) : (
                                <div className="relative">
                                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                    <input name="image_url" value={formData.image_url} onChange={handleInputChange} placeholder="https://drive.google.com/file/d/..." className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-purple-500 outline-none text-xs md:text-sm" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1 mt-2">
                        <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase ml-1">Link File Projek (Drive/Github)</label>
                        <div className="relative">
                            <FolderOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input required name="drive_link" value={formData.drive_link} onChange={handleInputChange} placeholder="https://drive.google.com/..." className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:border-purple-500 outline-none" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase ml-1">Tags</label>
                        <input name="tags" value={formData.tags} onChange={handleInputChange} placeholder="Tags (misal: IoT, Web)" className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none text-xs md:text-sm" />
                    </div>

                    <button type="submit" disabled={isSubmitting || isProcessingImg} className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 flex justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 shadow-lg shadow-white/5 mt-4">
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <Send size={18} />} Submit Sekarang
                    </button>
                </form>
            </div>
        </div>
    );
}
