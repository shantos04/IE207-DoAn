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
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Sản phẩm</h2>
                <button onClick={handleAdd} className="px-3 py-2 text-sm rounded bg-primary-600 text-white hover:bg-primary-700">
                    + Thêm sản phẩm
                </button>
            </div>
            <div className="bg-white rounded-lg border">
                <div className="p-3 border-b flex flex-col md:flex-row items-center gap-2">
                    <input
                        value={q}
                        onChange={e => setQ(e.target.value)}
                        placeholder="Tìm theo tên, SKU, mã linh kiện"
                        className="w-full md:flex-1 rounded border-gray-300 px-3 py-2"
                    />
                    <select
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className="w-full md:w-48 rounded border border-gray-300 px-3 py-2"
                    >
                        <option value="">Tất cả danh mục</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <button onClick={fetchData} className="px-3 py-2 text-sm rounded bg-gray-100 hover:bg-gray-200 w-full md:w-auto">Tìm</button>
                </div>
                {loading && <div className="p-4 text-sm text-gray-500">Đang tải...</div>}
                {error && <div className="p-4 text-sm text-red-600">{error}</div>}
                {!loading && !error && (
                    <div className="p-2 overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-left border-b">
                                    <th className="p-2">Ảnh</th>
                                    <th className="p-2">SKU</th>
                                    <th className="p-2">Tên</th>
                                    <th className="p-2">Danh mục</th>
                                    <th className="p-2">Giá lẻ</th>
                                    <th className="p-2">Giá sỉ</th>
                                    <th className="p-2">Tồn / Ngưỡng</th>
                                    <th className="p-2">Đơn vị</th>
                                    <th className="p-2">Bin</th>
                                    <th className="p-2">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(p => {
                                    const lowStock = p.stock <= (p.minStockLevel ?? p.reorderPoint ?? 0)
                                    return (
                                        <tr key={p._id} className="border-b hover:bg-gray-50 align-top">
                                            <td className="p-2">
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
                                            <td className="p-2 font-mono whitespace-nowrap">{p.sku}</td>
                                            <td className="p-2">
                                                <div className="font-medium text-gray-900">{p.name}</div>
                                                <div className="text-xs text-gray-500">{p.brand || p.manufacturer || '-'}</div>
                                            </td>
                                            <td className="p-2 whitespace-nowrap">{p.category ?? '-'}</td>
                                            <td className="p-2 whitespace-nowrap">{p.price.toLocaleString('vi-VN')}₫</td>
                                            <td className="p-2 whitespace-nowrap">{(p.wholesalePrice ?? 0).toLocaleString('vi-VN')}₫</td>
                                            <td className="p-2 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${lowStock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                    {p.stock} / {p.minStockLevel ?? p.reorderPoint ?? 0}
                                                </span>
                                            </td>
                                            <td className="p-2 whitespace-nowrap">{p.unit || 'pcs'}</td>
                                            <td className="p-2 whitespace-nowrap">{p.binLocation || '-'}</td>
                                            <td className="p-2 space-x-2 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleEdit(p)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Sửa
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(p._id)}
                                                    className="text-red-600 hover:text-red-900"
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
                            <div className="p-4 text-center text-sm text-gray-500">Không tìm thấy sản phẩm nào</div>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {!loading && total > 0 && (
                    <div className="p-3 border-t flex items-center justify-between">
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
                <ProductFormModal
                    product={editingProduct}
                    suppliers={suppliers}
                    onClose={() => setShowModal(false)}
                    onSubmit={handleSubmit}
                />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">
                    {product ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
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

                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                        >
                            {product ? 'Cập nhật' : 'Thêm mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
