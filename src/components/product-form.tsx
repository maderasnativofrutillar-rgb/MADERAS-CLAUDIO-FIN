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
import { UploadCloud, X, Loader2 } from 'lucide-react';
import Image from 'next/image';

const MAX_IMAGES = 5;

const productFormSchema = z.object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
    description: z.string().min(10, "La descripción debe tener al menos 10 caracteres."),
    price: z.coerce.number().min(0, "El precio no puede ser negativo."),
    images: z.array(z.instanceof(File)).optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
    product?: Product | null;
    onSuccess: () => void;
}

const getImagePathFromUrl = (url: string) => {
    try {
        const urlObj = new URL(url);
        const decodedPath = decodeURIComponent(urlObj.pathname);
        // Regex to find "products/..." and capture the part after it
        const match = decodedPath.match(/\/o\/(products%2F|products\/)([^?]+)/);
        if (match && match[2]) {
            return `products/${match[2]}`;
        }
        return null;
    } catch (e) {
        console.error("Could not parse URL to get image path", url, e);
        return null;
    }
};


export function ProductForm({ product, onSuccess }: ProductFormProps) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

    useEffect(() => {
        const existingImages = product ? [product.image, ...(product.images || [])].filter(Boolean) as string[] : [];
        setImagePreviews(existingImages);
    }, [product]);

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

        const currentFiles = form.getValues('images') || [];
        const existingPreviews = imagePreviews.filter(p => !p.startsWith('blob:'));
        
        const totalImageCount = existingPreviews.length + currentFiles.length + acceptedFiles.length;

        if (totalImageCount > MAX_IMAGES) {
             toast({ title: 'Límite de imágenes alcanzado', description: `No puedes tener más de ${MAX_IMAGES} imágenes.`, variant: 'destructive'});
             return;
        }

        const newFiles = [...currentFiles, ...acceptedFiles];
        form.setValue('images', newFiles, { shouldValidate: true });

        const newPreviews = acceptedFiles.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews]);

    }, [form, toast, imagePreviews]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
    });
    
    const removeImage = (index: number) => {
        const imageToRemove = imagePreviews[index];
        if (imageToRemove.startsWith('http')) {
            setImagesToDelete(prev => [...prev, imageToRemove]);
        } else {
            const currentFiles = form.getValues('images') || [];
            const fileIndexToRemove = imagePreviews.slice(0, index).filter(p => p.startsWith('blob:')).length;
            const updatedFiles = currentFiles.filter((_, i) => i !== fileIndexToRemove);
            form.setValue('images', updatedFiles, { shouldValidate: true });
        }
        
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const onSubmit = async (data: ProductFormValues) => {
        setLoading(true);

        const newFiles = data.images || [];
        const existingImageUrls = imagePreviews.filter(p => p.startsWith('http'));

        if (!product && newFiles.length === 0) {
            toast({ title: 'Error de validación', description: 'Debes subir al menos una imagen para crear un producto.', variant: 'destructive' });
            setLoading(false);
            return;
        }
        if (product && existingImageUrls.length === 0 && newFiles.length === 0) {
            toast({ title: 'Error de validación', description: 'Un producto debe tener al menos una imagen.', variant: 'destructive' });
            setLoading(false);
            return;
        }

        try {
            // Step 1: Upload new images and get their URLs
            const newImageUrls = await Promise.all(
                newFiles.map(async (file) => {
                    const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
                    await uploadBytes(storageRef, file);
                    return getDownloadURL(storageRef);
                })
            );

            // Step 2: Combine old and new image URLs
            const finalImageUrls = [...existingImageUrls, ...newImageUrls];

            // Step 3: Prepare product data
            const productData = {
                name: data.name,
                description: data.description,
                price: data.price,
                image: finalImageUrls[0],
                images: finalImageUrls.slice(1),
            };
            
            // Step 4: Create or update Firestore document
            if (product) {
                const productRef = doc(db, 'products', product.id);
                await updateDoc(productRef, productData);
                toast({ title: 'Éxito', description: 'Producto actualizado correctamente.' });
            } else {
                await addDoc(collection(db, "products"), {
                    ...productData,
                    createdAt: serverTimestamp(),
                });
                toast({ title: 'Éxito', description: 'Producto añadido correctamente.' });
            }
            
            // Step 5: Delete images that were marked for removal (only after successful save)
            await Promise.all(
                imagesToDelete.map(async (url) => {
                    const imagePath = getImagePathFromUrl(url);
                    if (imagePath) {
                        try {
                            const storageRef = ref(storage, imagePath);
                            await deleteObject(storageRef);
                        } catch (error) {
                            console.error(`Failed to delete image ${imagePath}:`, error);
                        }
                    }
                })
            );
            
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
                        <p className="text-sm font-medium mb-2">Imágenes seleccionadas: ({imagePreviews.length} de {MAX_IMAGES})</p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                            {imagePreviews.map((src, index) => (
                                <div key={index} className="relative group aspect-square">
                                    <Image src={src} alt={`Preview ${index}`} fill className="object-cover rounded-md" unoptimized/>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
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
