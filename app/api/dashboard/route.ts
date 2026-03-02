import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get total products for this user
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, quantity_in_stock, cost_price, selling_price')
      .eq('created_by', user.id)

    if (productsError) throw productsError

    // Get total sales for this user - select all columns to work with existing schema
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('*')
      .eq('recorded_by', user.id)

    if (salesError) throw salesError

    // Calculate KPIs
    const totalProducts = products?.length || 0
    const totalStock = products?.reduce((sum, p) => sum + (p.quantity_in_stock || 0), 0) || 0
    const totalStockValue = products?.reduce(
      (sum, p) => sum + (p.quantity_in_stock || 0) * (p.cost_price || 0),
      0
    ) || 0
    // Try total_amount first, then amount, fallback to 0
    const totalRevenue = sales?.reduce((sum, s) => sum + ((s.total_amount || s.amount) || 0), 0) || 0
    const totalCost = products?.reduce((sum, p) => sum + ((p.quantity_in_stock || 0) * (p.cost_price || 0)), 0) || 0
    const totalProfit = totalRevenue - totalCost

    return NextResponse.json({
      totalProducts,
      totalStock,
      totalStockValue,
      totalRevenue,
      totalProfit,
      profitMargin: totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0',
    })
  } catch (error) {
    console.error('[v0] Dashboard error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
