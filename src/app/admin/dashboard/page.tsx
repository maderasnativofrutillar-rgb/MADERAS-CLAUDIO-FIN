
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ProductsTab } from '@/components/admin/products-tab';
import { SiteImagesTab } from '@/components/admin/site-images-tab';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { doc, getDoc } from 'firebase/firestore';


async function getUserRole(user: User): Promise<string | null> {
    if (!user) return null;
    try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
            return userDocSnap.data().role || null;
        }
        return null;
    } catch (error) {
        console.error("Error getting user role from Firestore:", error);
        return null;
    }
}


export default function DashboardPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
            const role = await getUserRole(user);
            setUserRole(role);
        } else {
            // Not logged in, redirect or handle as needed
            router.push('/login');
        }
        setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);


  const handleAdd = () => {
    router.push('/admin/products/form');
  };

  if (loading) {
      return (
          <div className="p-4 sm:p-6 md:p-8 space-y-6">
            <div className='flex justify-between'>
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-10 w-36" />
            </div>
            <Skeleton className="h-96 w-full" />
        </div>
      )
  }

  const isAdmin = userRole === 'admin';

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <Tabs defaultValue="products">
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="products">Productos</TabsTrigger>
              {isAdmin && (
                <>
                    <TabsTrigger value="images">
                        <ImageIcon className="h-4 w-4 mr-2"/>
                        Imágenes del Sitio
                    </TabsTrigger>
                </>
              )}
            </TabsList>
             <Button size="sm" className="gap-1" onClick={handleAdd}>
                <PlusCircle className="h-4 w-4" />
                Añadir Producto
            </Button>
          </div>

          <TabsContent value="products">
             <Card>
              <CardHeader>
                <CardTitle className="font-headline">Gestión de Productos</CardTitle>
                <CardDescription>Añade, edita o elimina productos de tu tienda.</CardDescription>
              </CardHeader>
              <CardContent>
                <ProductsTab />
              </CardContent>
            </Card>
          </TabsContent>
          
          {isAdmin && (
            <>
                <TabsContent value="images">
                    <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Gestión de Imágenes del Sitio</CardTitle>
                        <CardDescription>Actualiza las imágenes principales que se muestran en tu página de inicio, "Nosotros" y "Empresas".</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SiteImagesTab />
                    </CardContent>
                    </Card>
                </TabsContent>
            </>
          )}
      </Tabs>
    </div>
  );
}
