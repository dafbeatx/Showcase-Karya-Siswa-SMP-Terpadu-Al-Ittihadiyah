import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        if (typeof window !== 'undefined') {
            console.error('Supabase configuration is missing. Please check your environment variables.');
        }
        return null;
    }

    return createBrowserClient(
        supabaseUrl,
        supabaseAnonKey
    )
}
