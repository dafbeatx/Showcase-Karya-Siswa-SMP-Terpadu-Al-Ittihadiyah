'use server';

import { createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export async function getNewsPosts() {
    try {
        const supabase = await createClient();
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('news_posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching news:', error);
            return [];
        }
        return data || [];
    } catch (e) {
        console.error('getNewsPosts unexpected error:', e);
        return [];
    }
}

export async function getNewsPostById(id: string) {
    try {
        if (!id) return null;
        const supabase = await createClient();
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('news_posts')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching news detail:', error);
            return null;
        }
        return data;
    } catch (e) {
        console.error('getNewsPostById unexpected error:', e);
        return null;
    }
}

export async function uploadNewsPost(formData: { title: string; content: string; image_url: string; image_source?: string; is_featured?: boolean }) {
    if (!formData.title || !formData.content || !formData.image_url) {
        return { success: false, error: 'Judul, konten, dan gambar wajib diisi.' };
    }

    try {
        const supabase = await createClient();
        if (!supabase) return { success: false, error: 'Gagal terhubung ke database.' };

        const { data, error } = await supabase
            .from('news_posts')
            .insert([
                {
                    title: formData.title.trim(),
                    content: formData.content.trim(),
                    image_url: formData.image_url,
                    image_source: formData.image_source?.trim() || '',
                    is_featured: formData.is_featured || false,
                },
            ])
            .select();

        if (error) return { success: false, error: error.message };

        revalidatePath('/');
        return { success: true, data };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function updateNewsPost(id: string, formData: { title: string; content: string; image_url: string; image_source?: string; is_featured?: boolean }) {
    if (!id || !formData.title || !formData.content) {
        return { success: false, error: 'Data tidak lengkap.' };
    }

    try {
        const supabase = await createClient();
        if (!supabase) return { success: false, error: 'Gagal terhubung ke database.' };

        const { data, error } = await supabase
            .from('news_posts')
            .update({
                title: formData.title.trim(),
                content: formData.content.trim(),
                image_url: formData.image_url,
                image_source: formData.image_source?.trim() || '',
                is_featured: formData.is_featured || false,
            })
            .eq('id', id)
            .select();

        if (error) return { success: false, error: error.message };

        revalidatePath('/');
        revalidatePath(`/news/${id}`);
        return { success: true, data };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function deleteNewsPost(id: string) {
    if (!id) return { success: false, error: 'ID berita tidak valid.' };

    try {
        const supabase = await createClient();
        if (!supabase) return { success: false, error: 'Gagal terhubung ke database.' };

        const { error } = await supabase
            .from('news_posts')
            .delete()
            .eq('id', id);

        if (error) return { success: false, error: error.message };

        revalidatePath('/');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function uploadNewsImage(file: File) {
    if (!file) throw new Error('File tidak ditemukan.');

    try {
        const supabase = await createClient();
        if (!supabase) throw new Error('Konfigurasi Supabase tidak ditemukan.');

        const fileExt = 'webp'; // Enforced WebP for optimization
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `news/${fileName}`;

        const { error } = await supabase.storage
            .from('school-news')
            .upload(filePath, file);

        if (error) throw new Error('Gagal unggah gambar: ' + error.message);

        const { data: { publicUrl } } = supabase.storage
            .from('school-news')
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (e: any) {
        throw e;
    }
}
