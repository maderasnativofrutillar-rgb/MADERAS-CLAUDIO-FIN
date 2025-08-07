'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/product-card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product } from '@/lib/types';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { categories } from '@/lib/constants';

function slugify(text: string) {
    return text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
}

async function getProducts(): Promise<Product[]> {
  const querySnapshot = await getDocs(collection(db, "products"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}

export default function TiendaPage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('categoria');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategory ? [initialCategory] : []);
  const [sortOrder, setSortOrder] = useState('default');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const productsData = await getProducts();
      setProducts(productsData);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const handleCategoryChange = (categorySlug: string) => {
    setSelectedCategories(prev => 
      prev.includes(categorySlug) 
        ? prev.filter(c => c !== categorySlug)
        : [...prev, categorySlug]
    );
  };

  const filteredAndSortedProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.some(cat => {
        const categoryWords = cat.split('-');
        return categoryWords.some(word => product.name.toLowerCase().includes(word) || product.description.toLowerCase().includes(word));
    });

    return matchesSearch && matchesCategory;
  }).sort((a: Product, b: Product) => {
    switch (sortOrder) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      default:
        // Assuming createdAt exists for default sorting
        // @ts-ignore
        return (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0);
    }
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
            <h2 className="font-headline text-xl font-bold mb-4 flex items-center gap-2">
              <SlidersHorizontal size={20} />
              Filtros
            </h2>
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
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-muted-foreground">
              Mostrando {filteredAndSortedProducts.length} de {products.length} productos
            </p>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Más nuevos</SelectItem>
                <SelectItem value="price-desc">Precio: Mayor a Menor</SelectItem>
                <SelectItem value="price-asc">Precio: Menor a Mayor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {loading ? (
             <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-48 w-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-4 w-3/4 mb-2" />
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-1/2 mt-1" />
                        </CardContent>
                        <CardFooter className="flex justify-between">
                             <Skeleton className="h-8 w-20" />
                             <Skeleton className="h-10 w-28" />
                        </CardFooter>
                    </Card>
                ))}
             </div>
          ) : filteredAndSortedProducts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedProducts.map(product => (
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

