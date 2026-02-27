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
import { Trash2, Edit } from 'lucide-react'

interface Product {
  id: string
  name: string
  supplier: string
  quantity_in_stock: number
  cost_price: number
  selling_price: number
  created_at: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    supplier: '',
    quantity_in_stock: '',
    cost_price: '',
    selling_price: '',
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      console.log('[v0] Starting fetchProducts')
      const response = await fetch('/api/products', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch((fetchError) => {
        console.error('[v0] Fetch network error:', fetchError)
        throw new Error(`Network error: ${fetchError.message}`)
      })

      console.log('[v0] Response status:', response.status)

      let errorData = null
      if (!response.ok) {
        try {
          errorData = await response.json()
        } catch (e) {
          console.error('[v0] Could not parse error response:', e)
        }
        throw new Error(
          errorData?.error || `HTTP error! status: ${response.status}`
        )
      }

      const data = await response.json().catch((parseError) => {
        console.error('[v0] JSON parse error:', parseError)
        throw new Error(`Failed to parse response: ${parseError.message}`)
      })

      console.log('[v0] Fetched data:', data)
      setProducts(Array.isArray(data) ? data : [])
      setError(null)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch products'
      console.error('[v0] Failed to fetch products:', errorMessage)
      setError(errorMessage)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAddingProduct(true)
    setError(null)

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantity_in_stock: parseInt(formData.quantity_in_stock),
          cost_price: parseFloat(formData.cost_price),
          selling_price: parseFloat(formData.selling_price),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add product')
      }

      await fetchProducts()
      setFormData({
        name: '',
        supplier: '',
        quantity_in_stock: '',
        cost_price: '',
        selling_price: '',
      })
    } catch (error) {
      console.error('[v0] Failed to add product:', error)
      setError(error instanceof Error ? error.message : 'Failed to add product')
    } finally {
      setIsAddingProduct(false)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    setDeletingId(id)
    setError(null)

    try {
      const response = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to delete product')
      }

      setProducts(products.filter(p => p.id !== id))
      console.log('[v0] Product deleted successfully:', id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete product'
      console.error('[v0] Delete error:', errorMessage)
      setError(errorMessage)
    } finally {
      setDeletingId(null)
    }
  }

  const profit = (product: Product) => {
    return (product.selling_price - product.cost_price).toFixed(2)
  }

  const profitMargin = (product: Product) => {
    const p = product.selling_price - product.cost_price
    return ((p / product.selling_price) * 100).toFixed(1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-slate-400">Loading products...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Products</h1>
          <p className="text-slate-400 mt-1">Manage your inventory products</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-white text-black hover:bg-slate-200">Add Product</Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Add New Product</DialogTitle>
              <DialogDescription className="text-slate-400">
                Enter the product details below
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300">Product Name</Label>
                <Input
                  id="name"
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="e.g., Widget A"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier" className="text-slate-300">Supplier</Label>
                <Input
                  id="supplier"
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="e.g., ABC Supplies"
                  value={formData.supplier}
                  onChange={(e) =>
                    setFormData({ ...formData, supplier: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-slate-300">Quantity in Stock</Label>
                <Input
                  id="quantity"
                  className="bg-slate-800 border-slate-700 text-white"
                  type="number"
                  placeholder="0"
                  value={formData.quantity_in_stock}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity_in_stock: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost" className="text-slate-300">Cost Price</Label>
                <Input
                  id="cost"
                  className="bg-slate-800 border-slate-700 text-white"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.cost_price}
                  onChange={(e) =>
                    setFormData({ ...formData, cost_price: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="selling" className="text-slate-300">Selling Price</Label>
                <Input
                  id="selling"
                  className="bg-slate-800 border-slate-700 text-white"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.selling_price}
                  onChange={(e) =>
                    setFormData({ ...formData, selling_price: e.target.value })
                  }
                  required
                />
              </div>
              <Button type="submit" disabled={isAddingProduct} className="w-full bg-blue-600 hover:bg-blue-700">
                {isAddingProduct ? 'Adding...' : 'Add Product'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Product Inventory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {products.length === 0 ? (
            <p className="text-slate-400 text-center py-8">
              No products yet. Add your first product to get started.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800">
                    <TableHead className="text-slate-300">Product Name</TableHead>
                    <TableHead className="text-slate-300">Supplier</TableHead>
                    <TableHead className="text-right text-slate-300">Stock</TableHead>
                    <TableHead className="text-right text-slate-300">Cost Price</TableHead>
                    <TableHead className="text-right text-slate-300">Selling Price</TableHead>
                    <TableHead className="text-right text-slate-300">Profit</TableHead>
                    <TableHead className="text-right text-slate-300">Margin %</TableHead>
                    <TableHead className="text-right text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id} className="border-slate-800 hover:bg-slate-800/50">
                      <TableCell className="font-medium text-white">{product.name}</TableCell>
                      <TableCell className="text-slate-300">{product.supplier || '-'}</TableCell>
                      <TableCell className="text-right text-slate-300">
                        {product.quantity_in_stock}
                      </TableCell>
                      <TableCell className="text-right text-slate-300">
                        ${product.cost_price.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-slate-300">
                        ${product.selling_price.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-green-400">
                        ${profit(product)}
                      </TableCell>
                      <TableCell className="text-right text-slate-300">
                        {profitMargin(product)}%
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleDeleteProduct(product.id)
                          }
                          disabled={deletingId === product.id}
                          className="hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
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
