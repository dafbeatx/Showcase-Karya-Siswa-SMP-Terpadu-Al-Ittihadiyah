'use server';

import { createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export async function getNewsPosts() {
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
    return data;
}

export async function getNewsPostById(id: string) {
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
}

export async function uploadNewsPost(formData: { title: string; content: string; image_url: string; image_source?: string }) {
    const supabase = await createClient();
    if (!supabase) throw new Error('Konfigurasi Supabase tidak ditemukan.');

    const { data, error } = await supabase
        .from('news_posts')
        .insert([
            {
                title: formData.title,
                content: formData.content,
                image_url: formData.image_url,
                image_source: formData.image_source || '',
            },
        ]);

    if (error) {
        console.error('Database Insert Error:', error);
        throw new Error('Gagal menyimpan data berita ke database: ' + error.message);
    }

    revalidatePath('/');
    return data;
}

export async function deleteNewsPost(id: string) {
    const supabase = await createClient();
    if (!supabase) throw new Error('Konfigurasi Supabase tidak ditemukan.');

    const { error } = await supabase
        .from('news_posts')
        .delete()
        .eq('id', id);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath('/');
}

export async function uploadNewsImage(file: File) {
    const supabase = await createClient();
    if (!supabase) throw new Error('Konfigurasi Supabase tidak ditemukan.');

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `news/${fileName}`;

    const { data, error } = await supabase.storage
        .from('school-news')
        .upload(filePath, file);

    if (error) {
        throw new Error(error.message);
    }

    const { data: { publicUrl } } = supabase.storage
        .from('school-news')
        .getPublicUrl(filePath);

    return publicUrl;
}
