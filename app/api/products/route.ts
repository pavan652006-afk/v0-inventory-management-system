import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log('[v0] Unauthorized products request')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[v0] Fetching products for user:', user.id)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.log('[v0] Supabase error fetching products:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to fetch products' },
        { status: 500 }
      )
    }

    console.log('[v0] Successfully fetched', data?.length || 0, 'products')
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('[v0] Fetch products error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log('[v0] Unauthorized product creation request')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body
    try {
      body = await request.json()
    } catch (e) {
      console.error('[v0] Failed to parse request body:', e)
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { name, supplier, quantity_in_stock, cost_price, selling_price } = body

    console.log('[v0] Creating product:', { name, supplier, quantity_in_stock, cost_price, selling_price, created_by: user.id })

    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          name,
          supplier,
          quantity_in_stock,
          cost_price,
          selling_price,
          created_by: user.id,
        },
      ])
      .select()

    if (error) {
      console.log('[v0] Supabase error creating product:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create product' },
        { status: 500 }
      )
    }

    console.log('[v0] Product created successfully:', data?.[0]?.id)
    return NextResponse.json(data?.[0] || {}, { status: 201 })
  } catch (error) {
    console.error('[v0] Create product error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create product' },
      { status: 500 }
    )
  }
}
