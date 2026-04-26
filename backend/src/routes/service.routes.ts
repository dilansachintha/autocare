import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Static service catalog - no DB needed
const SERVICE_CATALOG = [
  { id: '1', name: 'Oil Change', category: 'Maintenance', estimatedCost: 3500, duration: 60, description: 'Engine oil and filter replacement' },
  { id: '2', name: 'Brake Service', category: 'Safety', estimatedCost: 8500, duration: 120, description: 'Brake pads, rotors inspection and replacement' },
  { id: '3', name: 'Tire Rotation', category: 'Maintenance', estimatedCost: 2000, duration: 45, description: 'Rotate and balance all four tires' },
  { id: '4', name: 'Engine Tune-Up', category: 'Performance', estimatedCost: 12000, duration: 180, description: 'Spark plugs, filters, and engine diagnostics' },
  { id: '5', name: 'AC Service', category: 'Comfort', estimatedCost: 6500, duration: 90, description: 'AC system check, refrigerant recharge' },
  { id: '6', name: 'Battery Replacement', category: 'Electrical', estimatedCost: 15000, duration: 30, description: 'Battery test and replacement' },
  { id: '7', name: 'Wheel Alignment', category: 'Safety', estimatedCost: 4500, duration: 60, description: 'Four-wheel alignment and adjustment' },
  { id: '8', name: 'Full Service', category: 'Comprehensive', estimatedCost: 25000, duration: 240, description: 'Complete vehicle inspection and servicing' },
  { id: '9', name: 'Transmission Service', category: 'Drivetrain', estimatedCost: 18000, duration: 150, description: 'Transmission fluid change and inspection' },
  { id: '10', name: 'Suspension Check', category: 'Safety', estimatedCost: 5000, duration: 90, description: 'Shocks, struts and suspension inspection' },
  { id: '11', name: 'Exhaust Repair', category: 'Performance', estimatedCost: 9000, duration: 120, description: 'Exhaust system inspection and repair' },
  { id: '12', name: 'Vehicle Diagnostics', category: 'Diagnostics', estimatedCost: 3000, duration: 60, description: 'Computer diagnostic scan and report' },
];

router.get('/', authenticate, (_req: Request, res: Response) => {
  res.json({ success: true, data: SERVICE_CATALOG });
});

router.get('/categories', authenticate, (_req: Request, res: Response) => {
  const categories = [...new Set(SERVICE_CATALOG.map((s) => s.category))];
  res.json({ success: true, data: categories });
});

export default router;
