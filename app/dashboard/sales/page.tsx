'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Product {
  id: string
  name: string
  quantity_in_stock: number
  cost_price: number
  selling_price: number
}

interface Sale {
  id: string
  product_id: string
  quantity_sold: number
  unit_price: number
  total_amount: number
  sale_date: string
  created_at: string
  products: {
    name: string
    cost_price: number
    selling_price: number
  }
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isRecordingSale, setIsRecordingSale] = useState(false)
  const [formData, setFormData] = useState({
    product_id: '',
    quantity_sold: '',
    unit_price: '',
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [salesRes, productsRes] = await Promise.all([
        fetch('/api/sales'),
        fetch('/api/products'),
      ])

      const salesData = await salesRes.json()
      const productsData = await productsRes.json()

      setSales(salesData)
      setProducts(productsData)
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRecordSale = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsRecordingSale(true)

    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: formData.product_id,
          quantity_sold: parseInt(formData.quantity_sold),
          unit_price: parseFloat(formData.unit_price),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to record sale')
        return
      }

      await fetchData()
      setFormData({
        product_id: '',
        quantity_sold: '',
        unit_price: '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsRecordingSale(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-600">Loading sales...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales</h1>
          <p className="text-gray-600 mt-2">Record and track your sales</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Record Sale</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record New Sale</DialogTitle>
              <DialogDescription>
                Enter the sale details below
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRecordSale} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                <Select value={formData.product_id} onValueChange={(value) =>
                  setFormData({ ...formData, product_id: value })
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} (Stock: {product.quantity_in_stock})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity Sold</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="0"
                  value={formData.quantity_sold}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity_sold: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit_price">Unit Price</Label>
                <Input
                  id="unit_price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.unit_price}
                  onChange={(e) =>
                    setFormData({ ...formData, unit_price: e.target.value })
                  }
                  required
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" disabled={isRecordingSale} className="w-full">
                {isRecordingSale ? 'Recording...' : 'Record Sale'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Records</CardTitle>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No sales recorded yet. Start recording sales to see them here.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">
                        {sale.products?.name || 'Unknown'}
                      </TableCell>
                      <TableCell className="text-right">
                        {sale.quantity_sold}
                      </TableCell>
                      <TableCell className="text-right">
                        ${sale.unit_price.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${sale.total_amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-gray-600">
                        {new Date(sale.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
