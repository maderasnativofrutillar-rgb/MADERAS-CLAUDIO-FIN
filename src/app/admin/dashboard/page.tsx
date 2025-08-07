
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Seedling, Loader2 } from 'lucide-react';
import { Product } from '@/lib/types';
import Image from 'next/image';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { collection, getDocs, deleteDoc, doc, orderBy, query, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { ProductForm } from '@/components/product-form';
import { Skeleton } from '@/components/ui/skeleton';
import { products as seedProducts } from '@/lib/constants';

// Helper to get image name from URL
const getImageNameFromUrl = (url: string) => {
    try {
        const urlObj = new URL(url);
        const pathSegments = urlObj.pathname.split('/');
        // The file name is usually in the format 'o/products%2F<actual_name>?alt=media...'
        const encodedFileName = pathSegments.find(segment => segment.includes('%2F'));
        if (!encodedFileName) return '';
        const decodedName = decodeURIComponent(encodedFileName).split('/').pop();
        return decodedName || '';
    } catch (e) {
        console.error("Could not parse URL to get image name", url, e);
        return '';
    }
};

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const fetchProducts = async () => {
    setLoading(true);
    try {
        const productsCollection = collection(db, "products");
        const q = query(productsCollection, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
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
                    // This is a more robust way to get the ref from a URL
                    const imageRef = ref(storage, imageUrl);
                    await deleteObject(imageRef);
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

  const seedDatabase = async () => {
    setSeeding(true);
    toast({ title: 'Iniciando carga', description: `Se añadirán ${seedProducts.length} productos a la base de datos.` });
    try {
        for (const product of seedProducts) {
            // We remove the id because Firestore will generate one
            const { id, ...productData } = product; 
            await addDoc(collection(db, "products"), {
                ...productData,
                createdAt: serverTimestamp(),
            });
        }
        toast({ title: 'Carga completada', description: 'Los productos de ejemplo se han añadido correctamente.' });
        await fetchProducts();
    } catch (error) {
        console.error("Error seeding database: ", error);
        toast({ title: 'Error en la carga', description: 'No se pudieron añadir los productos de ejemplo.', variant: 'destructive' });
    } finally {
        setSeeding(false);
    }
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
                <h3 className="font-headline text-xl font-semibold">Tu tienda aún no tiene productos</h3>
                <p className="text-muted-foreground mt-2 mb-4">Puedes añadir tu primer producto o cargar datos de ejemplo para empezar.</p>
                <div className="flex justify-center gap-4">
                     <Button onClick={handleAdd}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Añadir mi primer producto
                    </Button>
                    <Button variant="secondary" onClick={seedDatabase} disabled={seeding}>
                        {seeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Seedling className="mr-2 h-4 w-4" />}
                        {seeding ? 'Cargando...' : 'Cargar productos de ejemplo'}
                    </Button>
                </div>
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

    