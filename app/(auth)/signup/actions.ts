'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signup(formData: FormData) {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')

  const headerList = await headers()
  const origin =
    headerList.get('origin') ??
    (headerList.get('host')
      ? `https://${headerList.get('host')}`
      : process.env.NEXT_PUBLIC_APP_URL) ??
    'http://localhost:3001'

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/callback`,
    },
  })

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/signup?check=email')
}
