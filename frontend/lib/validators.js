import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone number must be 10 digits'),
  role: z.enum(['admin', 'delivery']),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Delivery schemas
export const deliverySchema = z.object({
  customerName: z.string().min(2, 'Customer name is required'),
  customerPhone: z.string().regex(/^[0-9]{10}$/, 'Invalid phone number'),
  customerEmail: z.string().email().optional().or(z.literal('')),
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(2, 'State is required'),
    zipCode: z.string().regex(/^[0-9]{5}$/, 'Invalid zip code'),
  }),
  packageInfo: z.object({
    description: z.string().min(1, 'Package description is required'),
    weight: z.number().positive('Weight must be positive'),
    value: z.number().positive('Value must be positive').optional(),
    fragile: z.boolean().default(false),
  }),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
  deliveryWindow: z.object({
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  }).optional(),
  deliveryInstructions: z.string().optional(),
});

// Tracking schema
export const trackingSchema = z.object({
  trackingCode: z.string()
    .length(6, 'Tracking code must be 6 characters')
    .regex(/^[A-Z0-9]{6}$/, 'Invalid tracking code format'),
});

// Feedback schema
export const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

// Status update schema
export const statusUpdateSchema = z.object({
  status: z.enum(['picked-up', 'in-transit', 'delivered', 'failed']),
  notes: z.string().optional(),
  failureReason: z.string().optional(),
});
