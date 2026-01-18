'use server';

import { createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export async function getProjects() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('student_projects')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching projects:', error);
        return [];
    }
    return data;
}

export async function uploadProject(formData: any) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('student_projects')
        .insert([
            {
                title: formData.title,
                student_name: formData.student_name,
                class: formData.class,
                category: formData.category,
                description: formData.description,
                image_url: formData.image_url,
                drive_link: formData.drive_link,
                tags: formData.tags ? formData.tags.split(',').map((t: string) => t.trim()) : [],
            },
        ]);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath('/');
    return data;
}

export async function deleteProject(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('student_projects')
        .delete()
        .eq('id', id);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath('/');
}

export async function uploadImage(file: File) {
    const supabase = await createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
        .from('showcase-projects')
        .upload(filePath, file);

    if (error) {
        throw new Error(error.message);
    }

    const { data: { publicUrl } } = supabase.storage
        .from('showcase-projects')
        .getPublicUrl(filePath);

    return publicUrl;
}
