import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getProduct, type Product } from '../services/products'

export default function ProductDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string>('')
    const [quantity, setQuantity] = useState(1)

    useEffect(() => {
        const fetchDetail = async () => {
            if (!id) return
            setLoading(true)
            try {
                const data = await getProduct(id)
                setProduct(data)
                setError('')
            } catch (e: any) {
                const message = e?.response?.data?.message || 'Không tìm thấy sản phẩm'
                setError(message)
            } finally {
                setLoading(false)
            }
        }
        fetchDetail()
    }, [id])

    const handleAddToCart = () => {
        if (!product) return
        navigate('/shop', { state: { addProductId: product._id, quantity } })
    }

    const handleBuyNow = () => {
        handleAddToCart()
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-4xl w-full animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-1/3" />
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="h-80 bg-gray-200 rounded-xl" />
                        <div className="space-y-3">
                            <div className="h-8 bg-gray-200 rounded w-3/4" />
                            <div className="h-6 bg-gray-200 rounded w-1/2" />
                            <div className="h-6 bg-gray-200 rounded w-2/3" />
                            <div className="h-10 bg-gray-200 rounded w-full" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="bg-white shadow-md rounded-xl p-8 text-center space-y-4 max-w-md w-full">
                    <p className="text-xl font-semibold text-gray-900">{error || 'Không tìm thấy sản phẩm'}</p>
                    <p className="text-gray-600">Hãy quay lại cửa hàng để xem các sản phẩm khác.</p>
                    <Link to="/shop" className="btn btn-primary">Về cửa hàng</Link>
                </div>
            </div>
        )
    }

    const priceDisplay = `${product.price.toLocaleString('vi-VN')}₫`
    const stockLabel = product.stock > 0 ? (product.stock <= 10 ? `Chỉ còn ${product.stock}` : 'Còn hàng') : 'Hết hàng'

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50 to-pink-50">
            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Link to="/shop" className="hover:text-indigo-600">Cửa hàng</Link>
                    <span>/</span>
                    <span className="text-gray-700 line-clamp-1">{product.name}</span>
                </div>

                <div className="bg-white/90 backdrop-blur border border-gray-100 rounded-3xl shadow-xl overflow-hidden">
                    <div className="grid md:grid-cols-[1.1fr_1.2fr] gap-8 p-6 lg:p-10">
                        <div className="space-y-4">
                            <div className="relative bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden aspect-square flex items-center justify-center">
                                {product.image ? (
                                    <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                                ) : (
                                    <div className="text-gray-300">
                                        <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                                <div className="absolute top-4 left-4 flex gap-2">
                                    {product.category && <span className="px-3 py-1 rounded-full bg-white/90 border text-xs text-gray-700">{product.category}</span>}
                                    {product.brand && <span className="px-3 py-1 rounded-full bg-indigo-600 text-white text-xs">{product.brand}</span>}
                                </div>
                                <div className="absolute bottom-4 right-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${product.stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                                        {stockLabel}
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                                <div className="p-3 rounded-xl bg-gray-50 border">
                                    <p className="text-xs text-gray-500">SKU</p>
                                    <p className="font-semibold text-gray-900">{product.sku}</p>
                                </div>
                                {product.partNumber && (
                                    <div className="p-3 rounded-xl bg-gray-50 border">
                                        <p className="text-xs text-gray-500">Part number</p>
                                        <p className="font-semibold text-gray-900">{product.partNumber}</p>
                                    </div>
                                )}
                                {product.supplier && (
                                    <div className="p-3 rounded-xl bg-gray-50 border col-span-2">
                                        <p className="text-xs text-gray-500">Nhà cung cấp</p>
                                        <p className="font-semibold text-gray-900">{product.supplier}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <p className="text-sm text-indigo-600 font-semibold">Sản phẩm | Chi tiết Shopee style</p>
                                <h1 className="text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>
                                <p className="text-sm text-gray-500">Hãy xem thông tin chi tiết trước khi thêm vào giỏ như trên Shopee.</p>
                            </div>

                            <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-pink-500 text-white p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-sm opacity-90">Giá bán</p>
                                    <p className="text-3xl font-bold">{priceDisplay}</p>
                                </div>
                                {product.cost && (
                                    <div className="text-right">
                                        <p className="text-xs opacity-90">Giá vốn tham khảo</p>
                                        <p className="text-lg font-semibold">{product.cost.toLocaleString('vi-VN')}₫</p>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="p-4 rounded-xl bg-gray-50 border">
                                    <p className="text-xs text-gray-500">Tồn kho</p>
                                    <p className="text-lg font-semibold text-gray-900">{product.stock}</p>
                                </div>
                                {product.reorderPoint !== undefined && (
                                    <div className="p-4 rounded-xl bg-gray-50 border">
                                        <p className="text-xs text-gray-500">Điểm đặt lại</p>
                                        <p className="text-lg font-semibold text-gray-900">{product.reorderPoint}</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2 text-sm text-gray-700">
                                <p className="font-semibold text-gray-900">Mô tả sản phẩm</p>
                                <p className="leading-relaxed bg-gray-50 border rounded-xl p-4 whitespace-pre-wrap">
                                    {product.description || 'Chưa có mô tả cho sản phẩm này.'}
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3 border rounded-xl px-3 py-2 bg-gray-50">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
                                        aria-label="Giảm"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                        </svg>
                                    </button>
                                    <span className="w-10 text-center font-semibold">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
                                        aria-label="Tăng"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </button>
                                </div>
                                <span className="text-sm text-gray-500">Chọn số lượng trước khi thêm giỏ.</span>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={product.stock === 0}
                                    className="btn btn-outline text-indigo-600 border-indigo-200 hover:border-indigo-400"
                                >
                                    Thêm vào giỏ (mở cửa hàng)
                                </button>
                                <button
                                    onClick={handleBuyNow}
                                    disabled={product.stock === 0}
                                    className="btn btn-primary"
                                >
                                    Mua ngay
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
