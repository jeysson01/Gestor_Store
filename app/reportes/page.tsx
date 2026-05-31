import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function Page() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Reportes</h1>
            <p className="text-muted-foreground">Exporta datos e información del sistema</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Reporte de Productos</CardTitle>
                <CardDescription>Exporta el listado completo de productos a Excel</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="gap-2 w-full">
                  <Download className="w-4 h-4" />
                  Descargar Productos
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reporte de Compras</CardTitle>
                <CardDescription>Exporta el historial de compras a Excel</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="gap-2 w-full">
                  <Download className="w-4 h-4" />
                  Descargar Compras
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Análisis de Inventario</CardTitle>
                <CardDescription>Estado actual del inventario y alertas</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="gap-2 w-full" variant="outline">
                  <Download className="w-4 h-4" />
                  Generar Reporte
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Movimientos de Stock</CardTitle>
                <CardDescription>Historial de cambios en el inventario</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="gap-2 w-full" variant="outline">
                  <Download className="w-4 h-4" />
                  Descargar Movimientos
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
