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
    // Get total products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, quantity_in_stock, cost_price, selling_price')

    if (productsError) throw productsError

    // Get total sales
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('id, total_amount, quantity_sold')

    if (salesError) throw salesError

    // Calculate KPIs
    const totalProducts = products?.length || 0
    const totalStockValue = products?.reduce(
      (sum, p) => sum + p.quantity_in_stock * p.cost_price,
      0
    ) || 0
    const totalSalesRevenue = sales?.reduce((sum, s) => sum + s.total_amount, 0) || 0
    const totalRevenue = totalSalesRevenue
    const totalCost = sales?.reduce((sum, s) => {
      const product = products?.find((p) => p.id === s.id)
      return sum + (product?.cost_price || 0) * s.quantity_sold
    }, 0) || 0
    const totalProfit = totalRevenue - totalCost

    return NextResponse.json({
      totalProducts,
      totalStockValue,
      totalRevenue,
      totalProfit,
      profitMargin: totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(2) : 0,
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
