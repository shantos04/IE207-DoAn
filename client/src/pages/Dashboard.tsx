export default function Dashboard() {
    return (
        <div className="space-y-6">
            <h2 className="text-lg font-semibold">Tổng quan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Tồn kho" value="12,350" />
                <StatCard label="Đơn hàng hôm nay" value="34" />
                <StatCard label="Doanh thu (tháng)" value="₫ 1,254,000,000" />
                <StatCard label="Sản phẩm sắp hết" value="18" />
            </div>
            <div className="bg-white rounded-lg border p-4">Biểu đồ placeholder</div>
        </div>
    )
}

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-white rounded-lg border p-4">
            <div className="text-sm text-gray-500">{label}</div>
            <div className="mt-1 text-2xl font-semibold">{value}</div>
        </div>
    )
}
