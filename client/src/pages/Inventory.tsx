export default function Inventory() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Kho</h2>
                <div className="space-x-2">
                    <button className="px-3 py-2 text-sm rounded bg-gray-100">Nhập kho</button>
                    <button className="px-3 py-2 text-sm rounded bg-gray-100">Xuất kho</button>
                </div>
            </div>
            <div className="bg-white rounded-lg border p-4 text-sm text-gray-500">Phiếu nhập/xuất gần đây (placeholder)</div>
        </div>
    )
}
