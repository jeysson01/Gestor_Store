import { z } from 'zod';

export const CreateProductSchema = z.object({
  code: z.string().min(1, 'El código es requerido'),
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  categoryId: z.number().optional(),
  unitPrice: z.number().min(0, 'El precio debe ser mayor a 0'),
  currentStock: z.number().int().min(0, 'El stock no puede ser negativo').default(0),
  minimumStock: z.number().int().default(0),
  maximumStock: z.number().int().default(999999),
  unit: z.string().default('unidad'),
  supplier: z.string().optional(),
});

export const UpdateProductSchema = CreateProductSchema.partial().extend({
  currentStock: z.number().int().optional(),
});

export const CreatePurchaseSchema = z.object({
  purchaseNumber: z.string().min(1, 'El número de compra es requerido'),
  supplierId: z.number().optional(),
  purchaseDate: z.date(),
  expectedDeliveryDate: z.date().optional(),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive('Selecciona un producto'),
        quantity: z.number().int().min(1, 'Cantidad mínima 1'),
        unitPrice: z.number().min(0),
      })
    )
    .min(1, 'Agrega al menos un producto a la compra'),
});

export const UpdatePurchaseSchema = z.object({
  status: z.enum(['pendiente', 'recibida', 'parcial', 'cancelada']),
  actualDeliveryDate: z.date().optional(),
  notes: z.string().optional(),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type CreatePurchaseInput = z.infer<typeof CreatePurchaseSchema>;
export type UpdatePurchaseInput = z.infer<typeof UpdatePurchaseSchema>;
