'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { type Product } from '@/lib/types';
import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, Loader2, DollarSign, Percent, Tag, ChevronsRight } from 'lucide-react';
import Image from 'next/image';
import { Checkbox } from './ui/checkbox';
import { categories } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const MAX_IMAGES = 5;

const productFormSchema = z.object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
    description: z.string().min(10, "La descripción debe tener al menos 10 caracteres."),
    price: z.coerce.number().min(0, "El precio no puede ser negativo."),
    offerPercentage: z.coerce.number().min(0, "El descuento no puede ser negativo.").max(100, "El descuento no puede ser mayor a 100%.").optional().default(0),
    wholesalePrice3: z.coerce.number().min(0).optional().default(0),
    wholesalePrice6: z.coerce.number().min(0).optional().default(0),
    wholesalePrice9: z.coerce.number().min(0).optional().default(0),
    categories: z.array(z.string()).optional().default([]),
    customTag: z.string().max(10, "La etiqueta no puede tener más de 10 caracteres.").optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
    product?: Product | null;
}

const getPathFromUrl = (url: string) => {
    try {
        const decodedUrl = decodeURIComponent(url);
        const match = decodedUrl.match(/\/o\/(.+?)(\?|$)/);
        if (match && match[1]) {
            return match[1];
        }
        return null;
    } catch (e) {
        console.error("Error decoding URL path", e);
        return null;
    }
};

