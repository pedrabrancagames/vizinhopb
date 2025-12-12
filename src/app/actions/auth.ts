'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}

export async function getUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Buscar dados do perfil
    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

    return profile
}

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Não autenticado' }
    }

    const name = formData.get('name') as string
    const bio = formData.get('bio') as string
    const neighborhood = formData.get('neighborhood') as string

    const { error } = await supabase
        .from('users')
        .update({
            name,
            bio,
            neighborhood,
        })
        .eq('id', user.id)

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}
