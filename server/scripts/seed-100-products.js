require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })
const { connectDB } = require('../config/db')
const Product = require('../models/Product')

async function run() {
    await connectDB(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/erp_parts')
    console.log('Seeding 100 products...')

    const products = [
        // Điện trở (20 sản phẩm)
        { name: 'Điện trở 1kΩ 1/4W', sku: 'RES-1K-025W', partNumber: 'CF14-1K', brand: 'Yageo', category: 'Điện trở', price: 50, cost: 30, stock: 2000, reorderPoint: 500 },
        { name: 'Điện trở 10kΩ 1/4W', sku: 'RES-10K-025W', partNumber: 'CF14-10K', brand: 'Yageo', category: 'Điện trở', price: 50, cost: 30, stock: 2000, reorderPoint: 500 },
        { name: 'Điện trở 100kΩ 1/4W', sku: 'RES-100K-025W', partNumber: 'CF14-100K', brand: 'Yageo', category: 'Điện trở', price: 50, cost: 30, stock: 1500, reorderPoint: 400 },
        { name: 'Điện trở 1MΩ 1/4W', sku: 'RES-1M-025W', partNumber: 'CF14-1M', brand: 'Yageo', category: 'Điện trở', price: 60, cost: 35, stock: 1000, reorderPoint: 300 },
        { name: 'Điện trở 220Ω 1/2W', sku: 'RES-220-05W', partNumber: 'CF12-220', brand: 'Yageo', category: 'Điện trở', price: 80, cost: 50, stock: 1200, reorderPoint: 350 },
        { name: 'Điện trở 470Ω 1/4W', sku: 'RES-470-025W', partNumber: 'CF14-470', brand: 'Vishay', category: 'Điện trở', price: 55, cost: 32, stock: 1800, reorderPoint: 450 },
        { name: 'Điện trở 4.7kΩ 1/4W', sku: 'RES-4K7-025W', partNumber: 'CF14-4K7', brand: 'Vishay', category: 'Điện trở', price: 55, cost: 32, stock: 1600, reorderPoint: 400 },
        { name: 'Điện trở 47kΩ 1/4W', sku: 'RES-47K-025W', partNumber: 'CF14-47K', brand: 'KOA', category: 'Điện trở', price: 60, cost: 35, stock: 1400, reorderPoint: 380 },
        { name: 'Điện trở 2.2kΩ 1W', sku: 'RES-2K2-1W', partNumber: 'MR25-2K2', brand: 'KOA', category: 'Điện trở', price: 120, cost: 75, stock: 800, reorderPoint: 250 },
        { name: 'Điện trở 330Ω 1/4W', sku: 'RES-330-025W', partNumber: 'CF14-330', brand: 'Yageo', category: 'Điện trở', price: 50, cost: 30, stock: 1700, reorderPoint: 420 },
        { name: 'Điện trở 5.6kΩ 1/4W', sku: 'RES-5K6-025W', partNumber: 'CF14-5K6', brand: 'Panasonic', category: 'Điện trở', price: 65, cost: 38, stock: 1300, reorderPoint: 360 },
        { name: 'Điện trở 68kΩ 1/4W', sku: 'RES-68K-025W', partNumber: 'CF14-68K', brand: 'Panasonic', category: 'Điện trở', price: 65, cost: 38, stock: 1200, reorderPoint: 340 },
        { name: 'Điện trở 150Ω 1/4W', sku: 'RES-150-025W', partNumber: 'CF14-150', brand: 'Bourns', category: 'Điện trở', price: 70, cost: 42, stock: 1100, reorderPoint: 320 },
        { name: 'Điện trở 820Ω 1/4W', sku: 'RES-820-025W', partNumber: 'CF14-820', brand: 'Bourns', category: 'Điện trở', price: 70, cost: 42, stock: 1000, reorderPoint: 300 },
        { name: 'Điện trở 22kΩ 1/4W', sku: 'RES-22K-025W', partNumber: 'CF14-22K', brand: 'Yageo', category: 'Điện trở', price: 55, cost: 32, stock: 1500, reorderPoint: 390 },
        { name: 'Điện trở 33kΩ 1/4W', sku: 'RES-33K-025W', partNumber: 'CF14-33K', brand: 'Vishay', category: 'Điện trở', price: 60, cost: 35, stock: 1400, reorderPoint: 370 },
        { name: 'Điện trở 680Ω 1/4W', sku: 'RES-680-025W', partNumber: 'CF14-680', brand: 'KOA', category: 'Điện trở', price: 55, cost: 33, stock: 1250, reorderPoint: 350 },
        { name: 'Điện trở 15kΩ 1/4W', sku: 'RES-15K-025W', partNumber: 'CF14-15K', brand: 'Panasonic', category: 'Điện trở', price: 60, cost: 36, stock: 1350, reorderPoint: 360 },
        { name: 'Điện trở 56kΩ 1/4W', sku: 'RES-56K-025W', partNumber: 'CF14-56K', brand: 'Bourns', category: 'Điện trở', price: 65, cost: 39, stock: 1200, reorderPoint: 330 },
        { name: 'Điện trở 270Ω 1/4W', sku: 'RES-270-025W', partNumber: 'CF14-270', brand: 'Yageo', category: 'Điện trở', price: 55, cost: 32, stock: 1450, reorderPoint: 380 },

        // Tụ điện (20 sản phẩm)
        { name: 'Tụ gốm 10nF 50V', sku: 'CAP-10NF-50V', partNumber: 'C0G-10N-50', brand: 'Murata', category: 'Tụ điện', price: 150, cost: 90, stock: 800, reorderPoint: 200 },
        { name: 'Tụ gốm 100nF 50V', sku: 'CAP-100NF-50V', partNumber: 'C0G-100N-50', brand: 'Murata', category: 'Tụ điện', price: 200, cost: 120, stock: 700, reorderPoint: 180 },
        { name: 'Tụ gốm 1µF 50V', sku: 'CAP-1UF-50V', partNumber: 'X7R-1U-50', brand: 'Murata', category: 'Tụ điện', price: 350, cost: 210, stock: 600, reorderPoint: 150 },
        { name: 'Tụ gốm 10µF 25V', sku: 'CAP-10UF-25V', partNumber: 'X7R-10U-25', brand: 'Samsung', category: 'Tụ điện', price: 500, cost: 300, stock: 500, reorderPoint: 130 },
        { name: 'Tụ hóa 100µF 25V', sku: 'CAP-100UF-25V-E', partNumber: 'ECA-100U-25', brand: 'Panasonic', category: 'Tụ điện', price: 800, cost: 480, stock: 400, reorderPoint: 100 },
        { name: 'Tụ hóa 1000µF 16V', sku: 'CAP-1000UF-16V-E', partNumber: 'ECA-1000U-16', brand: 'Nichicon', category: 'Tụ điện', price: 1200, cost: 720, stock: 300, reorderPoint: 80 },
        { name: 'Tụ gốm 22nF 50V', sku: 'CAP-22NF-50V', partNumber: 'C0G-22N-50', brand: 'TDK', category: 'Tụ điện', price: 180, cost: 108, stock: 750, reorderPoint: 190 },
        { name: 'Tụ gốm 220nF 50V', sku: 'CAP-220NF-50V', partNumber: 'X7R-220N-50', brand: 'TDK', category: 'Tụ điện', price: 250, cost: 150, stock: 650, reorderPoint: 170 },
        { name: 'Tụ gốm 2.2µF 50V', sku: 'CAP-2U2F-50V', partNumber: 'X7R-2U2-50', brand: 'Kemet', category: 'Tụ điện', price: 400, cost: 240, stock: 550, reorderPoint: 140 },
        { name: 'Tụ hóa 470µF 25V', sku: 'CAP-470UF-25V-E', partNumber: 'ECA-470U-25', brand: 'Rubycon', category: 'Tụ điện', price: 1000, cost: 600, stock: 350, reorderPoint: 90 },
        { name: 'Tụ gốm 47nF 50V', sku: 'CAP-47NF-50V', partNumber: 'C0G-47N-50', brand: 'Murata', category: 'Tụ điện', price: 190, cost: 114, stock: 700, reorderPoint: 180 },
        { name: 'Tụ gốm 4.7µF 25V', sku: 'CAP-4U7F-25V', partNumber: 'X7R-4U7-25', brand: 'Samsung', category: 'Tụ điện', price: 450, cost: 270, stock: 520, reorderPoint: 135 },
        { name: 'Tụ hóa 220µF 35V', sku: 'CAP-220UF-35V-E', partNumber: 'ECA-220U-35', brand: 'Panasonic', category: 'Tụ điện', price: 900, cost: 540, stock: 380, reorderPoint: 95 },
        { name: 'Tụ tantalum 10µF 16V', sku: 'CAP-10UF-16V-T', partNumber: 'TAJ-10U-16', brand: 'AVX', category: 'Tụ điện', price: 1500, cost: 900, stock: 250, reorderPoint: 70 },
        { name: 'Tụ tantalum 47µF 10V', sku: 'CAP-47UF-10V-T', partNumber: 'TAJ-47U-10', brand: 'Kemet', category: 'Tụ điện', price: 2000, cost: 1200, stock: 200, reorderPoint: 60 },
        { name: 'Tụ gốm 33nF 50V', sku: 'CAP-33NF-50V', partNumber: 'C0G-33N-50', brand: 'TDK', category: 'Tụ điện', price: 185, cost: 111, stock: 720, reorderPoint: 185 },
        { name: 'Tụ gốm 330nF 50V', sku: 'CAP-330NF-50V', partNumber: 'X7R-330N-50', brand: 'Murata', category: 'Tụ điện', price: 280, cost: 168, stock: 630, reorderPoint: 165 },
        { name: 'Tụ hóa 47µF 50V', sku: 'CAP-47UF-50V-E', partNumber: 'ECA-47U-50', brand: 'Nichicon', category: 'Tụ điện', price: 850, cost: 510, stock: 400, reorderPoint: 100 },
        { name: 'Tụ hóa 2200µF 16V', sku: 'CAP-2200UF-16V-E', partNumber: 'ECA-2200U-16', brand: 'Rubycon', category: 'Tụ điện', price: 1400, cost: 840, stock: 280, reorderPoint: 75 },
        { name: 'Tụ gốm 15nF 50V', sku: 'CAP-15NF-50V', partNumber: 'C0G-15N-50', brand: 'Samsung', category: 'Tụ điện', price: 160, cost: 96, stock: 770, reorderPoint: 195 },

        // IC (20 sản phẩm)
        { name: 'IC 555 Timer', sku: 'IC-NE555', partNumber: 'NE555P', brand: 'TI', category: 'IC', price: 5000, cost: 3000, stock: 150, reorderPoint: 40 },
        { name: 'IC LM358 Op-Amp', sku: 'IC-LM358', partNumber: 'LM358N', brand: 'TI', category: 'IC', price: 8000, cost: 4800, stock: 120, reorderPoint: 35 },
        { name: 'IC 7805 Regulator 5V', sku: 'IC-7805', partNumber: 'LM7805CT', brand: 'ST', category: 'IC', price: 6000, cost: 3600, stock: 200, reorderPoint: 50 },
        { name: 'IC 7812 Regulator 12V', sku: 'IC-7812', partNumber: 'LM7812CT', brand: 'ST', category: 'IC', price: 6500, cost: 3900, stock: 180, reorderPoint: 45 },
        { name: 'IC ATmega328P', sku: 'IC-ATMEGA328P', partNumber: 'ATMEGA328P-PU', brand: 'Microchip', category: 'IC', price: 45000, cost: 27000, stock: 80, reorderPoint: 25 },
        { name: 'IC 74HC595 Shift Register', sku: 'IC-74HC595', partNumber: '74HC595N', brand: 'NXP', category: 'IC', price: 7000, cost: 4200, stock: 100, reorderPoint: 30 },
        { name: 'IC LM393 Comparator', sku: 'IC-LM393', partNumber: 'LM393N', brand: 'TI', category: 'IC', price: 6500, cost: 3900, stock: 110, reorderPoint: 32 },
        { name: 'IC L293D Motor Driver', sku: 'IC-L293D', partNumber: 'L293D', brand: 'ST', category: 'IC', price: 25000, cost: 15000, stock: 90, reorderPoint: 28 },
        { name: 'IC ULN2003A Darlington', sku: 'IC-ULN2003A', partNumber: 'ULN2003AN', brand: 'TI', category: 'IC', price: 9000, cost: 5400, stock: 95, reorderPoint: 28 },
        { name: 'IC AMS1117-3.3 Regulator', sku: 'IC-AMS1117-3V3', partNumber: 'AMS1117-3.3', brand: 'AMS', category: 'IC', price: 5500, cost: 3300, stock: 140, reorderPoint: 38 },
        { name: 'IC CD4017 Counter', sku: 'IC-CD4017', partNumber: 'CD4017BE', brand: 'TI', category: 'IC', price: 7500, cost: 4500, stock: 105, reorderPoint: 30 },
        { name: 'IC LM324 Op-Amp Quad', sku: 'IC-LM324', partNumber: 'LM324N', brand: 'TI', category: 'IC', price: 9500, cost: 5700, stock: 115, reorderPoint: 33 },
        { name: 'IC ESP8266-12E WiFi', sku: 'IC-ESP8266-12E', partNumber: 'ESP-12E', brand: 'Espressif', category: 'IC', price: 35000, cost: 21000, stock: 70, reorderPoint: 22 },
        { name: 'IC CH340G USB-Serial', sku: 'IC-CH340G', partNumber: 'CH340G', brand: 'WCH', category: 'IC', price: 12000, cost: 7200, stock: 85, reorderPoint: 26 },
        { name: 'IC 74HC04 Inverter', sku: 'IC-74HC04', partNumber: '74HC04N', brand: 'NXP', category: 'IC', price: 6000, cost: 3600, stock: 125, reorderPoint: 35 },
        { name: 'IC LM317 Adj Regulator', sku: 'IC-LM317', partNumber: 'LM317T', brand: 'ST', category: 'IC', price: 8500, cost: 5100, stock: 100, reorderPoint: 30 },
        { name: 'IC TL431 Shunt Regulator', sku: 'IC-TL431', partNumber: 'TL431CP', brand: 'TI', category: 'IC', price: 4500, cost: 2700, stock: 135, reorderPoint: 37 },
        { name: 'IC 74HC138 Decoder', sku: 'IC-74HC138', partNumber: '74HC138N', brand: 'NXP', category: 'IC', price: 7200, cost: 4320, stock: 108, reorderPoint: 31 },
        { name: 'IC LM386 Audio Amp', sku: 'IC-LM386', partNumber: 'LM386N-1', brand: 'TI', category: 'IC', price: 10000, cost: 6000, stock: 92, reorderPoint: 28 },
        { name: 'IC NE5532 Op-Amp', sku: 'IC-NE5532', partNumber: 'NE5532P', brand: 'TI', category: 'IC', price: 11000, cost: 6600, stock: 88, reorderPoint: 27 },

        // LED (15 sản phẩm)
        { name: 'LED 5mm Đỏ', sku: 'LED-5MM-RED', partNumber: 'LED-RED-5', brand: 'Generic', category: 'LED', price: 500, cost: 300, stock: 3000, reorderPoint: 800 },
        { name: 'LED 5mm Xanh lá', sku: 'LED-5MM-GREEN', partNumber: 'LED-GRN-5', brand: 'Generic', category: 'LED', price: 500, cost: 300, stock: 2800, reorderPoint: 750 },
        { name: 'LED 5mm Xanh dương', sku: 'LED-5MM-BLUE', partNumber: 'LED-BLU-5', brand: 'Generic', category: 'LED', price: 600, cost: 360, stock: 2500, reorderPoint: 700 },
        { name: 'LED 5mm Vàng', sku: 'LED-5MM-YELLOW', partNumber: 'LED-YEL-5', brand: 'Generic', category: 'LED', price: 500, cost: 300, stock: 2700, reorderPoint: 730 },
        { name: 'LED 5mm Trắng', sku: 'LED-5MM-WHITE', partNumber: 'LED-WHT-5', brand: 'Generic', category: 'LED', price: 700, cost: 420, stock: 2200, reorderPoint: 650 },
        { name: 'LED 3mm Đỏ', sku: 'LED-3MM-RED', partNumber: 'LED-RED-3', brand: 'Generic', category: 'LED', price: 400, cost: 240, stock: 2500, reorderPoint: 680 },
        { name: 'LED 3mm Xanh lá', sku: 'LED-3MM-GREEN', partNumber: 'LED-GRN-3', brand: 'Generic', category: 'LED', price: 400, cost: 240, stock: 2400, reorderPoint: 660 },
        { name: 'LED RGB 5mm', sku: 'LED-5MM-RGB', partNumber: 'LED-RGB-5-CC', brand: 'Generic', category: 'LED', price: 2000, cost: 1200, stock: 800, reorderPoint: 220 },
        { name: 'LED 10mm Siêu sáng Trắng', sku: 'LED-10MM-WHITE', partNumber: 'LED-WHT-10-HS', brand: 'Cree', category: 'LED', price: 3000, cost: 1800, stock: 500, reorderPoint: 150 },
        { name: 'LED SMD 0805 Đỏ', sku: 'LED-0805-RED', partNumber: 'LED-SMD-RED-0805', brand: 'Everlight', category: 'LED', price: 300, cost: 180, stock: 5000, reorderPoint: 1200 },
        { name: 'LED SMD 0805 Xanh lá', sku: 'LED-0805-GREEN', partNumber: 'LED-SMD-GRN-0805', brand: 'Everlight', category: 'LED', price: 300, cost: 180, stock: 4800, reorderPoint: 1150 },
        { name: 'LED 5mm UV', sku: 'LED-5MM-UV', partNumber: 'LED-UV-5-395', brand: 'Generic', category: 'LED', price: 1500, cost: 900, stock: 600, reorderPoint: 180 },
        { name: 'LED 5mm Hồng ngoại', sku: 'LED-5MM-IR', partNumber: 'LED-IR-5-940', brand: 'Vishay', category: 'LED', price: 1200, cost: 720, stock: 700, reorderPoint: 200 },
        { name: 'LED 7 đoạn 0.56" CA', sku: 'LED-7SEG-056-CA', partNumber: '7SEG-CA-056-RED', brand: 'Generic', category: 'LED', price: 5000, cost: 3000, stock: 300, reorderPoint: 90 },
        { name: 'LED 7 đoạn 0.36" CC', sku: 'LED-7SEG-036-CC', partNumber: '7SEG-CC-036-RED', brand: 'Generic', category: 'LED', price: 3500, cost: 2100, stock: 350, reorderPoint: 100 },

        // Transistor (15 sản phẩm)
        { name: 'Transistor 2N2222 NPN', sku: 'TRS-2N2222', partNumber: '2N2222A', brand: 'Fairchild', category: 'Transistor', price: 1000, cost: 600, stock: 500, reorderPoint: 140 },
        { name: 'Transistor BC547 NPN', sku: 'TRS-BC547', partNumber: 'BC547B', brand: 'Fairchild', category: 'Transistor', price: 800, cost: 480, stock: 600, reorderPoint: 160 },
        { name: 'Transistor BC557 PNP', sku: 'TRS-BC557', partNumber: 'BC557B', brand: 'Fairchild', category: 'Transistor', price: 800, cost: 480, stock: 580, reorderPoint: 155 },
        { name: 'Transistor 2N3904 NPN', sku: 'TRS-2N3904', partNumber: '2N3904', brand: 'ON Semi', category: 'Transistor', price: 900, cost: 540, stock: 520, reorderPoint: 145 },
        { name: 'Transistor 2N3906 PNP', sku: 'TRS-2N3906', partNumber: '2N3906', brand: 'ON Semi', category: 'Transistor', price: 900, cost: 540, stock: 510, reorderPoint: 142 },
        { name: 'MOSFET IRF540N N-Channel', sku: 'FET-IRF540N', partNumber: 'IRF540N', brand: 'Infineon', category: 'Transistor', price: 8000, cost: 4800, stock: 200, reorderPoint: 60 },
        { name: 'MOSFET IRF9540N P-Channel', sku: 'FET-IRF9540N', partNumber: 'IRF9540N', brand: 'Infineon', category: 'Transistor', price: 9000, cost: 5400, stock: 180, reorderPoint: 55 },
        { name: 'Transistor BD139 NPN', sku: 'TRS-BD139', partNumber: 'BD139-16', brand: 'ST', category: 'Transistor', price: 2500, cost: 1500, stock: 350, reorderPoint: 95 },
        { name: 'Transistor BD140 PNP', sku: 'TRS-BD140', partNumber: 'BD140-16', brand: 'ST', category: 'Transistor', price: 2500, cost: 1500, stock: 340, reorderPoint: 93 },
        { name: 'Transistor TIP41C NPN', sku: 'TRS-TIP41C', partNumber: 'TIP41C', brand: 'ST', category: 'Transistor', price: 4000, cost: 2400, stock: 280, reorderPoint: 80 },
        { name: 'Transistor TIP42C PNP', sku: 'TRS-TIP42C', partNumber: 'TIP42C', brand: 'ST', category: 'Transistor', price: 4000, cost: 2400, stock: 270, reorderPoint: 78 },
        { name: 'MOSFET 2N7000 N-Channel', sku: 'FET-2N7000', partNumber: '2N7000', brand: 'ON Semi', category: 'Transistor', price: 1500, cost: 900, stock: 400, reorderPoint: 110 },
        { name: 'Transistor BC337 NPN', sku: 'TRS-BC337', partNumber: 'BC337-40', brand: 'Fairchild', category: 'Transistor', price: 850, cost: 510, stock: 550, reorderPoint: 150 },
        { name: 'Transistor BC327 PNP', sku: 'TRS-BC327', partNumber: 'BC327-40', brand: 'Fairchild', category: 'Transistor', price: 850, cost: 510, stock: 540, reorderPoint: 148 },
        { name: 'MOSFET BS170 N-Channel', sku: 'FET-BS170', partNumber: 'BS170', brand: 'Fairchild', category: 'Transistor', price: 1800, cost: 1080, stock: 380, reorderPoint: 105 },

        // Linh kiện khác (10 sản phẩm)
        { name: 'Diode 1N4007', sku: 'DIO-1N4007', partNumber: '1N4007', brand: 'Vishay', category: 'Diode', price: 500, cost: 300, stock: 2000, reorderPoint: 550 },
        { name: 'Diode 1N4148', sku: 'DIO-1N4148', partNumber: '1N4148', brand: 'Vishay', category: 'Diode', price: 400, cost: 240, stock: 2200, reorderPoint: 600 },
        { name: 'Zener 5.1V 1W', sku: 'ZEN-5V1-1W', partNumber: 'BZX55C5V1', brand: 'NXP', category: 'Diode', price: 800, cost: 480, stock: 800, reorderPoint: 220 },
        { name: 'Cầu diode 2A', sku: 'BRIDGE-2A', partNumber: 'KBL206', brand: 'Generic', category: 'Diode', price: 3000, cost: 1800, stock: 300, reorderPoint: 85 },
        { name: 'Crystal 16MHz', sku: 'XTAL-16MHZ', partNumber: 'HC-49S-16', brand: 'Generic', category: 'Crystal', price: 2000, cost: 1200, stock: 400, reorderPoint: 110 },
        { name: 'Crystal 8MHz', sku: 'XTAL-8MHZ', partNumber: 'HC-49S-8', brand: 'Generic', category: 'Crystal', price: 2000, cost: 1200, stock: 380, reorderPoint: 105 },
        { name: 'Relay 5V 10A', sku: 'RELAY-5V-10A', partNumber: 'SRD-05VDC-SL-C', brand: 'Songle', category: 'Relay', price: 8000, cost: 4800, stock: 250, reorderPoint: 70 },
        { name: 'Relay 12V 10A', sku: 'RELAY-12V-10A', partNumber: 'SRD-12VDC-SL-C', brand: 'Songle', category: 'Relay', price: 8500, cost: 5100, stock: 240, reorderPoint: 68 },
        { name: 'Potentiometer 10kΩ', sku: 'POT-10K', partNumber: 'WH148-B10K', brand: 'Alpha', category: 'Potentiometer', price: 3000, cost: 1800, stock: 350, reorderPoint: 95 },
        { name: 'Trimpot 100kΩ', sku: 'TRIM-100K', partNumber: '3296W-100K', brand: 'Bourns', category: 'Potentiometer', price: 4000, cost: 2400, stock: 300, reorderPoint: 85 },
    ]

    for (const p of products) {
        await Product.updateOne({ sku: p.sku }, { $setOnInsert: p }, { upsert: true })
    }

    console.log(`✅ Successfully seeded ${products.length} products`)
    process.exit(0)
}

run().catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
})
