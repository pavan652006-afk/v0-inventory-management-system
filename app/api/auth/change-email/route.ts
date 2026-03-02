import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { newEmail } = await request.json()

    if (!newEmail) {
      return NextResponse.json({ error: 'New email is required' }, { status: 400 })
    }

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Update email in auth
    const { error } = await supabase.auth.updateUser({
      email: newEmail,
    })

    if (error) {
      console.error('[v0] Email change error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to change email' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Email change request sent. Please check your email to confirm the change.',
      email: newEmail,
    })
  } catch (error) {
    console.error('[v0] Email change exception:', error)
    return NextResponse.json(
      { error: 'Failed to change email' },
      { status: 500 }
    )
  }
}
