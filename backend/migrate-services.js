require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('./src/models/Service');

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected');

  const updates = [
    {
      slug: 'pan-by-aadhaar',
      apiUrl: 'https://api.finpayultra.com/api/aadhartopanfind',
      apiKey: process.env.FINPAY_API_KEY || '',
      method: 'GET',
      paramMap: { aadharNo: 'Aadhaarid' },
    },
    {
      slug: 'pan-details',
      apiUrl: 'https://api.finpayultra.com/api/pan_ details',
      apiKey: process.env.FINPAY_API_KEY || '',
      method: 'GET',
      paramMap: { panNo: 'Panid' },
    },
    {
      slug: 'vehicle-details',
      apiUrl: 'https://api.finpayultra.com/api/rc-details',
      apiKey: process.env.FINPAY_API_KEY || '',
      method: 'GET',
      paramMap: { regNo: 'vehicleNumber' },
    },
  ];

  for (const u of updates) {
    const { slug, ...fields } = u;
    const result = await Service.updateOne({ slug }, { $set: fields });
    console.log(`${slug}: matched=${result.matchedCount} modified=${result.modifiedCount}`);
  }

  await mongoose.disconnect();
  console.log('Done');
}

migrate().catch(console.error);
