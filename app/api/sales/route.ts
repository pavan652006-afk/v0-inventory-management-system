import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        products:product_id (
          name,
          cost_price,
          selling_price
        )
      `)
      .eq('recorded_by', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Fetch sales error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sales' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { product_id, quantity_sold, unit_price } = body

    // Check if product exists and has enough stock
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', product_id)
      .single()

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    if (product.quantity_in_stock < quantity_sold) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      )
    }

    const total_amount = quantity_sold * unit_price

    // Create sale record
    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .insert([
        {
          product_id,
          quantity_sold,
          unit_price,
          total_amount,
          recorded_by: user.id,
        },
      ])
      .select()

    if (saleError) throw saleError

    // Update product stock
    const { error: updateError } = await supabase
      .from('products')
      .update({
        quantity_in_stock: product.quantity_in_stock - quantity_sold,
        updated_at: new Date().toISOString(),
      })
      .eq('id', product_id)

    if (updateError) throw updateError

    // Create inventory history record
    const { error: historyError } = await supabase
      .from('inventory_history')
      .insert([
        {
          product_id,
          quantity_change: -quantity_sold,
          transaction_type: 'sale',
          reference_id: saleData[0].id,
        },
      ])

    if (historyError) throw historyError

    return NextResponse.json(saleData[0], { status: 201 })
  } catch (error) {
    console.error('Create sale error:', error)
    return NextResponse.json(
      { error: 'Failed to record sale' },
      { status: 500 }
    )
  }
}
