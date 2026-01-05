import React from 'react';
import { FaSearch, FaUser, FaShoppingCart } from 'react-icons/fa';

const Header = () => {
    return (
        <header className="bg-gray-900 text-white fixed w-full z-10">
            <div className="container mx-auto flex justify-between items-center p-4">
                <h1 className="text-2xl font-bold">ElectroMart</h1>
                <div className="flex-grow mx-4">
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <FaSearch className="absolute right-4 top-2 text-gray-500" />
                </div>
                <div className="flex items-center space-x-4">
                    <a href="#" className="hover:text-blue-500">Tài liệu kỹ thuật</a>
                    <FaUser className="text-xl cursor-pointer" />
                    <FaShoppingCart className="text-xl cursor-pointer" />
                </div>
            </div>
        </header>
    );
};

const HeroSection = () => {
    return (
        <section className="bg-gray-800 text-white h-64 flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-4xl font-bold">Raspberry Pi 5 - Hàng mới về</h2>
                <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg">Xem chi tiết</button>
            </div>
        </section>
    );
};

const Categories = () => {
    const categories = [
        { name: 'Vi điều khiển', icon: '' },
        { name: 'Cảm biến', icon: '' },
        { name: 'Màn hình OLED', icon: '' },
        { name: 'Module Nguồn', icon: '' },
        { name: 'Dây kết nối', icon: '' }
    ];

    return (
        <div className="flex justify-center space-x-4 my-4">
            {categories.map((category) => (
                <div key={category.name} className="bg-gray-700 text-white rounded-full p-2 flex items-center space-x-2">
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                </div>
            ))}
        </div>
    );
};

const FeaturedProducts = () => {
    const products = Array(8).fill({
        name: 'Module ESP32-WROOM-32U',
        specs: 'Dual-core, Wifi+BT, External Antenna',
        price: '250.000₫',
    });

    return (
        <div className="container mx-auto my-8">
            <h2 className="text-2xl font-bold mb-4">Linh kiện bán chạy</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {products.map((product, index) => (
                    <div key={index} className="bg-gray-800 p-4 rounded-lg">
                        <img src="https://via.placeholder.com/150" alt={product.name} className="w-full h-32 object-cover rounded" />
                        <h3 className="font-semibold mt-2">{product.name}</h3>
                        <p className="text-sm text-gray-400">{product.specs}</p>
                        <p className="text-lg font-bold text-blue-500 mt-1">{product.price}</p>
                        <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg">Thêm vào giỏ hàng</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white py-4">
            <div className="container mx-auto flex justify-around">
                <div>
                    <h3 className="font-bold">Về chúng tôi</h3>
                    <ul>
                        <li><a href="#" className="hover:text-blue-500">Giới thiệu</a></li>
                        <li><a href="#" className="hover:text-blue-500">Liên hệ</a></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-bold">Hỗ trợ kỹ thuật</h3>
                    <ul>
                        <li><a href="#" className="hover:text-blue-500">Câu hỏi thường gặp</a></li>
                        <li><a href="#" className="hover:text-blue-500">Hướng dẫn sử dụng</a></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-bold">Đăng ký nhận báo giá</h3>
                    <form>
                        <input type="email" placeholder="Email của bạn" className="p-2 rounded-lg bg-gray-800 border border-gray-700" />
                        <button type="submit" className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg">Đăng ký</button>
                    </form>
                </div>
            </div>
        </footer>
    );
};

const HomePage = () => {
    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <Header />
            <HeroSection />
            <Categories />
            <FeaturedProducts />
            <Footer />
        </div>
    );
};

export default HomePage;