
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Image as ImageIcon, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ProductsTab } from '@/components/admin/products-tab';
import { SiteImagesTab } from '@/components/admin/site-images-tab';
import { UsersTab } from '@/components/admin/users-tab';


export default function DashboardPage() {
  const router = useRouter();

  const handleAdd = () => {
    router.push('/admin/products/form');
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <Tabs defaultValue="products">
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="products">Productos</TabsTrigger>
              <TabsTrigger value="images">
                <ImageIcon className="h-4 w-4 mr-2"/>
                Imágenes del Sitio
              </TabsTrigger>
               <TabsTrigger value="users">
                <Users className="h-4 w-4 mr-2"/>
                Usuarios
              </TabsTrigger>
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
            <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Gestión de Usuarios</CardTitle>
                <CardDescription>Añade, edita roles o elimina usuarios administradores desde la consola de Firebase.</CardDescription>
              </CardHeader>
              <CardContent>
                <UsersTab />
              </CardContent>
            </Card>
          </TabsContent>
      </Tabs>
    </div>
  );
}
