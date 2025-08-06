'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { products } from '@/lib/constants';
import { ProductCard } from '@/components/product-card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';

const categories = [
  "Tablas para Servir",
  "Regalos Personalizados",
  "Tablas de Cocina",
  "Platos y Accesorios",
  "Empresas y Regalos Corporativos",
  "Tablas de Picoteo",
  "Despedida de Soltera",
];

function slugify(text: string) {
    return text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
}

export default function TiendaPage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('categoria');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategory ? [initialCategory] : []);

  const handleCategoryChange = (categorySlug: string) => {
    setSelectedCategories(prev => 
      prev.includes(categorySlug) 
        ? prev.filter(c => c !== categorySlug)
        : [...prev, categorySlug]
    );
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // This is a placeholder for category filtering logic. 
    // In a real app, products would have a category property.
    // For now, we'll just show all products if any category is selected.
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.some(cat => {
        // Mock logic: check if product name contains a word from the category
        const categoryWords = cat.split('-');
        return categoryWords.some(word => product.name.toLowerCase().includes(word) || product.description.toLowerCase().includes(word));
    });

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Nuestra Tienda</h1>
        <p className="text-lg text-muted-foreground mt-2">Explora todos nuestros productos artesanales.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
          <div className="sticky top-24">
            <h2 className="font-headline text-xl font-bold mb-4">Filtros</h2>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div>
              <h3 className="font-semibold mb-3">Categorías</h3>
              <div className="space-y-3">
                {categories.map(category => {
                  const categorySlug = slugify(category);
                  return (
                    <div key={categorySlug} className="flex items-center space-x-2">
                      <Checkbox 
                        id={categorySlug}
                        checked={selectedCategories.includes(categorySlug)}
                        onCheckedChange={() => handleCategoryChange(categorySlug)}
                      />
                      <Label htmlFor={categorySlug} className="cursor-pointer">{category}</Label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        <main className="md:col-span-3">
          {filteredProducts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground">No se encontraron productos que coincidan con tu búsqueda.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
