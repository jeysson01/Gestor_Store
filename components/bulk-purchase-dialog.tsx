'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createPurchase } from '@/lib/actions/purchases';
import { getProducts } from '@/lib/actions/products';
import { ProductCombobox } from '@/components/product-combobox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { PlusIcon, Trash2Icon, ShoppingCartIcon } from 'lucide-react';
import { toast } from 'sonner';
import { formatSoles } from '@/lib/utils';

type PurchaseLine = {
  productId: number;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
};

const HeaderSchema = z.object({
  purchaseNumber: z.string().min(1, 'El número de compra es requerido'),
  purchaseDate: z.string().min(1, 'La fecha es requerida'),
  notes: z.string().optional(),
});

type HeaderValues = z.infer<typeof HeaderSchema>;

function newPurchaseNumber() {
  return `CP-${Date.now()}`;
}

type BulkPurchaseDialogProps = {
  products: any[];
  onSuccess: () => void;
};

export function BulkPurchaseDialog({ products, onSuccess }: BulkPurchaseDialogProps) {
  const [open, setOpen] = useState(false);
  const [catalog, setCatalog] = useState<any[]>(products);
  const [lines, setLines] = useState<PurchaseLine[]>([]);
  const [draftProductId, setDraftProductId] = useState(0);
  const [draftQuantity, setDraftQuantity] = useState(1);
  const [draftUnitPrice, setDraftUnitPrice] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const headerForm = useForm<HeaderValues>({
    resolver: zodResolver(HeaderSchema),
    defaultValues: {
      purchaseNumber: newPurchaseNumber(),
      purchaseDate: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  const totals = useMemo(() => {
    const totalUnits = lines.reduce((sum, line) => sum + line.quantity, 0);
    const grandTotal = lines.reduce(
      (sum, line) => sum + line.quantity * line.unitPrice,
      0
    );
    return {
      lineCount: lines.length,
      totalUnits,
      grandTotal,
    };
  }, [lines]);

  const resetDialog = () => {
    setLines([]);
    setDraftProductId(0);
    setDraftQuantity(1);
    setDraftUnitPrice(0);
    headerForm.reset({
      purchaseNumber: newPurchaseNumber(),
      purchaseDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  useEffect(() => {
    setCatalog(products);
  }, [products]);

  const handleOpenChange = async (next: boolean) => {
    setOpen(next);
    if (next) {
      const result = await getProducts();
      if (result.success) setCatalog(result.data);
      resetDialog();
    }
  };

  const addLineToList = () => {
    if (!draftProductId) {
      toast.error('Selecciona un producto');
      return;
    }
    if (draftQuantity < 1) {
      toast.error('La cantidad debe ser al menos 1');
      return;
    }
    if (draftUnitPrice < 0) {
      toast.error('El precio no puede ser negativo');
      return;
    }

    const product = catalog.find((p) => p.id === draftProductId);
    if (!product) {
      toast.error('Producto no encontrado');
      return;
    }

    const existingIndex = lines.findIndex((l) => l.productId === draftProductId);
    if (existingIndex >= 0) {
      setLines((prev) =>
        prev.map((line, i) =>
          i === existingIndex
            ? {
                ...line,
                quantity: line.quantity + draftQuantity,
                unitPrice: draftUnitPrice,
              }
            : line
        )
      );
      toast.success('Cantidad sumada al producto ya en la lista');
    } else {
      setLines((prev) => [
        ...prev,
        {
          productId: draftProductId,
          productName: product.name,
          productCode: product.code,
          quantity: draftQuantity,
          unitPrice: draftUnitPrice,
        },
      ]);
      toast.success('Producto agregado a la compra');
    }

    setDraftProductId(0);
    setDraftQuantity(1);
    setDraftUnitPrice(0);
  };

  const removeLine = (productId: number) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  };

  const updateLineQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) return;
    setLines((prev) =>
      prev.map((l) => (l.productId === productId ? { ...l, quantity } : l))
    );
  };

  const updateLinePrice = (productId: number, unitPrice: number) => {
    if (unitPrice < 0) return;
    setLines((prev) =>
      prev.map((l) => (l.productId === productId ? { ...l, unitPrice } : l))
    );
  };

  const onSubmit = async (header: HeaderValues) => {
    if (lines.length === 0) {
      toast.error('Agrega al menos un producto a la compra por mayor');
      return;
    }

    setSubmitting(true);
    try {
      const result = await createPurchase({
        purchaseNumber: header.purchaseNumber,
        purchaseDate: new Date(header.purchaseDate),
        notes: header.notes,
        items: lines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
        })),
      });

      if (result.success) {
        toast.success(
          `Compra registrada: ${lines.length} productos, total ${formatSoles(totals.grandTotal)}`
        );
        setOpen(false);
        resetDialog();
        onSuccess();
      } else {
        toast.error(result.error || 'Error al crear la compra');
      }
    } catch {
      toast.error('Error al crear la compra');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <ShoppingCartIcon className="w-4 h-4" />
          Compra por mayor
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Compra por mayor</DialogTitle>
        </DialogHeader>

        <Form {...headerForm}>
          <form onSubmit={headerForm.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormField
                control={headerForm.control}
                name="purchaseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de compra</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={headerForm.control}
                name="purchaseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={headerForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Proveedor, observaciones..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Card>
              <CardContent className="pt-4 space-y-3">
                <p className="text-sm font-medium">Agregar producto a la lista</p>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                  <div className="md:col-span-5">
                    <FormLabel className="text-xs text-muted-foreground mb-1 block">
                      Producto
                    </FormLabel>
                    <ProductCombobox
                      products={catalog}
                      value={draftProductId}
                      onSelect={(productId, unitPrice) => {
                        setDraftProductId(productId);
                        setDraftUnitPrice(unitPrice);
                      }}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <FormLabel className="text-xs text-muted-foreground mb-1 block">
                      Cantidad
                    </FormLabel>
                    <Input
                      type="number"
                      min={1}
                      value={draftQuantity}
                      onChange={(e) =>
                        setDraftQuantity(parseInt(e.target.value, 10) || 1)
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <FormLabel className="text-xs text-muted-foreground mb-1 block">
                      Precio unit.
                    </FormLabel>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={draftUnitPrice}
                      onChange={(e) =>
                        setDraftUnitPrice(parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <FormLabel className="text-xs text-muted-foreground mb-1 block">
                      Subtotal
                    </FormLabel>
                    <div className="h-9 flex items-center px-3 rounded-md border bg-muted/40 text-sm font-medium">
                      {formatSoles(draftQuantity * draftUnitPrice)}
                    </div>
                  </div>
                  <div className="md:col-span-1">
                    <Button
                      type="button"
                      className="w-full gap-1 font-bold bg-primary text-white hover:bg-primary/90"
                      onClick={addLineToList}
                    >
                      <PlusIcon className="w-4 h-4" />
                      Añadir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">
                  Productos en esta compra ({lines.length})
                </p>
                {lines.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => setLines([])}
                  >
                    Vaciar lista
                  </Button>
                )}
              </div>

              {lines.length === 0 ? (
                <div className="rounded-lg border border-dashed py-10 text-center text-muted-foreground text-sm">
                  Aún no hay productos. Agrega al menos uno para registrar la compra por
                  mayor.
                </div>
              ) : (
                <div className="rounded-lg border overflow-x-auto max-h-[280px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-right w-24">Cant.</TableHead>
                        <TableHead className="text-right w-28">P. unit.</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead className="w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lines.map((line, index) => {
                        const subtotal = line.quantity * line.unitPrice;
                        return (
                          <TableRow key={line.productId}>
                            <TableCell className="text-muted-foreground">
                              {index + 1}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {line.productCode}
                            </TableCell>
                            <TableCell className="font-medium">{line.productName}</TableCell>
                            <TableCell className="text-right">
                              <Input
                                type="number"
                                min={1}
                                className="h-8 text-right ml-auto w-20"
                                value={line.quantity}
                                onChange={(e) =>
                                  updateLineQuantity(
                                    line.productId,
                                    parseInt(e.target.value, 10) || 1
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <Input
                                type="number"
                                min={0}
                                step="0.01"
                                className="h-8 text-right ml-auto w-24"
                                value={line.unitPrice}
                                onChange={(e) =>
                                  updateLinePrice(
                                    line.productId,
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatSoles(subtotal)}
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => removeLine(line.productId)}
                              >
                                <Trash2Icon className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            <Card className="bg-muted/30">
              <CardContent className="pt-4 pb-4">
                <p className="text-sm font-semibold mb-3">Resumen total de la compra</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Productos distintos</p>
                    <p className="text-lg font-bold">{totals.lineCount}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Unidades totales</p>
                    <p className="text-lg font-bold">{totals.totalUnits}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-muted-foreground text-xs">Monto total</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatSoles(totals.grandTotal)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              className="w-full"
              disabled={submitting || lines.length === 0}
            >
              {submitting
                ? 'Guardando compra...'
                : `Guardar compra por mayor (${formatSoles(totals.grandTotal)})`}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
