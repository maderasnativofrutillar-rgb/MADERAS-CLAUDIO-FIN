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
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { type Product } from '@/lib/types';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import Image from 'next/image';

const MAX_IMAGES = 5;

const productFormSchema = z.object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
    description: z.string().min(10, "La descripción debe tener al menos 10 caracteres."),
    price: z.coerce.number().min(0, "El precio no puede ser negativo."),
    images: z.array(z.instanceof(File))
        .min(1, `Debes subir al menos 1 imagen.`)
        .max(MAX_IMAGES, `No puedes subir más de ${MAX_IMAGES} imágenes.`),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
    product?: Product | null;
    onSuccess: () => void;
}

export function ProductForm({ product, onSuccess }: ProductFormProps) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const [imagePreviews, setImagePreviews] = useState<string[]>(product?.images || (product?.image ? [product.image] : []));

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            name: product?.name || "",
            description: product?.description || "",
            price: product?.price || 0,
            images: [],
        },
    });

    const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
        if (rejectedFiles.length > 0) {
            toast({ title: 'Error de archivo', description: 'Algunos archivos fueron rechazados. Asegúrate que son imágenes.', variant: 'destructive'});
        }

        const currentImages = form.getValues('images') || [];
        const newImages = acceptedFiles.slice(0, MAX_IMAGES - currentImages.length);
        const combinedImages = [...currentImages, ...newImages];
        
        form.setValue('images', combinedImages, { shouldValidate: true });

        const newPreviews = newImages.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews].slice(0, MAX_IMAGES));

    }, [form, toast]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxFiles: MAX_IMAGES,
    });
    
    const removeImage = (index: number) => {
        const currentImages = form.getValues('images');
        const updatedImages = currentImages.filter((_, i) => i !== index);
        form.setValue('images', updatedImages, { shouldValidate: true });

        const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
        setImagePreviews(updatedPreviews);
    };

    const onSubmit = async (data: ProductFormValues) => {
        setLoading(true);
        try {
            const uploadPromises = data.images.map(async (file) => {
                const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
                await uploadBytes(storageRef, file);
                return getDownloadURL(storageRef);
            });

            const imageUrls = await Promise.all(uploadPromises);

            const productData = {
                name: data.name,
                description: data.description,
                price: data.price,
                image: imageUrls[0], // First image as primary
                images: imageUrls.slice(1), // The rest for the gallery
            };
            
            if (product) {
                // Update existing product
                const productRef = doc(db, 'products', product.id);
                await updateDoc(productRef, productData);
                 toast({ title: 'Éxito', description: 'Producto actualizado correctamente.' });
            } else {
                // Add new product
                await addDoc(collection(db, "products"), {
                    ...productData,
                    createdAt: serverTimestamp(),
                });
                toast({ title: 'Éxito', description: 'Producto añadido correctamente.' });
            }
            onSuccess();
        } catch (error) {
            console.error("Error saving product: ", error);
            toast({ title: 'Error', description: 'No se pudo guardar el producto.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="name" render={({field}) => (
                        <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="price" render={({field}) => (
                        <FormItem><FormLabel>Precio</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                </div>
                <FormField control={form.control} name="description" render={({field}) => (
                    <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea {...field} rows={5} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="images" render={() => (
                    <FormItem>
                        <FormLabel>Imágenes (hasta {MAX_IMAGES})</FormLabel>
                        <FormControl>
                            <div
                                {...getRootProps()}
                                className={`relative flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-border'}`}
                            >
                                <input {...getInputProps()} />
                                <div className="text-center">
                                    <UploadCloud className="w-12 h-12 mx-auto text-muted-foreground" />
                                    {isDragActive ? (
                                        <p className="mt-2 font-semibold text-primary">Suelta las imágenes aquí...</p>
                                    ) : (
                                        <>
                                            <p className="mt-2 text-sm font-semibold">Arrastra y suelta imágenes aquí, o haz clic para seleccionar</p>
                                            <p className="text-xs text-muted-foreground">Máximo 5 imágenes. La primera será la principal.</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>

                {imagePreviews.length > 0 && (
                     <div>
                        <p className="text-sm font-medium mb-2">Imágenes seleccionadas:</p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                            {imagePreviews.map((src, index) => (
                                <div key={index} className="relative group aspect-square">
                                    <Image src={src} alt={`Preview ${index}`} fill className="object-cover rounded-md" />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => removeImage(index)}
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
                
                <Button type="submit" disabled={loading} className="w-full">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? 'Guardando...' : (product ? 'Actualizar Producto' : 'Guardar Producto')}
                </Button>
            </form>
        </Form>
    );
}
