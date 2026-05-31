'use server';

import { db } from '@/lib/db';
import { products, purchases, purchaseDetails } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import * as XLSX from 'xlsx';

export async function exportProductsToExcel() {
  try {
    const productsData = await db.select().from(products).limit(10000);

    const worksheet = XLSX.utils.json_to_sheet(
      productsData.map((p) => ({
        Código: p.code,
        Nombre: p.name,
        Descripción: p.description,
        'Precio Unitario': p.unitPrice,
        'Stock Actual': p.currentStock,
        'Stock Mínimo': p.minimumStock,
        'Stock Máximo': p.maximumStock,
        Unidad: p.unit,
        Proveedor: p.supplier,
        'Creado en': p.createdAt,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos');

    return {
      success: true,
      fileName: 'productos.xlsx',
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function exportPurchasesToExcel() {
  try {
    const purchasesData = await db.select().from(purchases).limit(10000);

    const worksheet = XLSX.utils.json_to_sheet(
      purchasesData.map((p) => ({
        'Número de Compra': p.purchaseNumber,
        Fecha: p.purchaseDate,
        Estado: p.status,
        'Total': p.totalAmount,
        'Fecha Entrega Esperada': p.expectedDeliveryDate,
        'Fecha Entrega Real': p.actualDeliveryDate,
        Notas: p.notes,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Compras');

    return {
      success: true,
      fileName: 'compras.xlsx',
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function exportDetailedPurchaseToExcel(purchaseId: number) {
  try {
    const purchase = await db
      .select()
      .from(purchases)
      .where(eq(purchases.id, purchaseId))
      .limit(1);

    if (!purchase.length) {
      return { success: false, error: 'Compra no encontrada' };
    }

    const details = await db
      .select()
      .from(purchaseDetails)
      .where(eq(purchaseDetails.purchaseId, purchaseId));

    const detailsWithProducts = await Promise.all(
      details.map(async (detail) => {
        const product = await db
          .select()
          .from(products)
          .where(eq(products.id, detail.productId))
          .limit(1);

        return {
          'Código Producto': product[0]?.code,
          'Nombre Producto': product[0]?.name,
          Cantidad: detail.quantity,
          'Precio Unitario': detail.unitPrice,
          'Total': detail.totalPrice,
          'Cantidad Recibida': detail.receivedQuantity,
        };
      })
    );

    const worksheet = XLSX.utils.json_to_sheet(detailsWithProducts);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Compra ${purchase[0].purchaseNumber}`);

    return {
      success: true,
      fileName: `compra_${purchase[0].purchaseNumber}.xlsx`,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
