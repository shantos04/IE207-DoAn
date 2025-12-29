const mongoose = require('mongoose');
const User = require('../models/User');

const updateUserRole = async (email, newRole = 'customer') => {
    try {
        await mongoose.connect('mongodb://localhost:27017/erp-system');
        console.log('✅ Connected to MongoDB\n');

        const user = await User.findOne({ email });
        if (!user) {
            console.log('❌ Không tìm thấy user với email:', email);
            await mongoose.connection.close();
            process.exit(0);
        }

        console.log('📋 User hiện tại:');
        console.log(`   - Name: ${user.name}`);
        console.log(`   - Email: ${user.email}`);
        console.log(`   - Role: ${user.role}`);

        user.role = newRole;
        await user.save();

        console.log(`\n✅ Đã cập nhật role thành: ${newRole}`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        await mongoose.connection.close();
        process.exit(1);
    }
};

const email = process.argv[2];
const role = process.argv[3] || 'customer';

if (!email) {
    console.log('Sử dụng: node update-user-role.js <email> [role]');
    console.log('Ví dụ: node update-user-role.js admin@example.com customer');
    process.exit(1);
}

updateUserRole(email, role);