export function ProductForm({ product }: ProductFormProps) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
    const [newImageFiles, setNewImageFiles] = useState<File[]>([]);

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            name: product?.name || "",
            description: product?.description || "",
            price: product?.price || 0,
            offerPercentage: product?.offerPercentage || 0,
            wholesalePrice3: product?.wholesalePrice3 || 0,
            wholesalePrice6: product?.wholesalePrice6 || 0,
            wholesalePrice9: product?.wholesalePrice9 || 0,
            categories: product?.categories || [],
            customTag: product?.customTag || "",
        },
    });

    useEffect(() => {
        if (product) {
            const existingImages = [product.image, ...(product.images || [])].filter(Boolean) as string[];
            setImagePreviews(existingImages);
        }
    }, [product]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const totalImageCount = imagePreviews.length + newImageFiles.length + acceptedFiles.length;

        if (totalImageCount > MAX_IMAGES) {
            toast({ title: 'Límite de imágenes alcanzado', description: `No puedes subir más de ${MAX_IMAGES} imágenes en total.`, variant: 'destructive' });
            return;
        }

        setNewImageFiles(prev => [...prev, ...acceptedFiles]);

        const newPreviews = acceptedFiles.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews]);
    }, [toast, imagePreviews.length, newImageFiles.length]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    });

    const removeImage = (index: number, src: string) => {
        if (src.startsWith('http')) {
            setImagesToDelete(prev => [...prev, src]);
        }
        
        const fileIndexToRemove = imagePreviews.slice(0, index).filter(p => !p.startsWith('http')).length;
        const localFileIndexToRemove = index - (imagePreviews.length - newImageFiles.length);

        if (src.startsWith('blob:')) {
            setNewImageFiles(prev => prev.filter((_, i) => i !== localFileIndexToRemove));
        }

        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const onSubmit = async (data: ProductFormValues) => {
        setLoading(true);

        try {
            const remainingImageUrls = imagePreviews.filter(p => p.startsWith('http'));
            if (remainingImageUrls.length + newImageFiles.length === 0) {
                toast({ title: 'Error', description: 'Debes subir al menos una imagen.', variant: 'destructive' });
                setLoading(false);
                return;
            }

            for (const urlToDelete of imagesToDelete) {
                const imagePath = getPathFromUrl(urlToDelete);
                if (imagePath) {
                    try {
                        const imageRef = ref(storage, imagePath);
                        await deleteObject(imageRef);
                    } catch (error) {
                        console.warn(`No se pudo eliminar la imagen ${imagePath}:`, error);
                    }
                }
            }

            const uploadedUrls = await Promise.all(
                newImageFiles.map(async (file) => {
                    const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
                    const fileBuffer = await file.arrayBuffer();
                    await uploadBytes(storageRef, fileBuffer);
                    return getDownloadURL(storageRef);
                })
            );

            const finalImageUrls = [...remainingImageUrls.filter(url => !imagesToDelete.includes(url)), ...uploadedUrls];
            if (finalImageUrls.length === 0) {
                toast({ title: 'Error', description: 'El producto debe tener al menos una imagen.', variant: 'destructive' });
                setLoading(false);
                return;
            }

            const productData: Omit<Product, 'id' | 'createdAt'> = {
                name: data.name,
                description: data.description,
                price: data.price,
                image: finalImageUrls[0],
                images: finalImageUrls.slice(1),
                offerPercentage: data.offerPercentage || 0,
                wholesalePrice3: data.wholesalePrice3 || 0,
                wholesalePrice6: data.wholesalePrice6 || 0,
                wholesalePrice9: data.wholesalePrice9 || 0,
                categories: data.categories || [],
                customTag: data.customTag || "",
            };

            if (product) {
                await updateDoc(doc(db, 'products', product.id), { ...productData });
                toast({ title: 'Éxito', description: 'Producto actualizado correctamente.' });
            } else {
                await addDoc(collection(db, 'products'), { ...productData, createdAt: serverTimestamp() });
                toast({ title: 'Éxito', description: 'Producto añadido correctamente.' });
            }

            router.push('/admin/dashboard');
            router.refresh();

        } catch (error) {
            console.error("Error saving product: ", error);
            const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
            toast({ title: 'Error al Guardar', description: errorMessage, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardHeader><CardTitle>Información Básica</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea {...field} rows={5} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign size={20}/> Precios y Ofertas</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <FormField control={form.control} name="price" render={({ field }) => (
                                <FormItem><FormLabel>Precio Base (CLP)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="offerPercentage" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Oferta (% de descuento)</FormLabel>
                                    <FormControl><Input type="number" placeholder="Ej: 20" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><ChevronsRight size={20}/> Precios por Mayor (Opcional)</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         <FormField control={form.control} name="wholesalePrice3" render={({ field }) => (
                            <FormItem><FormLabel>Precio por 3+ unidades</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="wholesalePrice6" render={({ field }) => (
                            <FormItem><FormLabel>Precio por 6+ unidades</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="wholesalePrice9" render={({ field }) => (
                            <FormItem><FormLabel>Precio por 9+ unidades</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </CardContent>
                </Card>
                
                 <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Tag size={20}/> Organización</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <FormField
                            control={form.control}
                            name="categories"
                            render={() => (
                                <FormItem>
                                    <FormLabel>Categorías</FormLabel>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {categories.map((item) => (
                                        <FormField
                                        key={item}
                                        control={form.control}
                                        name="categories"
                                        render={({ field }) => {
                                            return (
                                            <FormItem key={item} className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(item)}
                                                    onCheckedChange={(checked) => {
                                                    return checked
                                                        ? field.onChange([...field.value, item])
                                                        : field.onChange(
                                                            field.value?.filter(
                                                            (value) => value !== item
                                                            )
                                                        )
                                                    }}
                                                />
                                                </FormControl>
                                                <FormLabel className="font-normal">{item}</FormLabel>
                                            </FormItem>
                                            )
                                        }}
                                        />
                                    ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField control={form.control} name="customTag" render={({ field }) => (
                            <FormItem><FormLabel>Etiqueta Personalizada (Opcional)</FormLabel><FormControl><Input {...field} maxLength={10} placeholder="Ej: Nuevo" /></FormControl><FormMessage /></FormItem>
                        )} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Imágenes (hasta {MAX_IMAGES})</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <FormControl>
                            <div
                                {...getRootProps()}
                                className={`relative flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-border'}`}
                            >
                                <input {...getInputProps()} />
                                <div className="text-center">
                                    <UploadCloud className="w-12 h-12 mx-auto text-muted-foreground" />
                                    <p className="mt-2 text-sm font-semibold">Arrastra y suelta imágenes o haz clic para seleccionar</p>
                                    <p className="text-xs text-muted-foreground">La primera imagen será la principal. Máx {MAX_IMAGES}.</p>
                                </div>
                            </div>
                        </FormControl>

                        {imagePreviews.length > 0 && (
                            <div>
                                <p className="text-sm font-medium mb-2">Imágenes actuales: ({imagePreviews.length} de {MAX_IMAGES})</p>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                    {imagePreviews.map((src, index) => (
                                        <div key={src} className="relative group aspect-square">
                                            <Image src={src} alt={`Preview ${index}`} fill className="object-cover rounded-md" unoptimized />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                onClick={() => removeImage(index, src)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                            {index === 0 && (
                                                <div className="absolute bottom-0 w-full bg-black/50 text-white text-xs text-center py-0.5 rounded-b-md">Principal</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="flex gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={loading} className="flex-grow">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {loading ? 'Guardando...' : (product ? 'Actualizar Producto' : 'Crear Producto')}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
