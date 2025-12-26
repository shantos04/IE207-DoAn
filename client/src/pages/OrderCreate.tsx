import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listCustomers, type Customer } from '../services/customers'
import { listProducts, type Product } from '../services/products'
import { createOrder } from '../services/orders'

interface OrderItem {
    product: string
    quantity: number
    price: number
}

export default function OrderCreate() {
    const navigate = useNavigate()
    const [customers, setCustomers] = useState<Customer[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)

    const [customerId, setCustomerId] = useState('')
    const [note, setNote] = useState('')
    const [items, setItems] = useState<OrderItem[]>([
        { product: '', quantity: 1, price: 0 }
    ])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [customerRes, productRes] = await Promise.all([
                    listCustomers(),
                    listProducts()
                ])
                setCustomers(customerRes.items)
                setProducts(productRes.items)
            } catch (error) {
                console.error('Failed to fetch data:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleProductChange = (index: number, productId: string) => {
        const product = products.find(p => p._id === productId)
        const newItems = [...items]
        newItems[index] = {
            ...newItems[index],
            product: productId,
            price: product?.price || 0
        }
        setItems(newItems)
    }

    const handleQuantityChange = (index: number, quantity: number) => {
        const newItems = [...items]
        newItems[index].quantity = quantity
        setItems(newItems)
    }

    const handlePriceChange = (index: number, price: number) => {
        const newItems = [...items]
        newItems[index].price = price
        setItems(newItems)
    }

    const addItem = () => {
        setItems([...items, { product: '', quantity: 1, price: 0 }])
    }

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index))
        }
    }

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!customerId) {
            alert('Vui lòng chọn khách hàng')
            return
        }

        if (items.some(item => !item.product)) {
            alert('Vui lòng chọn sản phẩm cho tất cả các dòng')
            return
        }

        // Validate stock for all items
        const invalidItems = items.filter(item => {
            const product = products.find(p => p._id === item.product)
            return !product || product.stock <= 0 || product.stock < item.quantity
        })

        if (invalidItems.length > 0) {
            const messages = invalidItems.map(item => {
                const product = products.find(p => p._id === item.product)
                if (!product || product.stock <= 0) {
                    return `${product?.name || 'Sản phẩm'} đã hết hàng`
                }
                return `${product.name}: Chỉ còn ${product.stock} sản phẩm, không đủ cho số lượng ${item.quantity}`
            })
            alert(`Không thể tạo đơn hàng:\n${messages.join('\n')}`)
            return
        }

        try {
            await createOrder({
                customer: customerId,
                items: items.map(item => ({
                    product: item.product,
                    qty: item.quantity,
                    price: item.price
                })),
                note
            })
            alert('Tạo đơn hàng thành công!')
            navigate('/orders')
        } catch (error: any) {
            console.error('Failed to create order:', error)
            alert(error?.response?.data?.message || 'Không thể tạo đơn hàng')
        }
    }

    if (loading) {
        return <div className="text-center py-8">Đang tải...</div>
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Tạo đơn hàng mới</h2>
                <button
                    onClick={() => navigate('/orders')}
                    className="px-3 py-2 text-sm rounded border border-gray-300 hover:bg-gray-50"
                >
                    ← Quay lại
                </button>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Khách hàng *
                        </label>
                        <select
                            value={customerId}
                            onChange={(e) => setCustomerId(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="">Chọn khách hàng</option>
                            {customers.map((customer) => (
                                <option key={customer._id} value={customer._id}>
                                    {customer.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ghi chú
                        </label>
                        <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Ghi chú đơn hàng..."
                        />
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-gray-700">Chi tiết đơn hàng</h3>
                        <button
                            type="button"
                            onClick={addItem}
                            className="px-3 py-1 text-sm rounded bg-primary-600 text-white hover:bg-primary-700"
                        >
                            + Thêm dòng
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="p-2 text-left">Sản phẩm</th>
                                    <th className="p-2 text-left w-32">Số lượng</th>
                                    <th className="p-2 text-left w-40">Đơn giá (₫)</th>
                                    <th className="p-2 text-left w-40">Thành tiền (₫)</th>
                                    <th className="p-2 text-center w-20">Xóa</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => {
                                    const selectedProduct = products.find(p => p._id === item.product)
                                    return (
                                        <tr key={`item-${item.product}-${index}`} className="border-b">
                                            <td className="p-2">
                                                <select
                                                    value={item.product}
                                                    onChange={(e) => handleProductChange(index, e.target.value)}
                                                    required
                                                    className="w-full px-2 py-1 border border-gray-300 rounded"
                                                >
                                                    <option value="">Chọn sản phẩm</option>
                                                    {products.map((product) => (
                                                        <option key={product._id} value={product._id}>
                                                            {product.name} - {product.sku} (Tồn: {product.stock})
                                                        </option>
                                                    ))}
                                                </select>
                                                {selectedProduct && selectedProduct.stock < item.quantity && (
                                                    <p className="text-xs text-red-600 mt-1">
                                                        Tồn kho không đủ (còn {selectedProduct.stock})
                                                    </p>
                                                )}
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => handleQuantityChange(index, Number(e.target.value))}
                                                    required
                                                    min="1"
                                                    className="w-full px-2 py-1 border border-gray-300 rounded"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    type="number"
                                                    value={item.price}
                                                    onChange={(e) => handlePriceChange(index, Number(e.target.value))}
                                                    required
                                                    min="0"
                                                    step="1000"
                                                    className="w-full px-2 py-1 border border-gray-300 rounded"
                                                />
                                            </td>
                                            <td className="p-2 text-gray-900 font-medium">
                                                {(item.quantity * item.price).toLocaleString('vi-VN')}
                                            </td>
                                            <td className="p-2 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    disabled={items.length === 1}
                                                    className="text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                                                >
                                                    ✕
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                            <tfoot className="bg-gray-50">
                                <tr>
                                    <td colSpan={3} className="p-3 text-right font-semibold">
                                        Tổng cộng:
                                    </td>
                                    <td colSpan={2} className="p-3 text-lg font-bold text-primary-600">
                                        {calculateTotal().toLocaleString('vi-VN')}₫
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <button
                        type="button"
                        onClick={() => navigate('/orders')}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                        Tạo đơn hàng
                    </button>
                </div>
            </form>
        </div>
    )
}
