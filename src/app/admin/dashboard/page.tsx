
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Package, Loader2 } from 'lucide-react';
import { Product } from '@/lib/types';
import Image from 'next/image';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { collection, getDocs, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { ProductForm } from '@/components/product-form';
import { Skeleton } from '@/components/ui/skeleton';

// Helper to get image name from URL
const getImageNameFromUrl = (url: string) => {
    try {
        const urlObj = new URL(url);
        // The file name is in the path, after 'products%2F'. We need to decode it.
        const pathSegments = urlObj.pathname.split('/');
        const encodedFileName = pathSegments.pop()?.split('?')[0] ?? '';
        if (encodedFileName.includes('products%2F')) {
             return decodeURIComponent(encodedFileName.split('products%2F')[1]);
        }
        // Fallback for different URL structures if needed, though the above should be robust.
        return decodeURIComponent(encodedFileName);
    } catch (e) {
        console.error("Could not parse URL to get image name", url, e);
        return '';
    }
};

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

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
            // Convert timestamp to string if it exists
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
        // Store image URLs before deleting the document
        const imagesToDelete = [product.image, ...(product.images || [])].filter(Boolean) as string[];

        // Delete the document from Firestore first
        await deleteDoc(doc(db, "products", product.id));

        // Now, delete the images from Storage
        for (const imageUrl of imagesToDelete) {
            try {
                if (imageUrl && imageUrl.includes('firebasestorage')) {
                    const imageName = getImageNameFromUrl(imageUrl);
                    if (imageName) {
                        const imageRef = ref(storage, `products/${imageName}`);
                        await deleteObject(imageRef);
                    }
                }
            } catch (storageError) {
                 // Log if a specific image fails, but don't block other deletions
                console.error(`Error deleting image ${imageUrl}: `, storageError);
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
    setEditingProduct(product);
    setIsDialogOpen(true);
  };
  
  const handleAdd = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  const onFormSuccess = async () => {
    await fetchProducts();
    setIsDialogOpen(false);
    setEditingProduct(null);
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
      
      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
          setIsDialogOpen(isOpen);
          if (!isOpen) setEditingProduct(null);
      }}>
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle className='font-headline'>{editingProduct ? 'Editar Producto' : 'Añadir Nuevo Producto'}</DialogTitle>
                <DialogDescription>{editingProduct ? 'Actualiza los detalles del producto.' : 'Completa los detalles para añadir un nuevo producto.'}</DialogDescription>
            </DialogHeader>
            <ProductForm
                product={editingProduct}
                onSuccess={onFormSuccess}
            />
        </DialogContent>
      </Dialog>
    </div>
  );
}
