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
      const response = await fetch('/api/products')
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setProducts(Array.isArray(data) ? data : [])
      setError(null)
    } catch (error) {
      console.error('[v0] Failed to fetch products:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch products')
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
        <p className="text-gray-600">Loading products...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-2">Manage your inventory products</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add Product</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Enter the product details below
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Widget A"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  placeholder="e.g., ABC Supplies"
                  value={formData.supplier}
                  onChange={(e) =>
                    setFormData({ ...formData, supplier: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity in Stock</Label>
                <Input
                  id="quantity"
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
                <Label htmlFor="cost">Cost Price</Label>
                <Input
                  id="cost"
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
                <Label htmlFor="selling">Selling Price</Label>
                <Input
                  id="selling"
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
              <Button type="submit" disabled={isAddingProduct} className="w-full">
                {isAddingProduct ? 'Adding...' : 'Add Product'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {products.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No products yet. Add your first product to get started.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Cost Price</TableHead>
                    <TableHead className="text-right">Selling Price</TableHead>
                    <TableHead className="text-right">Profit</TableHead>
                    <TableHead className="text-right">Margin %</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.supplier || '-'}</TableCell>
                      <TableCell className="text-right">
                        {product.quantity_in_stock}
                      </TableCell>
                      <TableCell className="text-right">
                        ${product.cost_price.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        ${product.selling_price.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        ${profit(product)}
                      </TableCell>
                      <TableCell className="text-right">
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
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
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
