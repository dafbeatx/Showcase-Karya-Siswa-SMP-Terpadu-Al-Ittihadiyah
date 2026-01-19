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

export async function uploadNewsPost(formData: { title: string; content: string; image_url: string; image_source?: string }) {
    console.log('Starting uploadNewsPost with data:', { ...formData, content: formData.content?.substring(0, 20) + '...' });

    // Validation
    if (!formData.title || !formData.content || !formData.image_url) {
        return { success: false, error: 'Judul, konten, dan gambar wajib diisi.' };
    }

    try {
        const supabase = await createClient();
        if (!supabase) {
            return { success: false, error: 'Gagal terhubung ke database. Periksa konfigurasi server.' };
        }

        const { data, error } = await supabase
            .from('news_posts')
            .insert([
                {
                    title: formData.title.trim(),
                    content: formData.content.trim(),
                    image_url: formData.image_url,
                    image_source: formData.image_source?.trim() || '',
                },
            ])
            .select();

        if (error) {
            console.error('Database Insert Error:', error);
            return { success: false, error: 'Database Error: ' + error.message };
        }

        console.log('News post uploaded successfully');
        revalidatePath('/');
        return { success: true, data };
    } catch (e: any) {
        console.error('uploadNewsPost unexpected error:', e);
        return { success: false, error: 'Server Error: ' + (e.message || 'Terjadi kesalahan sistem internal.') };
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

        if (error) {
            console.error('Delete error:', error);
            return { success: false, error: error.message };
        }

        revalidatePath('/');
        return { success: true };
    } catch (e: any) {
        console.error('deleteNewsPost unexpected error:', e);
        return { success: false, error: e.message };
    }
}

export async function uploadNewsImage(file: File) {
    console.log('Starting uploadNewsImage, file:', file.name, 'size:', file.size);

    if (!file) {
        throw new Error('File tidak ditemukan.');
    }

    try {
        const supabase = await createClient();
        if (!supabase) throw new Error('Konfigurasi Supabase tidak ditemukan.');

        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `news/${fileName}`;

        console.log('Uploading to bucket: school-news, path:', filePath);

        const { data, error } = await supabase.storage
            .from('school-news')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Storage Upload Error:', error);
            throw new Error('Gagal unggah gambar: ' + error.message);
        }

        const { data: { publicUrl } } = supabase.storage
            .from('school-news')
            .getPublicUrl(filePath);

        console.log('Image uploaded successfully, public URL:', publicUrl);
        return publicUrl;
    } catch (e: any) {
        console.error('uploadNewsImage unexpected error:', e);
        throw e; // We still throw here because the client catches it specifically in handleImageUpload
    }
}
