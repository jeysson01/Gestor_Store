import { Navigation } from '@/components/navigation';
import { ProductsList } from '@/components/products-list';

export default function Page() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Gestión de Productos</h1>
            <p className="text-muted-foreground">Administra el inventario de productos</p>
          </div>
          <ProductsList />
        </div>
      </main>
    </>
  );
}
