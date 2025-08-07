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
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useRouter } from 'next/navigation';

const MAX_IMAGES = 5;

const productFormSchema = z.object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
    description: z.string().min(10, "La descripción debe tener al menos 10 caracteres."),
    price: z.coerce.number().min(0, "El precio no puede ser negativo."),
    offerPercentage: z.coerce.number().min(0, "El descuento no puede ser negativo.").max(100, "El descuento no puede ser mayor a 100%.").optional(),
    wholesaleEnabled: z.boolean().default(false),
    wholesaleMinQuantity: z.coerce.number().optional(),
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
            wholesaleEnabled: product?.wholesaleEnabled || false,
            wholesaleMinQuantity: product?.wholesaleMinQuantity || 3,
        },
    });
    
    const wholesaleEnabled = form.watch('wholesaleEnabled');

    useEffect(() => {
        if (product) {
            const existingImages = [product.image, ...(product.images || [])].filter(Boolean) as string[];
            setImagePreviews(existingImages);
        }
    }, [product]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const totalImageCount = imagePreviews.length + newImageFiles.length + acceptedFiles.length;

        if (totalImageCount > MAX_IMAGES) {
            toast({ title: 'Límite de imágenes alcanzado', description: `No puedes subir más de ${MAX_IMAGES} imágenes en total.`, variant: 'destructive'});
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
        
        setImagePreviews(prev => prev.filter((_, i) => i !== index));

        if (!src.startsWith('http')) {
            const fileIndexToRemove = imagePreviews.filter(p => p.startsWith('blob:')).indexOf(src);
             if (fileIndexToRemove > -1) {
                setNewImageFiles(prev => prev.filter((_, i) => i !== fileIndexToRemove));
            }
        }
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
                        await deleteObject(ref(storage, imagePath));
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

            const productData: Partial<Product> = {
                name: data.name,
                description: data.description,
                price: data.price,
                image: finalImageUrls[0],
                images: finalImageUrls.slice(1),
                offerPercentage: data.offerPercentage || 0,
                wholesaleEnabled: data.wholesaleEnabled || false,
                wholesaleMinQuantity: data.wholesaleMinQuantity || 3,
            };

            if (product) {
                await updateDoc(doc(db, 'products', product.id), productData);
                toast({ title: 'Éxito', description: 'Producto actualizado correctamente.' });
            } else {
                await addDoc(collection(db, 'products'), { ...productData, createdAt: serverTimestamp() });
                toast({ title: 'Éxito', description: 'Producto añadido correctamente.' });
            }
            
            router.push('/admin/dashboard');

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
                <FormField control={form.control} name="name" render={({field}) => (
                    <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={form.control} name="description" render={({field}) => (
                    <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea {...field} rows={5} /></FormControl><FormMessage /></FormItem>
                )}/>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="price" render={({field}) => (
                        <FormItem><FormLabel>Precio</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name="offerPercentage" render={({field}) => (
                        <FormItem>
                            <FormLabel>Oferta (% de descuento)</FormLabel>
                            <FormControl><Input type="number" placeholder="Ej: 20" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                </div>
                
                <div className="space-y-4 rounded-lg border p-4">
                    <FormField
                        control={form.control}
                        name="wholesaleEnabled"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between">
                            <div className="space-y-0.5">
                                <FormLabel>Habilitar venta por mayor</FormLabel>
                            </div>
                            <FormControl>
                                <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            </FormItem>
                        )}
                    />
                    {wholesaleEnabled && (
                        <FormField
                            control={form.control}
                            name="wholesaleMinQuantity"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Cantidad mínima por mayor</FormLabel>
                                <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value || 3)}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona una cantidad" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    <SelectItem value="3">Desde 3 unidades</SelectItem>
                                    <SelectItem value="5">Desde 5 unidades</SelectItem>
                                    <SelectItem value="9">Desde 9 unidades</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                </div>

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
