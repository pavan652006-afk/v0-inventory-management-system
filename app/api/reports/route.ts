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
    // Get all products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')

    if (productsError) throw productsError

    // Get all sales
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('*')

    if (salesError) throw salesError

    // Get inventory history
    const { data: history, error: historyError } = await supabase
      .from('inventory_history')
      .select('*')

    if (historyError) throw historyError

    // Calculate metrics
    const totalRevenue = sales?.reduce((sum, s) => sum + s.total_amount, 0) || 0
    const totalCost = sales?.reduce((sum, s) => {
      const product = products?.find((p) => p.id === s.product_id)
      return sum + (product?.cost_price || 0) * s.quantity_sold
    }, 0) || 0
    const totalProfit = totalRevenue - totalCost

    // Top products by revenue
    const productRevenue = sales?.reduce((acc: any, s) => {
      const existing = acc.find((item: any) => item.productId === s.product_id)
      const product = products?.find((p) => p.id === s.product_id)
      if (existing) {
        existing.revenue += s.total_amount
        existing.quantity += s.quantity_sold
      } else {
        acc.push({
          productId: s.product_id,
          productName: product?.name || 'Unknown',
          revenue: s.total_amount,
          quantity: s.quantity_sold,
        })
      }
      return acc
    }, []) || []

    // Monthly sales trend
    const monthlySales = sales?.reduce((acc: any, s) => {
      const date = new Date(s.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const existing = acc.find((item: any) => item.month === monthKey)
      if (existing) {
        existing.revenue += s.total_amount
        existing.count += 1
      } else {
        acc.push({
          month: monthKey,
          revenue: s.total_amount,
          count: 1,
        })
      }
      return acc
    }, []) || []

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalCost,
        totalProfit,
        profitMargin: totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(2) : 0,
        totalProducts: products?.length || 0,
        totalSales: sales?.length || 0,
      },
      productRevenue: productRevenue.sort((a: any, b: any) => b.revenue - a.revenue),
      monthlySales: monthlySales.sort((a: any, b: any) => a.month.localeCompare(b.month)),
    })
  } catch (error) {
    console.error('Reports error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}
