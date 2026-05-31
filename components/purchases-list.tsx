'use client';

import { useState, useEffect } from 'react';
import { getPurchases, getPurchaseById } from '@/lib/actions/purchases';
import { getProducts } from '@/lib/actions/products';
import { BulkPurchaseDialog } from '@/components/bulk-purchase-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { formatSoles } from '@/lib/utils';

export function PurchasesList() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [purchasesResult, productsResult] = await Promise.all([
        getPurchases(),
        getProducts(),
      ]);
      if (purchasesResult.success) setPurchases(purchasesResult.data);
      if (productsResult.success) setProducts(productsResult.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectPurchase = async (purchaseId: number) => {
    try {
      const result = await getPurchaseById(purchaseId);
      if (result.success) {
        setSelectedPurchase(result.data);
      }
    } catch {
      toast.error('Error al cargar compra');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'recibida':
        return 'bg-green-100 text-green-800';
      case 'parcial':
        return 'bg-blue-100 text-blue-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <CardTitle>Gestión de Compras</CardTitle>
            <CardDescription>
              Órdenes de compra por mayor con varios productos y totales automáticos
            </CardDescription>
          </div>
          <BulkPurchaseDialog products={products} onSuccess={loadData} />
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2Icon className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell className="font-medium">{purchase.purchaseNumber}</TableCell>
                    <TableCell>
                      {new Date(purchase.purchaseDate).toLocaleDateString('es-ES')}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatSoles(purchase.totalAmount || 0)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(purchase.status)}`}
                      >
                        {purchase.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSelectPurchase(purchase.id)}
                      >
                        Ver detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {purchases.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No hay compras registradas. Usa &quot;Compra por mayor&quot; para crear la
                primera.
              </div>
            )}
          </div>
        )}

        {selectedPurchase && (
          <div className="mt-8 p-4 border rounded-lg bg-muted/30">
            <h3 className="font-bold mb-4">
              Detalles de compra: {selectedPurchase.purchaseNumber}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Fecha</p>
                <p className="font-medium">
                  {new Date(selectedPurchase.purchaseDate).toLocaleDateString('es-ES')}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Productos</p>
                <p className="font-medium">{selectedPurchase.details?.length ?? 0}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Unidades</p>
                <p className="font-medium">
                  {selectedPurchase.details?.reduce(
                    (sum: number, d: any) => sum + (d.quantity || 0),
                    0
                  ) ?? 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="font-bold text-lg">
                  {formatSoles(selectedPurchase.totalAmount || 0)}
                </p>
              </div>
            </div>

            {selectedPurchase.details && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right">Precio unitario</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedPurchase.details.map((detail: any) => (
                      <TableRow key={detail.id}>
                        <TableCell>{detail.product?.name}</TableCell>
                        <TableCell className="text-right">{detail.quantity}</TableCell>
                        <TableCell className="text-right">
                          {formatSoles(detail.unitPrice || 0)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatSoles(detail.totalPrice || 0)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
