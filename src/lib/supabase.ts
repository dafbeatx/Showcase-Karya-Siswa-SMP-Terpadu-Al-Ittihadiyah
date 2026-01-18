import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('CRITICAL ERROR: Supabase environment variables are missing (Browser Client)!')
    }

    return createBrowserClient(
        supabaseUrl!,
        supabaseAnonKey!
    )
}
