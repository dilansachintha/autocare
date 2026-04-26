import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/User.model';
import { Vehicle } from '../models/Vehicle.model';
import { Inventory } from '../models/Inventory.model';
import { Appointment } from '../models/Appointment.model';
import { Notification } from '../models/Notification.model';
import { Feedback } from '../models/Feedback.model';
import { Emergency } from '../models/Emergency.model';
import { Message } from '../models/Message.model';

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
      Notification.deleteMany({}),
      Feedback.deleteMany({}),
      Emergency.deleteMany({}),
      Message.deleteMany({}),
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
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const twoDaysAgo = new Date(today); twoDaysAgo.setDate(today.getDate() - 2);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const dayAfterTomorrow = new Date(today); dayAfterTomorrow.setDate(today.getDate() + 2);
    const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);
    const nextTenDays = new Date(today); nextTenDays.setDate(today.getDate() + 10);

    const completedPaid = await Appointment.create({
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
      paymentId: 'pi_seed_paid_001',
      progressUpdates: [
        { message: 'Appointment confirmed', timestamp: new Date(), updatedBy: admin._id },
        { message: 'Service started', timestamp: new Date(), updatedBy: mechanic1._id },
        { message: 'Service completed', timestamp: new Date(), updatedBy: mechanic1._id },
      ],
    });

    const pendingUrgent = await Appointment.create({
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

    const inProgress = await Appointment.create({
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

    const completedPendingPayment = await Appointment.create({
      customer: customer1._id,
      vehicle: vehicle1._id,
      mechanic: mechanic1._id,
      services: [
        { serviceType: 'AC Service', description: 'AC cooling diagnosis and gas top-up', estimatedCost: 6500, status: 'completed' },
      ],
      scheduledDate: yesterday,
      scheduledTime: '15:00',
      status: 'completed',
      priority: 'normal',
      totalEstimatedCost: 6500,
      totalActualCost: 6200,
      paymentStatus: 'pending',
      progressUpdates: [
        { message: 'Appointment confirmed', timestamp: new Date(), updatedBy: admin._id },
        { message: 'AC service started', timestamp: new Date(), updatedBy: mechanic1._id },
        { message: 'Service completed - awaiting payment', timestamp: new Date(), updatedBy: mechanic1._id },
      ],
    });

    const cancelledAppointment = await Appointment.create({
      customer: customer1._id,
      vehicle: vehicle2._id,
      services: [
        { serviceType: 'Engine Tune-Up', description: 'Engine tuning and diagnostics', estimatedCost: 12000, status: 'pending' },
      ],
      scheduledDate: dayAfterTomorrow,
      scheduledTime: '13:30',
      status: 'cancelled',
      priority: 'normal',
      totalEstimatedCost: 12000,
      paymentStatus: 'pending',
      notes: 'Customer rescheduled due to travel',
    });

    const confirmedMechanicJob = await Appointment.create({
      customer: customer2._id,
      vehicle: vehicle3._id,
      mechanic: mechanic2._id,
      services: [
        { serviceType: 'Battery Check', description: 'Battery health and charging system check', estimatedCost: 3000, status: 'pending' },
      ],
      scheduledDate: nextTenDays,
      scheduledTime: '09:30',
      status: 'confirmed',
      priority: 'normal',
      totalEstimatedCost: 3000,
      paymentStatus: 'pending',
    });

    const historicalPaid = await Appointment.create({
      customer: customer2._id,
      vehicle: vehicle3._id,
      mechanic: mechanic2._id,
      services: [
        { serviceType: 'Full Service', description: 'Periodic maintenance package', estimatedCost: 18000, status: 'completed' },
      ],
      scheduledDate: twoDaysAgo,
      scheduledTime: '08:30',
      status: 'completed',
      priority: 'normal',
      totalEstimatedCost: 18000,
      totalActualCost: 18200,
      paymentStatus: 'paid',
      paymentId: 'pi_seed_paid_002',
      progressUpdates: [
        { message: 'Vehicle checked in', timestamp: new Date(), updatedBy: mechanic2._id },
        { message: 'Service completed and delivered', timestamp: new Date(), updatedBy: mechanic2._id },
      ],
    });

    console.log('📅 Appointments seeded');

    // ─── FEEDBACK ──────────────────────────────────────────────────
    await Feedback.insertMany([
      {
        customer: customer1._id,
        appointment: completedPaid._id,
        mechanic: mechanic1._id,
        rating: 5,
        comment: 'Quick service and clear communication. Very satisfied.',
        serviceQuality: 5,
        timeliness: 5,
        valueForMoney: 4,
      },
      {
        customer: customer2._id,
        appointment: historicalPaid._id,
        mechanic: mechanic2._id,
        rating: 4,
        comment: 'Good overall service. Waiting area could be improved.',
        serviceQuality: 4,
        timeliness: 4,
        valueForMoney: 4,
      },
    ]);
    console.log('⭐ Feedback seeded');

    // ─── EMERGENCY REQUESTS ────────────────────────────────────────
    await Emergency.insertMany([
      {
        customer: customer1._id,
        vehicle: vehicle2._id,
        description: 'Engine overheated near highway exit',
        location: 'Southern Expressway - Exit 102',
        phone: customer1.phone,
        status: 'assigned',
        assignedMechanic: mechanic1._id,
      },
      {
        customer: customer2._id,
        vehicle: vehicle3._id,
        description: 'Flat tyre at office parking lot',
        location: 'Galle Fort - Main Street',
        phone: customer2.phone,
        status: 'open',
      },
      {
        customer: customer1._id,
        vehicle: vehicle1._id,
        description: 'Battery failure in the morning',
        location: 'Matara Clock Tower',
        phone: customer1.phone,
        status: 'resolved',
        assignedMechanic: mechanic2._id,
      },
    ]);
    console.log('🚨 Emergency requests seeded');

    // ─── MESSAGES ──────────────────────────────────────────────────
    await Message.insertMany([
      {
        sender: customer1._id,
        recipient: mechanic1._id,
        content: 'Can you confirm if brake pads are in stock for tomorrow?',
        appointment: pendingUrgent._id,
      },
      {
        sender: mechanic1._id,
        recipient: customer1._id,
        content: 'Yes, parts are available. We can complete it within 2 hours.',
        appointment: pendingUrgent._id,
        isRead: true,
      },
      {
        sender: mechanic2._id,
        recipient: customer2._id,
        content: 'Your full service is almost complete. Ready by 4 PM.',
        appointment: inProgress._id,
      },
      {
        sender: customer2._id,
        recipient: mechanic2._id,
        content: 'Great, thank you. Please also check wheel alignment.',
        appointment: inProgress._id,
        isRead: true,
      },
    ]);
    console.log('💬 Messages seeded');

    // ─── NOTIFICATIONS ─────────────────────────────────────────────
    await Notification.insertMany([
      {
        recipient: customer1._id,
        title: 'Appointment Confirmed',
        message: 'Your brake service appointment has been confirmed for tomorrow at 10:30.',
        type: 'appointment',
        relatedId: pendingUrgent._id,
      },
      {
        recipient: customer1._id,
        title: 'Payment Pending',
        message: 'Your AC service is completed. Please complete payment to close the job.',
        type: 'payment',
        relatedId: completedPendingPayment._id,
      },
      {
        recipient: customer2._id,
        title: 'Service In Progress',
        message: 'Your full service is currently in progress.',
        type: 'service',
        relatedId: inProgress._id,
      },
      {
        recipient: mechanic1._id,
        title: 'New Urgent Job',
        message: 'A new urgent brake service request has been assigned.',
        type: 'appointment',
        relatedId: pendingUrgent._id,
      },
      {
        recipient: mechanic2._id,
        title: 'Upcoming Assignment',
        message: 'You have a confirmed battery check booking in 10 days.',
        type: 'appointment',
        relatedId: confirmedMechanicJob._id,
      },
      {
        recipient: admin._id,
        title: 'Emergency Request Open',
        message: 'A new roadside emergency request was created and needs dispatch.',
        type: 'emergency',
      },
      {
        recipient: customer1._id,
        title: 'Appointment Cancelled',
        message: 'Your engine tune-up appointment was cancelled successfully.',
        type: 'appointment',
        relatedId: cancelledAppointment._id,
        isRead: true,
      },
      {
        recipient: customer2._id,
        title: 'Payment Received',
        message: 'Payment received for your completed full service appointment.',
        type: 'payment',
        relatedId: historicalPaid._id,
        isRead: true,
      },
    ]);
    console.log('🔔 Notifications seeded');

    console.log('\n✅ ─────────────────────────────────────────────');
    console.log('✅  Database seeded successfully!');
    console.log('✅ ─────────────────────────────────────────────');
    console.log('\n🔑  Login Credentials:');
    console.log('  Admin    → admin@autocare.com      / Admin@123');
    console.log('  Mechanic → mechanic@autocare.com   / Mechanic@123');
    console.log('  Customer → customer@autocare.com   / Customer@123\n');
    console.log('  Customer → customer2@autocare.com  / Customer@123\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
};

seed();
