import { useEffect, useState } from 'react'
import { listProducts, type Product } from '../services/products'
import { createOrder } from '../services/orders'
import { Navigate } from 'react-router-dom'

interface CartItem extends Product {
    quantity: number
}

export default function Shop() {
    const [products, setProducts] = useState<Product[]>([])
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
    const [cart, setCart] = useState<CartItem[]>([])
    const [loading, setLoading] = useState(true)
    const [q, setQ] = useState('')
    const [showCart, setShowCart] = useState(false)
    const [orderNote, setOrderNote] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [userRole, setUserRole] = useState<string>('customer')

    // Filter & Sort states
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000])
    const [sortBy, setSortBy] = useState<string>('name-asc')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    const fetchProducts = async () => {
        setLoading(true)
        try {
            const res = await listProducts(q ? { q } : undefined)
            setProducts(res.items)
            setFilteredProducts(res.items)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    // Áp dụng filter và sort
    useEffect(() => {
        let filtered = [...products]

        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(p => p.category === selectedCategory)
        }

        // Filter by price range
        filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])

        // Sort
        switch (sortBy) {
            case 'name-asc':
                filtered.sort((a, b) => a.name.localeCompare(b.name))
                break
            case 'name-desc':
                filtered.sort((a, b) => b.name.localeCompare(a.name))
                break
            case 'price-asc':
                filtered.sort((a, b) => a.price - b.price)
                break
            case 'price-desc':
                filtered.sort((a, b) => b.price - a.price)
                break
            case 'stock-asc':
                filtered.sort((a, b) => a.stock - b.stock)
                break
            case 'stock-desc':
                filtered.sort((a, b) => b.stock - a.stock)
                break
        }

        setFilteredProducts(filtered)
    }, [products, selectedCategory, priceRange, sortBy])

    // Lấy danh sách categories từ products
    const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)))

    useEffect(() => {
        // Decode JWT token to get user role
        const token = localStorage.getItem('token')
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]))
                setUserRole(payload.role || 'customer')
            } catch (e) {
                console.error('Failed to decode token', e)
            }
        }
        fetchProducts()
    }, [])

    const addToCart = (product: Product) => {
        // Kiểm tra tồn kho
        if (product.stock <= 0) {
            alert('Sản phẩm đã hết hàng!')
            return
        }

        const existing = cart.find(item => item._id === product._id)
        if (existing) {
            // Kiểm tra không vượt quá tồn kho
            if (existing.quantity >= product.stock) {
                alert(`Chỉ còn ${product.stock} sản phẩm trong kho!`)
                return
            }
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
            const item = cart.find(i => i._id === productId)
            if (item && quantity > item.stock) {
                alert(`Chỉ còn ${item.stock} sản phẩm trong kho!`)
                return
            }
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

        // Validate tồn kho trước khi đặt hàng
        const invalidItems = cart.filter(item => item.quantity > item.stock)
        if (invalidItems.length > 0) {
            alert(`Một số sản phẩm vượt quá tồn kho:\n${invalidItems.map(i => `- ${i.name}: còn ${i.stock}, bạn đặt ${i.quantity}`).join('\n')}`)
            return
        }

        // Kiểm tra sản phẩm hết hàng
        const outOfStock = cart.filter(item => item.stock <= 0)
        if (outOfStock.length > 0) {
            alert(`Sản phẩm đã hết hàng:\n${outOfStock.map(i => `- ${i.name}`).join('\n')}`)
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
        <div className="min-h-screen bg-gray-50">
            {/* Header with cart button - Sticky */}
            <div className="bg-white shadow-sm sticky top-0 z-40 border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <h1 className="text-2xl font-bold text-gray-900">🛍️ Cửa hàng linh kiện điện tử</h1>
                        <button
                            onClick={() => setShowCart(true)}
                            className="btn btn-primary relative flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Giỏ hàng
                            {getTotalItems() > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                                    {getTotalItems()}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar Filters */}
                    <aside className="lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24 space-y-6">
                            {/* Search */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    🔍 Tìm kiếm
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        value={q}
                                        onChange={e => setQ(e.target.value)}
                                        onKeyPress={e => e.key === 'Enter' && fetchProducts()}
                                        placeholder="Nhập tên sản phẩm..."
                                        className="input flex-1"
                                    />
                                    <button onClick={fetchProducts} className="btn btn-secondary px-3">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Categories */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    📂 Danh mục
                                </label>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setSelectedCategory('all')}
                                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedCategory === 'all'
                                                ? 'bg-primary-100 text-primary-700 font-semibold'
                                                : 'hover:bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        Tất cả ({products.length})
                                    </button>
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedCategory === cat
                                                    ? 'bg-primary-100 text-primary-700 font-semibold'
                                                    : 'hover:bg-gray-100 text-gray-700'
                                                }`}
                                        >
                                            {cat} ({products.filter(p => p.category === cat).length})
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    💰 Khoảng giá
                                </label>
                                <div className="space-y-3">
                                    <div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="10000000"
                                            step="100000"
                                            value={priceRange[1]}
                                            onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                            className="w-full"
                                        />
                                        <div className="flex justify-between text-xs text-gray-600 mt-1">
                                            <span>{priceRange[0].toLocaleString('vi-VN')}₫</span>
                                            <span>{priceRange[1].toLocaleString('vi-VN')}₫</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setPriceRange([0, 10000000])}
                                        className="text-xs text-primary-600 hover:text-primary-700"
                                    >
                                        Đặt lại
                                    </button>
                                </div>
                            </div>

                            {/* Clear Filters */}
                            <button
                                onClick={() => {
                                    setSelectedCategory('all')
                                    setPriceRange([0, 10000000])
                                    setQ('')
                                    fetchProducts()
                                }}
                                className="w-full btn btn-outline text-sm"
                            >
                                🔄 Xóa bộ lọc
                            </button>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">
                        {/* Toolbar */}
                        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="text-sm text-gray-600">
                                    Hiển thị <span className="font-semibold">{filteredProducts.length}</span> sản phẩm
                                </div>
                                <div className="flex items-center gap-4">
                                    {/* Sort */}
                                    <select
                                        value={sortBy}
                                        onChange={e => setSortBy(e.target.value)}
                                        className="input text-sm"
                                    >
                                        <option value="name-asc">Tên A-Z</option>
                                        <option value="name-desc">Tên Z-A</option>
                                        <option value="price-asc">Giá thấp đến cao</option>
                                        <option value="price-desc">Giá cao đến thấp</option>
                                        <option value="stock-asc">Tồn kho ít nhất</option>
                                        <option value="stock-desc">Tồn kho nhiều nhất</option>
                                    </select>

                                    {/* View Mode */}
                                    <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`p-2 ${viewMode === 'grid' ? 'bg-primary-100 text-primary-700' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                            title="Lưới"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`p-2 ${viewMode === 'list' ? 'bg-primary-100 text-primary-700' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                            title="Danh sách"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {loading && <div className="text-center py-12 text-gray-500">⏳ Đang tải sản phẩm...</div>}
                        {!loading && (
                            <>
                                {/* Grid View */}
                                {viewMode === 'grid' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {filteredProducts.map(product => (
                                            <div key={product._id} className="group bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200">
                                                {/* Image */}
                                                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                                                    {product.image ? (
                                                        <img
                                                            src={product.image}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                    {/* Stock Badge */}
                                                    <div className="absolute top-3 right-3">
                                                        {product.stock > 0 ? (
                                                            product.stock <= 10 ? (
                                                                <span className="badge badge-yellow shadow-md">
                                                                    Chỉ còn {product.stock}
                                                                </span>
                                                            ) : (
                                                                <span className="badge badge-green shadow-md">
                                                                    Còn hàng
                                                                </span>
                                                            )
                                                        ) : (
                                                            <span className="badge badge-red shadow-md">
                                                                Hết hàng
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="p-4 space-y-3">
                                                    {/* Category & Brand */}
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        {product.category && (
                                                            <span className="px-2 py-1 bg-gray-100 rounded">{product.category}</span>
                                                        )}
                                                        {product.brand && (
                                                            <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded">{product.brand}</span>
                                                        )}
                                                    </div>

                                                    {/* Name */}
                                                    <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[3rem]" title={product.name}>
                                                        {product.name}
                                                    </h3>

                                                    {/* SKU */}
                                                    <p className="text-xs text-gray-400">SKU: {product.sku}</p>

                                                    {/* Price */}
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-2xl font-bold text-primary-600">
                                                            {product.price.toLocaleString('vi-VN')}₫
                                                        </span>
                                                    </div>

                                                    {/* Add to Cart Button */}
                                                    <button
                                                        onClick={() => addToCart(product)}
                                                        disabled={product.stock === 0}
                                                        className="w-full btn btn-primary disabled:bg-gray-300 disabled:cursor-not-allowed group-hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                                        </svg>
                                                        {product.stock > 0 ? 'Thêm vào giỏ' : 'Hết hàng'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* List View */}
                                {viewMode === 'list' && (
                                    <div className="space-y-4">
                                        {filteredProducts.map(product => (
                                            <div key={product._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200 flex">
                                                {/* Image */}
                                                <div className="w-32 sm:w-48 flex-shrink-0 bg-gray-100">
                                                    {product.image ? (
                                                        <img
                                                            src={product.image}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 p-4 flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div className="flex-1">
                                                                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                                                                    {product.name}
                                                                </h3>
                                                                <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                                                                    <span>SKU: {product.sku}</span>
                                                                    {product.category && <span className="px-2 py-1 bg-gray-100 rounded">{product.category}</span>}
                                                                    {product.brand && <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded">{product.brand}</span>}
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-2xl font-bold text-primary-600 mb-2">
                                                                    {product.price.toLocaleString('vi-VN')}₫
                                                                </div>
                                                                {product.stock > 0 ? (
                                                                    product.stock <= 10 ? (
                                                                        <span className="badge badge-yellow">Chỉ còn {product.stock}</span>
                                                                    ) : (
                                                                        <span className="badge badge-green">Còn hàng</span>
                                                                    )
                                                                ) : (
                                                                    <span className="badge badge-red">Hết hàng</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="mt-4">
                                                        <button
                                                            onClick={() => addToCart(product)}
                                                            disabled={product.stock === 0}
                                                            className="btn btn-primary disabled:bg-gray-300 disabled:cursor-not-allowed inline-flex items-center gap-2"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                                            </svg>
                                                            {product.stock > 0 ? 'Thêm vào giỏ' : 'Hết hàng'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {filteredProducts.length === 0 && (
                                    <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                                        <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào</p>
                                        <button
                                            onClick={() => {
                                                setSelectedCategory('all')
                                                setPriceRange([0, 10000000])
                                                setQ('')
                                                fetchProducts()
                                            }}
                                            className="mt-4 btn btn-secondary"
                                        >
                                            Xóa bộ lọc
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </main>
                </div>
            </div>

            {/* Cart Modal */}
            {showCart && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl">
                        {/* Header */}
                        <div className="bg-primary-600 text-white px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <h3 className="text-xl font-bold">Giỏ hàng của bạn</h3>
                            </div>
                            <button
                                onClick={() => setShowCart(false)}
                                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
                            {cart.length === 0 ? (
                                <div className="text-center py-16 px-4">
                                    <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <p className="text-gray-500 text-lg mb-4">Giỏ hàng trống</p>
                                    <button onClick={() => setShowCart(false)} className="btn btn-primary">
                                        Tiếp tục mua sắm
                                    </button>
                                </div>
                            ) : (
                                <div className="p-6 space-y-4">
                                    {cart.map(item => (
                                        <div key={item._id} className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow bg-gray-50">
                                            {/* Image */}
                                            <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-white border">
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
                                                <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                                                <p className="text-primary-600 font-semibold mt-1">
                                                    {item.price.toLocaleString('vi-VN')}₫
                                                </p>
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-2 bg-white rounded-lg border px-2 py-1">
                                                <button
                                                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                                    </svg>
                                                </button>
                                                <span className="w-12 text-center font-semibold">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                    disabled={item.quantity >= item.stock}
                                                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                </button>
                                            </div>

                                            {/* Subtotal */}
                                            <div className="text-right w-28">
                                                <div className="font-bold text-gray-900">
                                                    {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                                                </div>
                                            </div>

                                            {/* Remove */}
                                            <button
                                                onClick={() => updateQuantity(item._id, 0)}
                                                className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded transition-colors"
                                                title="Xóa"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}

                                    {/* Order Note */}
                                    <div className="pt-4">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            📝 Ghi chú đơn hàng
                                        </label>
                                        <textarea
                                            value={orderNote}
                                            onChange={e => setOrderNote(e.target.value)}
                                            placeholder="Ghi chú cho người bán (tùy chọn)"
                                            className="textarea w-full"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {cart.length > 0 && (
                            <div className="border-t bg-gray-50 px-6 py-4 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Tổng số lượng:</span>
                                    <span className="font-semibold">{getTotalItems()} sản phẩm</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xl font-bold text-gray-900">Tổng tiền:</span>
                                    <span className="text-3xl font-bold text-primary-600">
                                        {getTotalPrice().toLocaleString('vi-VN')}₫
                                    </span>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowCart(false)}
                                        className="btn btn-outline flex-1"
                                    >
                                        Tiếp tục mua
                                    </button>
                                    <button
                                        onClick={handleCheckout}
                                        disabled={submitting}
                                        className="btn btn-primary flex-1 text-lg"
                                    >
                                        {submitting ? '⏳ Đang xử lý...' : '✓ Đặt hàng ngay'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
