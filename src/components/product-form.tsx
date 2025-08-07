
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

// Schema for form validation
const productFormSchema = z.object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
    description: z.string().min(10, "La descripción debe tener al menos 10 caracteres."),
    price: z.coerce.number().min(0, "El precio no puede ser negativo."),
    // Files are optional on the schema, we'll validate them manually in onSubmit
    images: z.array(z.instanceof(File)).optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
    product?: Product | null;
    onSuccess: () => void;
}

// More reliable helper to get the storage path from a Firebase Storage URL
const getPathFromUrl = (url: string) => {
  try {
    const decodedUrl = decodeURIComponent(url);
    const match = decodedUrl.match(/\/o\/(.+?)(\?|$)/);
    if (match && match[1]) {
      return match[1];
    }
    return null;
  } catch (e) {
    return null;
  }
};

export function ProductForm({ product, onSuccess }: ProductFormProps) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    
    // Holds both existing URL strings and new blob URL strings for previews
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    
    // Keep track of existing image URLs that should be deleted on submit
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            name: product?.name || "",
            description: product?.description || "",
            price: product?.price || 0,
            images: [],
        },
    });

    // Set initial previews when editing a product
    useEffect(() => {
        if (product) {
            const existingImages = [product.image, ...(product.images || [])].filter(Boolean) as string[];
            setImagePreviews(existingImages);
        }
    }, [product]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const currentFiles = form.getValues('images') || [];
        const totalImageCount = imagePreviews.length + acceptedFiles.length;

        if (totalImageCount > MAX_IMAGES) {
            toast({ title: 'Límite de imágenes alcanzado', description: `No puedes subir más de ${MAX_IMAGES} imágenes en total.`, variant: 'destructive'});
            return;
        }

        form.setValue('images', [...currentFiles, ...acceptedFiles], { shouldValidate: true });

        const newPreviews = acceptedFiles.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews]);

    }, [form, toast, imagePreviews.length]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    });
    
    const removeImage = (index: number) => {
        const imageToRemove = imagePreviews[index];

        // If it's an existing image (http URL), add it to the deletion queue
        if (imageToRemove.startsWith('http')) {
            setImagesToDelete(prev => [...prev, imageToRemove]);
        }

        // If it's a new image (blob URL), remove it from the form's file list
        if (imageToRemove.startsWith('blob:')) {
            const blobUrlIndex = imagePreviews.filter(p => p.startsWith('blob:')).indexOf(imageToRemove);
            const currentFiles = form.getValues('images') || [];
            const updatedFiles = currentFiles.filter((_, i) => i !== blobUrlIndex);
            form.setValue('images', updatedFiles);
        }

        // Remove from the preview list
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const onSubmit = async (data: ProductFormValues) => {
        setLoading(true);

        const newFiles: File[] = data.images || [];
        const existingImageUrls = imagePreviews.filter(p => p.startsWith('http'));

        if (existingImageUrls.length + newFiles.length === 0) {
            toast({ title: 'Error', description: 'Debes tener al menos una imagen.', variant: 'destructive' });
            setLoading(false);
            return;
        }

        try {
            // 1. Delete images marked for removal
            for (const url of imagesToDelete) {
                const path = getPathFromUrl(url);
                if (path) {
                    await deleteObject(ref(storage, path));
                }
            }

            // 2. Upload new files and get their URLs
            const newImageUrls = await Promise.all(
                newFiles.map(async (file) => {
                    const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
                    const fileBuffer = await file.arrayBuffer();
                    await uploadBytes(storageRef, fileBuffer);
                    return getDownloadURL(storageRef);
                })
            );

            // 3. Combine remaining old URLs with new URLs
            const finalImageUrls = [...existingImageUrls, ...newImageUrls];

            if (finalImageUrls.length === 0) {
              toast({ title: 'Error', description: 'El producto debe tener al menos una imagen.', variant: 'destructive'});
              setLoading(false);
              return;
            }

            // 4. Prepare data for Firestore
            const productData = {
                name: data.name,
                description: data.description,
                price: data.price,
                image: finalImageUrls[0], // First image is the main one
                images: finalImageUrls.slice(1), // The rest are gallery images
            };

            // 5. Create or Update Firestore document
            if (product) {
                await updateDoc(doc(db, 'products', product.id), productData);
                toast({ title: 'Éxito', description: 'Producto actualizado correctamente.' });
            } else {
                await addDoc(collection(db, 'products'), { ...productData, createdAt: serverTimestamp() });
                toast({ title: 'Éxito', description: 'Producto añadido correctamente.' });
            }
            
            onSuccess();

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
                                <p className="mt-2 text-sm font-semibold">Arrastra y suelta imágenes o haz clic para seleccionar</p>
                                <p className="text-xs text-muted-foreground">La primera imagen será la principal. Máx {MAX_IMAGES}.</p>
                            </div>
                        </div>
                    </FormControl>
                </FormItem>

                {imagePreviews.length > 0 && (
                     <div>
                        <p className="text-sm font-medium mb-2">Imágenes actuales: ({imagePreviews.length} de {MAX_IMAGES})</p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                            {imagePreviews.map((src, index) => (
                                <div key={src} className="relative group aspect-square">
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
                    {loading ? 'Guardando...' : (product ? 'Actualizar Producto' : 'Crear Producto')}
                </Button>
            </form>
        </Form>
    );
}
