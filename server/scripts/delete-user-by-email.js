const mongoose = require('mongoose');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Order = require('../models/Order');

const deleteUserByEmail = async (email) => {
    try {
        await mongoose.connect('mongodb://localhost:27017/erp-system');
        console.log('✅ Connected to MongoDB');

        // Tìm user
        const user = await User.findOne({ email });
        if (!user) {
            console.log(`❌ Không tìm thấy user với email: ${email}`);
            process.exit(0);
        }

        console.log(`\n📋 Thông tin user:`);
        console.log(`   - Name: ${user.name}`);
        console.log(`   - Email: ${user.email}`);
        console.log(`   - Role: ${user.role}`);

        // Kiểm tra customer record
        const customer = await Customer.findOne({ email });
        if (customer) {
            console.log(`\n📦 Tìm thấy Customer record`);

            // Kiểm tra orders
            const orderCount = await Order.countDocuments({ customer: customer._id });
            if (orderCount > 0) {
                console.log(`   ⚠️ Customer có ${orderCount} đơn hàng. Bạn có muốn xóa hết không?`);
                console.log(`   💡 Để giữ lại đơn hàng, chỉ xóa User và Customer record`);
            }
        }

        // Xác nhận xóa
        console.log(`\n🗑️ Xóa user và customer record...`);

        // Xóa Customer record
        if (customer) {
            await Customer.deleteOne({ email });
            console.log(`✅ Đã xóa Customer record`);
        }

        // Xóa User
        await User.deleteOne({ email });
        console.log(`✅ Đã xóa User`);

        console.log(`\n✨ Hoàn tất! Bạn có thể đăng nhập lại với email này.`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        await mongoose.connection.close();
        process.exit(1);
    }
};

// Lấy email từ command line
const email = process.argv[2];

if (!email) {
    console.log('❌ Vui lòng cung cấp email:');
    console.log('   node delete-user-by-email.js <email>');
    console.log('\nVí dụ:');
    console.log('   node delete-user-by-email.js admin@example.com');
    process.exit(1);
}

deleteUserByEmail(email);
