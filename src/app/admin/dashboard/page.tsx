'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Package } from 'lucide-react';
import { Product } from '@/lib/types';
import Image from 'next/image';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { collection, getDocs, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

// Helper to get image path from URL for deletion
const getImagePathFromUrl = (url: string): string | null => {
    try {
        const urlObj = new URL(url);
        const pathName = urlObj.pathname;
        // The path in the URL is something like /v0/b/your-bucket.appspot.com/o/products%2Fimage.jpg
        const match = pathName.match(/\/o\/(.+?)(\?|$)/);
        if (match && match[1]) {
            return decodeURIComponent(match[1]);
        }
        return null;
    } catch (e) {
        console.error("Could not parse URL to get image path", url, e);
        return null;
    }
};

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const fetchProducts = async () => {
    setLoading(true);
    try {
        const productsCollection = collection(db, "products");
        const q = query(productsCollection, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return { 
            id: doc.id, 
            ...data,
            createdAt: data.createdAt?.toDate().toISOString(),
          } as Product;
        });
        setProducts(productsData);
    } catch (error) {
        console.error("Error fetching products: ", error);
        toast({ title: 'Error', description: 'No se pudieron cargar los productos.', variant: 'destructive' });
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${product.name}"?`)) return;

    try {
        const imagesToDelete = [product.image, ...(product.images || [])].filter(Boolean) as string[];

        // Delete Firestore document first
        await deleteDoc(doc(db, "products", product.id));

        // Then delete images from Storage
        for (const imageUrl of imagesToDelete) {
            const imagePath = getImagePathFromUrl(imageUrl);
            if (imagePath) {
                try {
                    await deleteObject(ref(storage, imagePath));
                } catch (storageError) {
                    // Log error but don't block the process if an image fails to delete
                    console.error(`Failed to delete image ${imagePath}:`, storageError);
                }
            }
        }

        toast({ title: 'Éxito', description: 'Producto eliminado correctamente.' });
        await fetchProducts(); // Refresh the list
    } catch (error) {
        console.error("Error deleting product: ", error);
        toast({ title: 'Error', description: 'No se pudo eliminar el producto.', variant: 'destructive' });
    }
  };

  const handleEdit = (product: Product) => {
    router.push(`/admin/products/form?id=${product.id}`);
  };
  
  const handleAdd = () => {
    router.push('/admin/products/form');
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline">Gestión de Productos</CardTitle>
            <CardDescription>Añade, edita o elimina productos de tu tienda.</CardDescription>
          </div>
          <Button size="sm" className="gap-1" onClick={handleAdd}>
              <PlusCircle className="h-4 w-4" />
              Añadir Producto
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
          ) : products.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                  <TableHeader>
                  <TableRow>
                      <TableHead className="hidden w-[100px] sm:table-cell">
                      <span className="sr-only">Imagen</span>
                      </TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead className="hidden md:table-cell">Descripción</TableHead>
                      <TableHead>
                      <span className="sr-only">Acciones</span>
                      </TableHead>
                  </TableRow>
                  </TableHeader>
                  <TableBody>
                  {products.map((product) => (
                      <TableRow key={product.id}>
                      <TableCell className="hidden sm:table-cell">
                          <Image
                          alt={product.name}
                          className="aspect-square rounded-md object-cover"
                          height="64"
                          src={product.image}
                          width="64"
                          unoptimized
                          />
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{formatPrice(product.price)}</TableCell>
                      <TableCell className="hidden md:table-cell max-w-xs truncate">{product.description}</TableCell>
                      <TableCell>
                          <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                              </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleEdit(product)}>Editar</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(product)} className="text-destructive focus:text-destructive focus:bg-destructive/10">Eliminar</DropdownMenuItem>
                          </DropdownMenuContent>
                          </DropdownMenu>
                      </TableCell>
                      </TableRow>
                  ))}
                  </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="font-headline text-xl font-semibold mt-4">Tu tienda aún no tiene productos</h3>
                <p className="text-muted-foreground mt-2 mb-4">¡Comienza a construir tu catálogo! Añade tu primer producto para que tus clientes puedan verlo.</p>
                <Button onClick={handleAdd}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir mi primer producto
                </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
