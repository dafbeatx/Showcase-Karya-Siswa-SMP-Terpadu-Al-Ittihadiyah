'use server';

import { createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export async function getNewsPosts(params?: {
    category?: string;
    search?: string;
    status?: 'pending' | 'published' | 'rejected' | 'all';
    limit?: number;
    offset?: number;
}) {
    try {
        const supabase = await createClient();
        if (!supabase) return { data: [], count: 0 };

        let query = supabase
            .from('news_posts')
            .select('*', { count: 'exact' });

        // Filter by Status (Admins can see all, Public only published via RLS anyway, but good to be explicit here)
        if (params?.status && params.status !== 'all') {
            query = query.eq('status', params.status);
        } else if (!params?.status) {
            // Default behavior for public or general fetch
            query = query.eq('status', 'published');
        }

        // Filter by Category
        if (params?.category && params.category !== 'All') {
            query = query.eq('category', params.category);
        }

        // Search in Title or Content
        if (params?.search) {
            query = query.or(`title.ilike.%${params.search}%,content.ilike.%${params.search}%`);
        }

        // Sorting & Pagination
        query = query
            .order('is_featured', { ascending: false })
            .order('created_at', { ascending: false });

        if (params?.limit) {
            const start = params.offset || 0;
            const end = start + params.limit - 1;
            query = query.range(start, end);
        }

        const { data, error, count } = await query;

        if (error) {
            console.error('Error fetching news:', error);
            return { data: [], count: 0 };
        }
        return { data: data || [], count: count || 0 };
    } catch (e) {
        console.error('getNewsPosts unexpected error:', e);
        return { data: [], count: 0 };
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

export async function uploadNewsPost(formData: {
    title: string;
    content: string;
    image_url: string;
    image_source?: string;
    category?: string;
    author_name?: string;
    author_role?: string;
    is_featured?: boolean
}) {
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
                    category: formData.category || 'Kegiatan',
                    author_name: formData.author_name?.trim() || '',
                    author_role: formData.author_role?.trim() || '',
                    is_featured: formData.is_featured || false,
                    status: 'pending' // Force moderation
                },
            ])
            .select();

        if (error) return { success: false, error: error.message };

        revalidatePath('/');
        revalidatePath('/admin/dashboard');
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

export async function updateNewsPost(id: string, formData: {
    title: string;
    content: string;
    image_url: string;
    image_source?: string;
    category?: string;
    author_name?: string;
    author_role?: string;
    is_featured?: boolean;
    status?: string;
}) {
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
                category: formData.category,
                author_name: formData.author_name?.trim(),
                author_role: formData.author_role?.trim(),
                is_featured: formData.is_featured,
                status: formData.status
            })
            .eq('id', id)
            .select();

        if (error) return { success: false, error: error.message };

        revalidatePath('/');
        revalidatePath(`/news/${id}`);
        revalidatePath('/admin/dashboard');
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

export async function updateNewsStatus(id: string, status: 'published' | 'pending' | 'rejected') {
    if (!id || !status) return { success: false, error: 'Data tidak valid.' };

    try {
        const supabase = await createClient();
        if (!supabase) return { success: false, error: 'Gagal terhubung ke database.' };

        const { error } = await supabase
            .from('news_posts')
            .update({ status })
            .eq('id', id);

        if (error) return { success: false, error: error.message };

        revalidatePath('/');
        revalidatePath(`/news/${id}`);
        revalidatePath('/admin/dashboard');
        return { success: true };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
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
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
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
    } catch (error) {
        throw error;
    }
}
