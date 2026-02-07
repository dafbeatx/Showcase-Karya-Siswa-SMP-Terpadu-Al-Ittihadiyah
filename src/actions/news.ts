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

// ============================================================
// NEWS ENGAGEMENT FEATURES
// ============================================================

// Increment view count
export async function incrementViewCount(newsId: string) {
    if (!newsId) return { success: false };

    try {
        const supabase = await createClient();
        if (!supabase) return { success: false };

        const { error } = await supabase.rpc('increment_view_count', { news_id: newsId });
        
        // Fallback if RPC doesn't exist
        if (error) {
            await supabase
                .from('news_posts')
                .update({ view_count: supabase.rpc('coalesce', { val: 'view_count', default_val: 0 }) })
                .eq('id', newsId);
        }

        return { success: true };
    } catch {
        return { success: false };
    }
}

// Get engagement stats (view count + reaction counts)
export async function getNewsEngagement(newsId: string) {
    if (!newsId) return null;

    try {
        const supabase = await createClient();
        if (!supabase) return null;

        // Get view count
        const { data: post } = await supabase
            .from('news_posts')
            .select('view_count')
            .eq('id', newsId)
            .single();

        // Get reaction counts
        const { data: reactions } = await supabase
            .from('news_reactions')
            .select('reaction_type')
            .eq('news_id', newsId);

        const reactionCounts = {
            like: 0,
            love: 0,
            wow: 0,
            sad: 0,
            angry: 0
        };

        reactions?.forEach((r: { reaction_type: string }) => {
            const type = r.reaction_type as keyof typeof reactionCounts;
            if (reactionCounts[type] !== undefined) {
                reactionCounts[type]++;
            }
        });

        return {
            viewCount: post?.view_count || 0,
            reactions: reactionCounts
        };
    } catch {
        return null;
    }
}

// Add comment
export async function addComment(newsId: string, authorName: string, content: string) {
    if (!newsId || !authorName || !content) {
        return { success: false, error: 'Data tidak lengkap.' };
    }

    if (authorName.length < 2) {
        return { success: false, error: 'Nama minimal 2 karakter.' };
    }

    if (content.length < 3) {
        return { success: false, error: 'Komentar minimal 3 karakter.' };
    }

    try {
        const supabase = await createClient();
        if (!supabase) return { success: false, error: 'Gagal terhubung.' };

        const { data, error } = await supabase
            .from('news_comments')
            .insert({
                news_id: newsId,
                author_name: authorName.trim(),
                content: content.trim()
            })
            .select()
            .single();

        if (error) return { success: false, error: error.message };

        revalidatePath(`/news/${newsId}`);
        return { success: true, data };
    } catch {
        return { success: false, error: 'Gagal mengirim komentar.' };
    }
}

// Get comments for a news post
export async function getComments(newsId: string) {
    if (!newsId) return [];

    try {
        const supabase = await createClient();
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('news_comments')
            .select('*')
            .eq('news_id', newsId)
            .order('created_at', { ascending: false });

        if (error) return [];
        return data || [];
    } catch {
        return [];
    }
}

// Delete comment (admin only)
export async function deleteComment(commentId: string) {
    if (!commentId) return { success: false };

    try {
        const supabase = await createClient();
        if (!supabase) return { success: false };

        const { error } = await supabase
            .from('news_comments')
            .delete()
            .eq('id', commentId);

        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch {
        return { success: false };
    }
}

// Add reaction
export async function addReaction(newsId: string, reactionType: string, sessionId: string) {
    if (!newsId || !reactionType) {
        return { success: false };
    }

    const validTypes = ['like', 'love', 'wow', 'sad', 'angry'];
    if (!validTypes.includes(reactionType)) {
        return { success: false };
    }

    try {
        const supabase = await createClient();
        if (!supabase) return { success: false };

        // Check if user already reacted with this type
        const { data: existing } = await supabase
            .from('news_reactions')
            .select('id')
            .eq('news_id', newsId)
            .eq('session_id', sessionId)
            .eq('reaction_type', reactionType)
            .single();

        if (existing) {
            // Remove reaction (toggle off)
            await supabase
                .from('news_reactions')
                .delete()
                .eq('id', existing.id);
            
            return { success: true, action: 'removed' };
        } else {
            // Add reaction
            await supabase
                .from('news_reactions')
                .insert({
                    news_id: newsId,
                    reaction_type: reactionType,
                    session_id: sessionId
                });
            
            return { success: true, action: 'added' };
        }
    } catch {
        return { success: false };
    }
}

// Get user's reactions for a post
export async function getUserReactions(newsId: string, sessionId: string) {
    if (!newsId || !sessionId) return [];

    try {
        const supabase = await createClient();
        if (!supabase) return [];

        const { data } = await supabase
            .from('news_reactions')
            .select('reaction_type')
            .eq('news_id', newsId)
            .eq('session_id', sessionId);

        return data?.map(r => r.reaction_type) || [];
    } catch {
        return [];
    }
}

