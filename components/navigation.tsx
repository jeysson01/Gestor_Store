'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PackageIcon, ShoppingCartIcon, BarChart3Icon, SettingsIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navigation() {
  const pathname = usePathname();

  const links = [
    {
      href: '/',
      label: 'Dashboard',
      icon: BarChart3Icon,
    },
    {
      href: '/productos',
      label: 'Productos',
      icon: PackageIcon,
    },
    {
      href: '/compras',
      label: 'Compras',
      icon: ShoppingCartIcon,
    },
    {
      href: '/reportes',
      label: 'Reportes',
      icon: SettingsIcon,
    },
  ];

  return (
    <nav className="border-b border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-bold text-lg text-foreground">
              Inventario Pro
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {links.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
