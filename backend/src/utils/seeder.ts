import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/User.model';
import { Vehicle } from '../models/Vehicle.model';
import { Inventory } from '../models/Inventory.model';
import { Appointment } from '../models/Appointment.model';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/autocare');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Vehicle.deleteMany({}),
      Inventory.deleteMany({}),
      Appointment.deleteMany({}),
    ]);
    console.log('🧹 Cleared existing data');

    // ─── USERS ───────────────────────────────────────────────────
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@autocare.com',
      password: 'Admin@123',
      phone: '+94771234567',
      role: 'admin',
    });

    const mechanic1 = await User.create({
      name: 'Roshan Fernando',
      email: 'mechanic@autocare.com',
      password: 'Mechanic@123',
      phone: '+94772345678',
      role: 'mechanic',
    });

    const mechanic2 = await User.create({
      name: 'Kasun Perera',
      email: 'mechanic2@autocare.com',
      password: 'Mechanic@123',
      phone: '+94773456789',
      role: 'mechanic',
    });

    const customer1 = await User.create({
      name: 'Dilan Wijethunga',
      email: 'customer@autocare.com',
      password: 'Customer@123',
      phone: '+94774567890',
      role: 'customer',
      address: { street: '45 Galle Road', city: 'Matara', state: 'Southern', zipCode: '81000' },
    });

    const customer2 = await User.create({
      name: 'Samantha Silva',
      email: 'customer2@autocare.com',
      password: 'Customer@123',
      phone: '+94775678901',
      role: 'customer',
      address: { street: '12 Colombo Road', city: 'Galle', state: 'Southern', zipCode: '80000' },
    });

    console.log('👥 Users seeded');

    // ─── VEHICLES ─────────────────────────────────────────────────
    const vehicle1 = await Vehicle.create({
      owner: customer1._id,
      make: 'Toyota',
      model: 'Corolla',
      year: 2019,
      licensePlate: 'WP CAB 1234',
      color: 'Silver',
      mileage: 45000,
      fuelType: 'petrol',
      transmission: 'automatic',
    });

    const vehicle2 = await Vehicle.create({
      owner: customer1._id,
      make: 'Honda',
      model: 'Civic',
      year: 2021,
      licensePlate: 'WP CAB 5678',
      color: 'Blue',
      mileage: 22000,
      fuelType: 'petrol',
      transmission: 'automatic',
    });

    const vehicle3 = await Vehicle.create({
      owner: customer2._id,
      make: 'Suzuki',
      model: 'Alto',
      year: 2020,
      licensePlate: 'SB CAC 9012',
      color: 'White',
      mileage: 30000,
      fuelType: 'petrol',
      transmission: 'manual',
    });

    await User.findByIdAndUpdate(customer1._id, { $push: { vehicles: { $each: [vehicle1._id, vehicle2._id] } } });
    await User.findByIdAndUpdate(customer2._id, { $push: { vehicles: vehicle3._id } });

    console.log('🚗 Vehicles seeded');

    // ─── INVENTORY ────────────────────────────────────────────────
    await Inventory.insertMany([
      { name: 'Engine Oil 5W-30 (1L)', category: 'Lubricants', sku: 'OIL-5W30-1L', quantity: 50, minStockLevel: 10, unitPrice: 1200, supplier: 'Lanka Lubricants' },
      { name: 'Oil Filter', category: 'Filters', sku: 'FLT-OIL-001', quantity: 30, minStockLevel: 5, unitPrice: 850, supplier: 'AutoParts LK' },
      { name: 'Air Filter', category: 'Filters', sku: 'FLT-AIR-001', quantity: 25, minStockLevel: 5, unitPrice: 1500, supplier: 'AutoParts LK' },
      { name: 'Brake Pads (Set)', category: 'Brakes', sku: 'BRK-PAD-001', quantity: 15, minStockLevel: 5, unitPrice: 4500, supplier: 'Brakes Plus' },
      { name: 'Spark Plugs (Set of 4)', category: 'Engine', sku: 'ENG-SPK-001', quantity: 20, minStockLevel: 5, unitPrice: 2800, supplier: 'NGK Lanka' },
      { name: 'Battery 12V 60Ah', category: 'Electrical', sku: 'BAT-12V-60', quantity: 8, minStockLevel: 3, unitPrice: 18000, supplier: 'Amaron Lanka' },
      { name: 'Coolant (1L)', category: 'Fluids', sku: 'FLD-CLT-1L', quantity: 5, minStockLevel: 10, unitPrice: 900, supplier: 'Lanka Lubricants' },
      { name: 'Wiper Blades (Pair)', category: 'Wipers', sku: 'WPR-BLD-001', quantity: 0, minStockLevel: 5, unitPrice: 1800, supplier: 'AutoParts LK' },
      { name: 'Transmission Fluid (1L)', category: 'Fluids', sku: 'FLD-TRN-1L', quantity: 18, minStockLevel: 5, unitPrice: 1600, supplier: 'Lanka Lubricants' },
      { name: 'AC Refrigerant R134a', category: 'AC', sku: 'AC-REF-001', quantity: 12, minStockLevel: 3, unitPrice: 3500, supplier: 'CoolTech Lanka' },
    ]);

    console.log('📦 Inventory seeded');

    // ─── SAMPLE APPOINTMENTS ──────────────────────────────────────
    const today = new Date();
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);

    await Appointment.create({
      customer: customer1._id,
      vehicle: vehicle1._id,
      mechanic: mechanic1._id,
      services: [{ serviceType: 'Oil Change', description: 'Engine oil and filter replacement', estimatedCost: 3500, status: 'completed' }],
      scheduledDate: today,
      scheduledTime: '09:00',
      status: 'completed',
      priority: 'normal',
      totalEstimatedCost: 3500,
      totalActualCost: 3500,
      paymentStatus: 'paid',
      progressUpdates: [
        { message: 'Appointment confirmed', timestamp: new Date(), updatedBy: admin._id },
        { message: 'Service started', timestamp: new Date(), updatedBy: mechanic1._id },
        { message: 'Service completed', timestamp: new Date(), updatedBy: mechanic1._id },
      ],
    });

    await Appointment.create({
      customer: customer1._id,
      vehicle: vehicle2._id,
      services: [{ serviceType: 'Brake Service', description: 'Brake pads replacement', estimatedCost: 8500, status: 'pending' }],
      scheduledDate: tomorrow,
      scheduledTime: '10:30',
      status: 'pending',
      priority: 'urgent',
      totalEstimatedCost: 8500,
      paymentStatus: 'pending',
      notes: 'Brake noise when stopping',
    });

    await Appointment.create({
      customer: customer2._id,
      vehicle: vehicle3._id,
      mechanic: mechanic2._id,
      services: [
        { serviceType: 'Full Service', description: 'Complete vehicle service', estimatedCost: 25000, status: 'in_progress' },
        { serviceType: 'AC Service', description: 'AC recharge', estimatedCost: 6500, status: 'pending' },
      ],
      scheduledDate: today,
      scheduledTime: '11:00',
      status: 'in_progress',
      priority: 'normal',
      totalEstimatedCost: 31500,
      paymentStatus: 'pending',
      progressUpdates: [
        { message: 'Vehicle received', timestamp: new Date(), updatedBy: mechanic2._id },
        { message: 'Inspection started', timestamp: new Date(), updatedBy: mechanic2._id },
      ],
    });

    await Appointment.create({
      customer: customer2._id,
      vehicle: vehicle3._id,
      services: [{ serviceType: 'Wheel Alignment', description: '4-wheel alignment', estimatedCost: 4500, status: 'pending' }],
      scheduledDate: nextWeek,
      scheduledTime: '14:00',
      status: 'confirmed',
      priority: 'normal',
      totalEstimatedCost: 4500,
      paymentStatus: 'pending',
    });

    console.log('📅 Appointments seeded');

    console.log('\n✅ ─────────────────────────────────────────────');
    console.log('✅  Database seeded successfully!');
    console.log('✅ ─────────────────────────────────────────────');
    console.log('\n🔑  Login Credentials:');
    console.log('  Admin    → admin@autocare.com      / Admin@123');
    console.log('  Mechanic → mechanic@autocare.com   / Mechanic@123');
    console.log('  Customer → customer@autocare.com   / Customer@123\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
};

seed();
