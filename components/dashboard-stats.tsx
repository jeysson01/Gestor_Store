'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Loader2Icon } from 'lucide-react';
import { getPurchaseStats } from '@/lib/actions/purchases';
import { getStockAlerts } from '@/lib/actions/products';

export function DashboardStats() {
  const [stats, setStats] = useState<any>(null);
  const [alerts, setAlerts] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsResult, alertsResult] = await Promise.all([
          getPurchaseStats(),
          getStockAlerts(),
        ]);

        if (statsResult.success) setStats(statsResult.data);
        if (alertsResult.success) setAlerts(alertsResult.data);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2Icon className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const COLORS = ['#000000', '#cccccc', '#666666', '#999999'];

  return (
    <div className="space-y-8">
      {/* Cards de estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Compras</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPurchases || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Compras registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monto Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.totalAmount?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground mt-1">Inversión total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.byStatus?.pendiente || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Compras por recibir</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recibidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.byStatus?.recibida || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Compras completadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de pastel de estados */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Compras</CardTitle>
            <CardDescription>Distribución por estado</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Pendiente', value: stats?.byStatus?.pendiente || 0 },
                    { name: 'Recibida', value: stats?.byStatus?.recibida || 0 },
                    { name: 'Parcial', value: stats?.byStatus?.parcial || 0 },
                    { name: 'Cancelada', value: stats?.byStatus?.cancelada || 0 },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Alertas de stock */}
        <Card>
          <CardHeader>
            <CardTitle>Alertas de Stock</CardTitle>
            <CardDescription>Productos con problemas de stock</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts?.lowStock && alerts.lowStock.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-orange-600 mb-2">Stock Bajo</h4>
                  <ul className="space-y-1">
                    {alerts.lowStock.map((product: any) => (
                      <li key={product.id} className="text-xs text-muted-foreground">
                        {product.name}: {product.currentStock} unidades
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {alerts?.outOfStock && alerts.outOfStock.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-red-600 mb-2">Sin Stock</h4>
                  <ul className="space-y-1">
                    {alerts.outOfStock.map((product: any) => (
                      <li key={product.id} className="text-xs text-muted-foreground">
                        {product.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(!alerts?.lowStock || alerts.lowStock.length === 0) &&
                (!alerts?.outOfStock || alerts.outOfStock.length === 0) && (
                  <p className="text-sm text-green-600">Todo el stock está en orden</p>
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
