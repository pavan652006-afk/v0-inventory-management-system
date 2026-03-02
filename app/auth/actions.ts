'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signUp(email: string, password: string, fullName: string) {
  console.log('[v0] signUp called with email:', email)
  const supabase = await createClient()

  const redirectUrl = process.env.NEXT_PUBLIC_APP_URL 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
    : 'http://localhost:3000/auth/callback'

  console.log('[v0] Redirect URL:', redirectUrl)

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: {
        full_name: fullName,
      },
    },
  })

  console.log('[v0] SignUp response - error:', error, 'user:', data?.user?.id)

  if (error) {
    console.error('[v0] SignUp error details:', {
      message: error.message,
      status: error.status,
      code: error.code,
    })
    return { error: error.message }
  }

  console.log('[v0] User created successfully, redirecting to signup-success')
  revalidatePath('/', 'layout')
  redirect('/auth/signup-success')
}

export async function signIn(email: string, password: string) {
  console.log('[v0] signIn called with email:', email)
  const supabase = await createClient()
  console.log('[v0] Supabase client created')

  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  console.log('[v0] Auth response - error:', error, 'user:', data?.user?.id)

  if (error) {
    console.log('[v0] SignIn error:', error.message)
    return { error: error.message }
  }

  console.log('[v0] SignIn successful, revalidating and redirecting')
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/auth/login')
}
