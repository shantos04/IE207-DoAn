import { useEffect, useState } from 'react'
import { listProducts, type Product } from '../services/products'
import { createOrder } from '../services/orders'

interface CartItem extends Product {
    quantity: number
}

export default function Shop() {
    const [products, setProducts] = useState<Product[]>([])
    const [cart, setCart] = useState<CartItem[]>([])
    const [loading, setLoading] = useState(true)
    const [q, setQ] = useState('')
    const [showCart, setShowCart] = useState(false)
    const [orderNote, setOrderNote] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const fetchProducts = async () => {
        setLoading(true)
        try {
            const res = await listProducts(q ? { q } : undefined)
            setProducts(res.items)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchProducts() }, [])

    const addToCart = (product: Product) => {
        const existing = cart.find(item => item._id === product._id)
        if (existing) {
            setCart(cart.map(item =>
                item._id === product._id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ))
        } else {
            setCart([...cart, { ...product, quantity: 1 }])
        }
    }

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            setCart(cart.filter(item => item._id !== productId))
        } else {
            setCart(cart.map(item =>
                item._id === productId ? { ...item, quantity } : item
            ))
        }
    }

    const getTotalPrice = () => {
        return cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    }

    const getTotalItems = () => {
        return cart.reduce((sum, item) => sum + item.quantity, 0)
    }

    const handleCheckout = async () => {
        if (cart.length === 0) {
            alert('Giỏ hàng trống')
            return
        }

        // Lấy thông tin user từ token
        const token = localStorage.getItem('token')
        if (!token) {
            alert('Vui lòng đăng nhập')
            return
        }

        setSubmitting(true)
        try {
            // Tạo đơn hàng với customer = user's email
            // Backend sẽ cần tìm customer tương ứng
            await createOrder({
                customer: '', // Backend sẽ tự động gán từ token
                items: cart.map(item => ({
                    product: item._id,
                    qty: item.quantity,
                    price: item.price
                })),
                note: orderNote
            })
            alert('Đặt hàng thành công!')
            setCart([])
            setShowCart(false)
            setOrderNote('')
        } catch (error: any) {
            console.error('Failed to create order:', error)
            alert(error?.response?.data?.message || 'Không thể đặt hàng')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Cửa hàng linh kiện điện tử</h2>
                <button
                    onClick={() => setShowCart(true)}
                    className="btn btn-primary relative"
                >
                    🛒 Giỏ hàng
                    {getTotalItems() > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                            {getTotalItems()}
                        </span>
                    )}
                </button>
            </div>

            <div className="card">
                <div className="card-header">
                    <input
                        value={q}
                        onChange={e => setQ(e.target.value)}
                        placeholder="Tìm sản phẩm..."
                        title="Tìm kiếm sản phẩm"
                        className="input w-full md:w-96"
                    />
                    <button onClick={fetchProducts} className="btn btn-secondary">Tìm</button>
                </div>

                {loading && <div className="p-4 text-sm text-gray-500">Đang tải...</div>}
                {!loading && (
                    <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {products.map(product => (
                                <div key={product._id} className="card hover:shadow-md transition-shadow">
                                    <div className="p-4 space-y-3">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{product.name}</h3>
                                            <p className="text-xs text-gray-500 mt-1">SKU: {product.sku}</p>
                                            {product.brand && (
                                                <p className="text-xs text-gray-500">Hãng: {product.brand}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-bold text-primary-600">
                                                {product.price.toLocaleString('vi-VN')}₫
                                            </span>
                                            {product.stock > 0 ? (
                                                <span className="badge badge-green">Còn {product.stock}</span>
                                            ) : (
                                                <span className="badge badge-red">Hết hàng</span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => addToCart(product)}
                                            disabled={product.stock === 0}
                                            className="btn btn-primary w-full"
                                        >
                                            Thêm vào giỏ
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {products.length === 0 && (
                            <div className="text-center py-8 text-gray-500">Không tìm thấy sản phẩm nào</div>
                        )}
                    </div>
                )}
            </div>

            {showCart && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="card-header">
                            <h3 className="text-lg font-semibold">Giỏ hàng của bạn</h3>
                            <button onClick={() => setShowCart(false)} className="text-gray-500 hover:text-gray-700">
                                ✕
                            </button>
                        </div>
                        <div className="card-body space-y-4">
                            {cart.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">Giỏ hàng trống</p>
                            ) : (
                                <>
                                    <div className="space-y-3">
                                        {cart.map(item => (
                                            <div key={item._id} className="flex items-center gap-4 p-3 border rounded">
                                                <div className="flex-1">
                                                    <h4 className="font-medium">{item.name}</h4>
                                                    <p className="text-sm text-gray-500">{item.price.toLocaleString('vi-VN')}₫</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                                        className="btn btn-outline px-2 py-1 text-sm"
                                                    >
                                                        −
                                                    </button>
                                                    <span className="w-12 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                        disabled={item.quantity >= item.stock}
                                                        className="btn btn-outline px-2 py-1 text-sm"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <div className="font-semibold w-24 text-right">
                                                    {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                                                </div>
                                                <button
                                                    onClick={() => updateQuantity(item._id, 0)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div>
                                        <label className="block text-sm mb-1">Ghi chú đơn hàng</label>
                                        <textarea
                                            value={orderNote}
                                            onChange={e => setOrderNote(e.target.value)}
                                            placeholder="Ghi chú (tùy chọn)"
                                            title="Ghi chú đơn hàng"
                                            className="textarea"
                                            rows={2}
                                        />
                                    </div>

                                    <div className="border-t pt-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-lg font-semibold">Tổng cộng:</span>
                                            <span className="text-2xl font-bold text-primary-600">
                                                {getTotalPrice().toLocaleString('vi-VN')}₫
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setShowCart(false)}
                                                className="btn btn-outline flex-1"
                                            >
                                                Tiếp tục mua
                                            </button>
                                            <button
                                                onClick={handleCheckout}
                                                disabled={submitting}
                                                className="btn btn-primary flex-1"
                                            >
                                                {submitting ? 'Đang xử lý...' : 'Đặt hàng'}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
