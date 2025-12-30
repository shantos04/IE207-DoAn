import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { listProducts, type Product } from '../services/products'
import { createOrder } from '../services/orders'

interface CartItem extends Product {
    quantity: number
}

const formatCurrency = (value: number) => `${value.toLocaleString('vi-VN')}₫`

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

    const navigate = useNavigate()
    const location = useLocation()

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

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(p => p.category === selectedCategory)
        }

        filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])

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

    const categories = useMemo(
        () => Array.from(new Set(products.map(p => p.category).filter(Boolean))),
        [products]
    )

    useEffect(() => {
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

    useEffect(() => {
        const state = (location.state as { addProductId?: string; quantity?: number } | null) || {}
        if (state.addProductId && products.length) {
            const target = products.find(p => p._id === state.addProductId)
            if (target) {
                const quantity = Math.max(1, state.quantity || 1)
                addToCart(target, quantity)
                setShowCart(true)
                navigate(location.pathname, { replace: true, state: {} })
            }
        }
    }, [location.state, products, navigate, location.pathname])

    const addToCart = (product: Product, quantity: number = 1) => {
        if (quantity <= 0) return
        if (product.stock <= 0) {
            alert('Sản phẩm đã hết hàng!')
            return
        }

        const existing = cart.find(item => item._id === product._id)
        if (existing) {
            const newQuantity = existing.quantity + quantity
            if (newQuantity > product.stock) {
                alert(`Chỉ còn ${product.stock} sản phẩm trong kho!`)
                return
            }
            setCart(cart.map(item =>
                item._id === product._id
                    ? { ...item, quantity: newQuantity }
                    : item
            ))
        } else {
            if (quantity > product.stock) {
                alert(`Chỉ còn ${product.stock} sản phẩm trong kho!`)
                return
            }
            setCart([...cart, { ...product, quantity }])
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

    const getTotalPrice = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0)

    const handleCheckout = async () => {
        if (cart.length === 0) {
            alert('Giỏ hàng trống')
            return
        }

        const invalidItems = cart.filter(item => item.quantity > item.stock)
        if (invalidItems.length > 0) {
            alert(`Một số sản phẩm vượt quá tồn kho:\n${invalidItems.map(i => `- ${i.name}: còn ${i.stock}, bạn đặt ${i.quantity}`).join('\n')}`)
            return
        }

        const outOfStock = cart.filter(item => item.stock <= 0)
        if (outOfStock.length > 0) {
            alert(`Sản phẩm đã hết hàng:\n${outOfStock.map(i => `- ${i.name}`).join('\n')}`)
            return
        }

        const token = localStorage.getItem('token')
        if (!token) {
            alert('Vui lòng đăng nhập')
            return
        }

        setSubmitting(true)
        try {
            await createOrder({
                customer: '',
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

    const heroStats = [
        { label: 'Sản phẩm', value: products.length },
        { label: 'Giỏ hàng', value: getTotalItems() },
        { label: 'Kho hàng', value: `${products.filter(p => p.stock > 0).length} còn hàng` }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.15),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(236,72,153,0.12),transparent_25%)]" aria-hidden />

                {/* Top bar */}
                <div className="sticky top-0 z-40 backdrop-blur bg-white/90 border-b">
                    <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-6">
                        <div className="shrink-0">
                            <p className="text-xs uppercase tracking-[0.2em] text-indigo-500 font-semibold">Tech Store</p>
                            <h1 className="text-2xl font-bold text-gray-900">Cửa hàng linh kiện điện tử</h1>
                        </div>
                        <nav className="flex-1 hidden md:block">
                            <ul className="flex items-center gap-4 text-sm font-semibold text-gray-600">
                                <li><a href="#hero" className="hover:text-indigo-600">Trang chủ</a></li>
                                <li><a href="#filters" className="hover:text-indigo-600">Bộ lọc</a></li>
                                <li><a href="#products" className="hover:text-indigo-600">Danh sách</a></li>
                                <li><a href="#cart" className="hover:text-indigo-600">Giỏ hàng</a></li>
                            </ul>
                        </nav>
                        <div className="md:hidden flex-1 overflow-x-auto">
                            <ul className="flex items-center gap-3 text-sm font-semibold text-gray-600 whitespace-nowrap">
                                <li><a href="#hero" className="hover:text-indigo-600">Trang chủ</a></li>
                                <li><a href="#filters" className="hover:text-indigo-600">Bộ lọc</a></li>
                                <li><a href="#products" className="hover:text-indigo-600">Danh sách</a></li>
                                <li><a href="#cart" className="hover:text-indigo-600">Giỏ hàng</a></li>
                            </ul>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <button
                                onClick={() => setShowCart(true)}
                                className="relative btn btn-primary shadow-md"
                                id="cart"
                            >
                                <span className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Giỏ hàng
                                </span>
                                {getTotalItems() > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                                        {getTotalItems()}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Hero */}
                <div id="hero" className="max-w-7xl mx-auto px-4 pt-10 pb-8">
                    <div className="grid lg:grid-cols-[1.3fr_1fr] gap-8 items-center">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white shadow-sm text-sm text-indigo-600 border border-indigo-100">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                Hàng mới về mỗi tuần
                            </div>
                            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight">
                                Săn linh kiện xịn với <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500">giá tốt</span>
                            </h2>
                            <p className="text-lg text-gray-600 max-w-2xl">
                                Khám phá kho linh kiện điện tử đa dạng, cập nhật liên tục. Lọc nhanh theo danh mục, giá và tồn kho, giống trải nghiệm duyệt sản phẩm trên Shopee.
                            </p>

                            <div className="bg-white shadow-lg rounded-2xl p-4 border border-indigo-50">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="flex-1 relative">
                                        <input
                                            value={q}
                                            onChange={e => setQ(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && fetchProducts()}
                                            placeholder="Tìm nhanh tên, SKU, danh mục..."
                                            className="input w-full pl-10 h-12 text-base"
                                        />
                                        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <button onClick={fetchProducts} className="btn btn-primary h-12 px-6 text-base shadow-md">
                                        Tìm kiếm
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3 text-sm text-gray-500">
                                    <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700">PCB</span>
                                    <span className="px-3 py-1 rounded-full bg-pink-50 text-pink-700">Sensor</span>
                                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700">Module nguồn</span>
                                    <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700">Vi điều khiển</span>
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-3 gap-3">
                                {heroStats.map(stat => (
                                    <div key={stat.label} className="bg-white/80 backdrop-blur border border-indigo-50 rounded-2xl px-4 py-3 shadow-sm">
                                        <p className="text-xs uppercase tracking-wider text-gray-500">{stat.label}</p>
                                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-3xl blur-3xl opacity-30" aria-hidden />
                            <div className="relative bg-white border border-indigo-100 rounded-3xl shadow-2xl p-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                                        <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7l9-4 9 4-9 4-9-4z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10l9 4 9-4V7" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11v10" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">An tâm mua sắm</p>
                                        <p className="font-semibold text-gray-900">Kiểm tra tồn kho realtime</p>
                                    </div>
                                </div>
                                <div className="rounded-2xl bg-gradient-to-r from-indigo-50 to-pink-50 border border-indigo-100 p-4 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 rounded-full bg-white text-indigo-700 text-xs font-semibold border border-indigo-100">Flash sale</span>
                                        <span className="text-xs text-gray-500">Đề xuất riêng cho bạn</span>
                                    </div>
                                    <p className="text-xl font-bold text-gray-900">Ưu đãi giao hàng nội thành</p>
                                    <p className="text-sm text-gray-600">Đặt ngay hôm nay để nhận giao nhanh trong 2h.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters + list */}
                <div className="max-w-7xl mx-auto px-4 pb-12 space-y-6">
                    <div id="filters" className="bg-white/80 backdrop-blur border border-gray-100 shadow-sm rounded-2xl p-4 flex flex-wrap gap-3 items-center justify-between">
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-sm text-gray-500">Danh mục:</span>
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={`px-3 py-1 rounded-full border text-sm transition ${selectedCategory === 'all' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-200'}`}
                            >
                                Tất cả
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1 rounded-full border text-sm transition ${selectedCategory === cat ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-200'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-wrap gap-3 items-center">
                            <label className="text-sm text-gray-500">Giá tối đa</label>
                            <input
                                type="range"
                                min="0"
                                max="10000000"
                                step="100000"
                                value={priceRange[1]}
                                onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                className="w-40"
                            />
                            <span className="text-sm font-semibold text-indigo-600">{formatCurrency(priceRange[1])}</span>
                            <button
                                onClick={() => {
                                    setSelectedCategory('all')
                                    setPriceRange([0, 10000000])
                                    setQ('')
                                    fetchProducts()
                                }}
                                className="text-sm text-gray-600 hover:text-indigo-600"
                            >
                                Đặt lại
                            </button>
                        </div>
                    </div>

                    <div id="products" className="bg-white/90 backdrop-blur border border-gray-100 shadow-md rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="text-sm text-gray-600">
                            Hiển thị <span className="font-semibold text-gray-900">{filteredProducts.length}</span> sản phẩm
                        </div>
                        <div className="flex items-center gap-3">
                            <select
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value)}
                                className="input text-sm h-10"
                            >
                                <option value="name-asc">Tên A-Z</option>
                                <option value="name-desc">Tên Z-A</option>
                                <option value="price-asc">Giá thấp đến cao</option>
                                <option value="price-desc">Giá cao đến thấp</option>
                                <option value="stock-asc">Tồn kho ít nhất</option>
                                <option value="stock-desc">Tồn kho nhiều nhất</option>
                            </select>
                            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}
                                    title="Dạng lưới"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-3 py-2 ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}
                                    title="Dạng danh sách"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {loading && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {Array.from({ length: 8 }).map((_, idx) => (
                                <div key={idx} className="animate-pulse bg-white border border-gray-100 rounded-2xl shadow-sm p-4 space-y-4">
                                    <div className="h-44 bg-gray-100 rounded-xl" />
                                    <div className="h-4 bg-gray-100 rounded" />
                                    <div className="h-4 bg-gray-100 rounded w-2/3" />
                                    <div className="h-5 bg-gray-100 rounded w-1/2" />
                                    <div className="h-10 bg-gray-100 rounded" />
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && filteredProducts.length === 0 && (
                        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                            <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-lg text-gray-600">Không tìm thấy sản phẩm phù hợp.</p>
                            <button
                                onClick={() => {
                                    setSelectedCategory('all')
                                    setPriceRange([0, 10000000])
                                    setQ('')
                                    fetchProducts()
                                }}
                                className="btn btn-secondary mt-4"
                            >
                                Xóa bộ lọc
                            </button>
                        </div>
                    )}

                    {!loading && filteredProducts.length > 0 && viewMode === 'grid' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {filteredProducts.map(product => (
                                <Link
                                    key={product._id}
                                    to={`/shop/${product._id}`}
                                    className="group relative bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                                >
                                    <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-50 to-white">
                                        {product.image ? (
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition" />
                                        <div className="absolute top-3 left-3 flex gap-2">
                                            {product.category && <span className="px-2 py-1 rounded-full text-xs bg-white/90 text-gray-700 border border-gray-100">{product.category}</span>}
                                            {product.brand && <span className="px-2 py-1 rounded-full text-xs bg-indigo-600 text-white">{product.brand}</span>}
                                        </div>
                                        <div className="absolute top-3 right-3">
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

                                    <div className="p-4 space-y-3">
                                        <h3 className="text-base font-semibold text-gray-900 line-clamp-2 min-h-[3.2rem]">{product.name}</h3>
                                        <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                                        <div className="flex items-baseline justify-between gap-2">
                                            <span className="text-2xl font-bold text-indigo-600">{formatCurrency(product.price)}</span>
                                            {product.reorderPoint && (
                                                <span className="text-xs text-gray-500">Đặt lại: {product.reorderPoint}</span>
                                            )}
                                        </div>
                                        <button
                                            onClick={e => {
                                                e.preventDefault()
                                                addToCart(product)
                                                setShowCart(true)
                                            }}
                                            disabled={product.stock === 0}
                                            className="w-full btn btn-primary flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            {product.stock > 0 ? 'Thêm vào giỏ' : 'Hết hàng'}
                                        </button>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {!loading && filteredProducts.length > 0 && viewMode === 'list' && (
                        <div className="space-y-4">
                            {filteredProducts.map(product => (
                                <Link
                                    key={product._id}
                                    to={`/shop/${product._id}`}
                                    className="group bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex hover:shadow-lg hover:-translate-y-0.5 transition"
                                >
                                    <div className="w-32 sm:w-48 flex-shrink-0 bg-gradient-to-br from-gray-50 to-white">
                                        {product.image ? (
                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 p-4 flex flex-col gap-3">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-1">
                                                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
                                                <div className="flex gap-2 text-xs text-gray-500 flex-wrap">
                                                    <span>SKU: {product.sku}</span>
                                                    {product.category && <span className="px-2 py-1 rounded-full bg-gray-100">{product.category}</span>}
                                                    {product.brand && <span className="px-2 py-1 rounded-full bg-indigo-50 text-indigo-700">{product.brand}</span>}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-indigo-600">{formatCurrency(product.price)}</div>
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

                                        <div className="flex flex-wrap gap-3 items-center">
                                            <span className="text-sm text-gray-600">Giá vốn: {product.cost ? formatCurrency(product.cost) : 'N/A'}</span>
                                            {product.supplier && <span className="text-sm text-gray-500">NCC: {product.supplier}</span>}
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={e => {
                                                    e.preventDefault()
                                                    addToCart(product)
                                                    setShowCart(true)
                                                }}
                                                disabled={product.stock === 0}
                                                className="btn btn-primary text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                                            >
                                                Thêm vào giỏ
                                            </button>
                                            <span className="text-xs text-gray-500">Nhấn để xem chi tiết giống Shopee</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Cart Modal */}
            {showCart && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl">
                        <div className="bg-indigo-600 text-white px-6 py-4 flex items-center justify-between">
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

                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
                                                <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                                                <p className="text-indigo-600 font-semibold mt-1">
                                                    {formatCurrency(item.price)}
                                                </p>
                                            </div>

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

                                            <div className="text-right w-28">
                                                <div className="font-bold text-gray-900">
                                                    {formatCurrency(item.price * item.quantity)}
                                                </div>
                                            </div>

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

                                    <div className="pt-4">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Ghi chú đơn hàng
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

                        {cart.length > 0 && (
                            <div className="border-t bg-gray-50 px-6 py-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Tổng số lượng:</span>
                                    <span className="font-semibold">{getTotalItems()} sản phẩm</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold text-gray-900">Tổng tiền:</span>
                                    <span className="text-2xl font-bold text-indigo-600">
                                        {formatCurrency(getTotalPrice())}
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
                                        {submitting ? 'Đang xử lý...' : 'Đặt hàng ngay'}
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
