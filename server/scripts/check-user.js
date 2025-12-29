const mongoose = require('mongoose');
const User = require('../models/User');
const Customer = require('../models/Customer');

const checkUser = async (email) => {
    try {
        await mongoose.connect('mongodb://localhost:27017/erp-system');
        console.log('✅ Connected to MongoDB\n');

        const user = await User.findOne({ email });
        if (user) {
            console.log('📋 Tìm thấy User:');
            console.log(`   - ID: ${user._id}`);
            console.log(`   - Name: ${user.name}`);
            console.log(`   - Email: ${user.email}`);
            console.log(`   - Role: ${user.role}`);
            console.log(`   - Created: ${user.createdAt}`);
        } else {
            console.log('❌ Không tìm thấy User với email:', email);
        }

        const customer = await Customer.findOne({ email });
        if (customer) {
            console.log('\n📦 Tìm thấy Customer:');
            console.log(`   - ID: ${customer._id}`);
            console.log(`   - Name: ${customer.name}`);
            console.log(`   - CustomerType: ${customer.customerType}`);
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        await mongoose.connection.close();
        process.exit(1);
    }
};

const email = process.argv[2] || 'luongtuanvy04@gmail.com';
checkUser(email);
