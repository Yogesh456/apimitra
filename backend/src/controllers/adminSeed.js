const User = require('../models/User');
const Service = require('../models/Service');

const defaultServices = [
  {
    name: 'Find PAN by Aadhaar',
    slug: 'pan-by-aadhaar',
    description: 'Get PAN number linked to an Aadhaar number',
    apiUrl: 'https://api.finpayultra.com/api/aadhartopanfind',
    apiKey: process.env.FINPAY_API_KEY || '',
    method: 'GET',
    paramMap: { aadharNo: 'Aadhaarid' },
    costPerQuery: 2,
  },
  {
    name: 'PAN Details',
    slug: 'pan-details',
    description: 'Get full details by PAN number',
    apiUrl: 'https://api.finpayultra.com/api/pan_ details',
    apiKey: process.env.FINPAY_API_KEY || '',
    method: 'GET',
    paramMap: { panNo: 'Panid' },
    costPerQuery: 2,
  },
  {
    name: 'Vehicle Details',
    slug: 'vehicle-details',
    description: 'Get vehicle details by registration number',
    apiUrl: 'https://api.finpayultra.com/api/rc-details',
    apiKey: process.env.FINPAY_API_KEY || '',
    method: 'GET',
    paramMap: { regNo: 'vehicleNumber' },
    costPerQuery: 3,
  },
];

async function seedAdmin() {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        shopName: 'ApiMitra Admin',
        mobile: '9999999999',
        email: process.env.ADMIN_EMAIL || 'admin@apimitra.com',
        aadharNo: '000000000000',
        panNo: 'ADMIN0000A',
        password: process.env.ADMIN_PASSWORD || 'Admin@123',
        role: 'admin',
        status: 'approved',
      });
      console.log('Admin user created:', process.env.ADMIN_EMAIL);
    }

    for (const svc of defaultServices) {
      const exists = await Service.findOne({ slug: svc.slug });
      if (!exists) {
        await Service.create(svc);
        console.log('Seeded service:', svc.name);
      }
    }
  } catch (err) {
    console.error('Seed error:', err.message);
  }
}

module.exports = { seedAdmin };
