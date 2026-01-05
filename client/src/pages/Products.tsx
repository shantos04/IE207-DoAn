import { useEffect, useState } from 'react'
import { listProducts, createProduct, updateProduct, deleteProduct, type Product } from '../services/products'
import { listSuppliers, type Supplier } from '../services/suppliers'

interface ProductFormData {
    name: string
    sku: string
    partNumber: string
    brand: string
    manufacturer: string
    category: string
    price: number
    wholesalePrice: number
    cost: number
    stock: number
    reorderPoint: number
    minStockLevel: number
    unit: string
    binLocation: string
    supplier: string
    image?: string
    description?: string
    specifications: {
        voltage: string
        current: string
        power: string
        package: string
        datasheet: string
    }
}

export default function Products() {
    const [items, setItems] = useState<Product[]>([])
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [q, setQ] = useState('')
    const [category, setCategory] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showModal, setShowModal] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const limit = 20

    // Fixed list of all available categories
    const categories = [
        'Crystal',
        'Diode',
        'Điện trở',
        'IC',
        'LED',
        'Potentiometer',
        'Relay',
        'Transistor',
        'Tụ điện'
    ]

    const fetchData = async () => {
        setLoading(true)
        setError(null)
        try {
            const params: any = { page, limit }
            if (q) params.q = q
            if (category) params.category = category
            const res = await listProducts(params)
            setItems(res.items)
            setTotal(res.total)
        } catch (e: any) {
            setError(e?.response?.data?.message ?? e?.message ?? 'Lỗi tải dữ liệu')
        } finally {
            setLoading(false)
        }
    }

    const fetchSuppliers = async () => {
        try {
            const res = await listSuppliers()
            setSuppliers(res.items)
        } catch (e) {
            console.error('Failed to fetch suppliers:', e)
        }
    }

    useEffect(() => {
        fetchData()
        fetchSuppliers()
    }, [])

    useEffect(() => {
        fetchData()
    }, [page])

    useEffect(() => {
        // Reset to page 1 and fetch when search or category changes
        setPage(1)
    }, [q, category])

    const handleAdd = () => {
        setEditingProduct(null)
        setShowModal(true)
    }

    const handleEdit = (product: Product) => {
        setEditingProduct(product)
        setShowModal(true)
    }

    const handleDelete = async (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            try {
                await deleteProduct(id)
                fetchData()
            } catch (error) {
                console.error('Failed to delete product:', error)
                alert('Không thể xóa sản phẩm')
            }
        }
    }

    const handleSubmit = async (formData: ProductFormData) => {
        try {
            if (editingProduct) {
                await updateProduct(editingProduct._id, formData)
            } else {
                await createProduct(formData)
            }
            setShowModal(false)
            fetchData()
        } catch (error) {
            console.error('Failed to save product:', error)
            alert('Không thể lưu sản phẩm')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h2>
                    <p className="text-sm text-gray-600 mt-1">Quản lý danh mục và thông tin sản phẩm</p>
                </div>
                <button onClick={handleAdd} className="btn-primary">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Thêm sản phẩm
                </button>
            </div>
            <div className="card">
                <div className="card-header flex flex-col md:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full md:w-auto">
                        <input
                            value={q}
                            onChange={e => setQ(e.target.value)}
                            placeholder="Tìm theo tên, SKU, mã linh kiện..."
                            className="input pl-10"
                        />
                        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <select
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className="select w-full md:w-48"
                    >
                        <option value="">Tất cả danh mục</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <button onClick={fetchData} className="btn-secondary">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Tìm kiếm
                    </button>
                </div>
                {loading && (
                    <div className="p-8 text-center">
                        <div className="inline-block spinner text-primary-600"></div>
                        <p className="mt-4 text-sm text-gray-600">Đang tải dữ liệu...</p>
                    </div>
                )}
                {error && (
                    <div className="p-4 m-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    </div>
                )}
                {!loading && !error && (
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Ảnh</th>
                                    <th>SKU</th>
                                    <th>Tên</th>
                                    <th>Danh mục</th>
                                    <th>Giá lẻ</th>
                                    <th>Giá sỉ</th>
                                    <th>Tồn / Ngưỡng</th>
                                    <th>Đơn vị</th>
                                    <th>Bin</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(p => {
                                    const lowStock = p.stock <= (p.minStockLevel ?? p.reorderPoint ?? 0)
                                    return (
                                        <tr key={p._id} className="align-top">
                                            <td>
                                                {p.image ? (
                                                    <img
                                                        src={p.image}
                                                        alt={p.name}
                                                        className="w-12 h-12 object-cover rounded border"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 bg-gray-200 rounded border flex items-center justify-center">
                                                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="font-mono whitespace-nowrap font-semibold text-gray-700">{p.sku}</td>
                                            <td>
                                                <div className="font-semibold text-gray-900">{p.name}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">{p.brand || p.manufacturer || '-'}</div>
                                            </td>
                                            <td className="whitespace-nowrap">
                                                {p.category && (
                                                    <span className="badge badge-blue">{p.category}</span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap font-semibold text-primary-700">{p.price.toLocaleString('vi-VN')}₫</td>
                                            <td className="whitespace-nowrap text-gray-600">{(p.wholesalePrice ?? 0).toLocaleString('vi-VN')}₫</td>
                                            <td className="whitespace-nowrap">
                                                <span className={lowStock ? 'badge badge-red' : 'badge badge-green'}>
                                                    {p.stock} / {p.minStockLevel ?? p.reorderPoint ?? 0}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap text-gray-600">{p.unit || 'pcs'}</td>
                                            <td className="whitespace-nowrap text-gray-600">{p.binLocation || '-'}</td>
                                            <td className="space-x-2 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleEdit(p)}
                                                    className="px-3 py-1.5 text-sm font-medium text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                                                >
                                                    Sửa
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(p._id)}
                                                    className="px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    Xóa
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                        {items.length === 0 && (
                            <div className="p-12 text-center">
                                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                                <p className="text-gray-600 font-medium">Không tìm thấy sản phẩm nào</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {!loading && total > 0 && (
                    <div className="card-header border-t-0 flex items-center justify-between bg-gray-50/50">
                        <div className="text-sm text-gray-600">
                            Hiển thị {(page - 1) * limit + 1} - {Math.min(page * limit, total)} / {total} sản phẩm
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1 text-sm rounded border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Trước
                            </button>
                            <span className="text-sm text-gray-600">
                                Trang {page} / {Math.ceil(total / limit)}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(Math.ceil(total / limit), p + 1))}
                                disabled={page >= Math.ceil(total / limit)}
                                className="px-3 py-1 text-sm rounded border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <ProductFormModal
                        product={editingProduct}
                        suppliers={suppliers}
                        onClose={() => setShowModal(false)}
                        onSubmit={handleSubmit}
                    />
                </div>
            )}
        </div>
    )
}

interface ProductFormModalProps {
    product: Product | null
    suppliers: Supplier[]
    onClose: () => void
    onSubmit: (data: ProductFormData) => void
}

function ProductFormModal({ product, suppliers, onClose, onSubmit }: ProductFormModalProps) {
    const [formData, setFormData] = useState<ProductFormData>({
        name: product?.name || '',
        sku: product?.sku || '',
        partNumber: product?.partNumber || '',
        brand: product?.brand || '',
        manufacturer: product?.manufacturer || '',
        category: product?.category || '',
        price: product?.price || 0,
        wholesalePrice: product?.wholesalePrice || 0,
        cost: product?.cost || 0,
        stock: product?.stock || 0,
        reorderPoint: product?.reorderPoint || 10,
        minStockLevel: product?.minStockLevel || product?.reorderPoint || 10,
        unit: product?.unit || 'pcs',
        binLocation: product?.binLocation || '',
        supplier: product?.supplier || '',
        image: product?.image || '',
        description: product?.description || '',
        specifications: {
            voltage: product?.specifications?.voltage || '',
            current: product?.specifications?.current || '',
            power: product?.specifications?.power || '',
            package: product?.specifications?.package || '',
            datasheet: product?.specifications?.datasheet || '',
        },
    })

    const [imagePreview, setImagePreview] = useState<string>(product?.image || '')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        const numericFields = ['price', 'wholesalePrice', 'cost', 'stock', 'reorderPoint', 'minStockLevel']
        setFormData(prev => ({
            ...prev,
            [name]: numericFields.includes(name) ? Number(value) : value
        }))
    }

    const handleSpecChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            specifications: {
                ...prev.specifications,
                [name]: value
            }
        }))
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('Kích thước ảnh không được vượt quá 2MB')
                return
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Vui lòng chọn file hình ảnh')
                return
            }

            // Convert to base64
            const reader = new FileReader()
            reader.onloadend = () => {
                const base64String = reader.result as string
                setImagePreview(base64String)
                setFormData(prev => ({ ...prev, image: base64String }))
            }
            reader.readAsDataURL(file)
        }
    }

    const handleRemoveImage = () => {
        setImagePreview('')
        setFormData(prev => ({ ...prev, image: '' }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
    }

    return (
        <div className="bg-white rounded-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    {product ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
                </h2>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tên sản phẩm *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                SKU *
                            </label>
                            <input
                                type="text"
                                name="sku"
                                value={formData.sku}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Part Number
                            </label>
                            <input
                                type="text"
                                name="partNumber"
                                value={formData.partNumber}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Thương hiệu *
                            </label>
                            <input
                                type="text"
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nhà sản xuất
                            </label>
                            <input
                                type="text"
                                name="manufacturer"
                                value={formData.manufacturer}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Danh mục *
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option value="">Chọn danh mục</option>
                                <option value="Crystal">Crystal</option>
                                <option value="Diode">Diode</option>
                                <option value="Điện trở">Điện trở</option>
                                <option value="IC">IC</option>
                                <option value="LED">LED</option>
                                <option value="Potentiometer">Potentiometer</option>
                                <option value="Relay">Relay</option>
                                <option value="Transistor">Transistor</option>
                                <option value="Tụ điện">Tụ điện</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Đơn vị tính
                            </label>
                            <select
                                name="unit"
                                value={formData.unit}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option value="pcs">Cái (pcs)</option>
                                <option value="reel">Cuộn (reel)</option>
                                <option value="meter">Mét (m)</option>
                                <option value="box">Hộp</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Giá nhập (₫) *
                            </label>
                            <input
                                type="number"
                                name="cost"
                                value={formData.cost}
                                onChange={handleChange}
                                required
                                min="0"
                                step="1000"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Giá bán lẻ (₫) *
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                min="0"
                                step="1000"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Giá bán sỉ (₫)
                            </label>
                            <input
                                type="number"
                                name="wholesalePrice"
                                value={formData.wholesalePrice}
                                onChange={handleChange}
                                min="0"
                                step="1000"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tồn kho *
                            </label>
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                required
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Điểm đặt hàng lại
                            </label>
                            <input
                                type="number"
                                name="reorderPoint"
                                value={formData.reorderPoint}
                                onChange={handleChange}
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ngưỡng cảnh báo (min-stock)
                            </label>
                            <input
                                type="number"
                                name="minStockLevel"
                                value={formData.minStockLevel}
                                onChange={handleChange}
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Vị trí kho (Bin Location)
                            </label>
                            <input
                                type="text"
                                name="binLocation"
                                value={formData.binLocation}
                                onChange={handleChange}
                                placeholder="Kệ A - Tầng 2 - Hộp 5"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nhà cung cấp
                            </label>
                            <select
                                name="supplier"
                                value={formData.supplier}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option value="">Chọn nhà cung cấp</option>
                                {suppliers.map((supplier) => (
                                    <option key={supplier._id} value={supplier._id}>
                                        {supplier.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Datasheet (link)
                            </label>
                            <input
                                type="url"
                                name="datasheet"
                                value={formData.specifications.datasheet}
                                onChange={handleSpecChange}
                                placeholder="https://..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Điện áp (V)</label>
                            <input type="text" name="voltage" value={formData.specifications.voltage} onChange={handleSpecChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dòng điện (A)</label>
                            <input type="text" name="current" value={formData.specifications.current} onChange={handleSpecChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Công suất (W)</label>
                            <input type="text" name="power" value={formData.specifications.power} onChange={handleSpecChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Package (DIP/SMD...)</label>
                            <input type="text" name="package" value={formData.specifications.package} onChange={handleSpecChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mô tả sản phẩm
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Mô tả chi tiết về sản phẩm..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hình ảnh sản phẩm
                        </label>

                        {imagePreview ? (
                            <div className="space-y-2">
                                <div className="relative w-full h-48 border-2 border-gray-300 rounded-lg overflow-hidden">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-full object-contain bg-gray-50"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                        title="Xóa ảnh"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => document.getElementById('imageInput')?.click()}
                                    className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Chọn ảnh khác
                                </button>
                            </div>
                        ) : (
                            <div
                                onClick={() => document.getElementById('imageInput')?.click()}
                                className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-gray-50 transition-colors"
                            >
                                <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-sm text-gray-600">Click để chọn ảnh</p>
                                <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF (tối đa 2MB)</p>
                            </div>
                        )}

                        <input
                            id="imageInput"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                    </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-outline"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        className="btn-primary"
                    >
                        {product ? 'Cập nhật' : 'Thêm mới'}
                    </button>
                </div>
            </form>
        </div>
    )
}
