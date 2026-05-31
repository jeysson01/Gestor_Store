import { Navigation } from '@/components/navigation';
import { PurchasesList } from '@/components/purchases-list';

export default function Page() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Gestión de Compras</h1>
            <p className="text-muted-foreground">Registro y seguimiento de órdenes de compra</p>
          </div>
          <PurchasesList />
        </div>
      </main>
    </>
  );
}
