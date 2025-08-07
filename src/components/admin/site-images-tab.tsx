
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SiteImages } from '@/lib/types';
import { Loader2, UploadCloud, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';

const siteImagesSchema = z.object({
  logo: z.any(),
  favicon: z.any(),
  hero: z.any(),
  essence: z.any(),
  about: z.any(),
  portfolio: z.array(z.any()).optional(),
});

type SiteImagesFormValues = z.infer<typeof siteImagesSchema>;

const ImageUploadField = ({ name, label, setValue, currentImageUrl }: { name: keyof SiteImagesFormValues, label: string, setValue: Function, currentImageUrl: string | null }) => {
    const [preview, setPreview] = useState<string | null>(currentImageUrl);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setValue(name, file, { shouldValidate: true });
            setPreview(URL.createObjectURL(file));
        }
    }, [setValue, name]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        multiple: false,
    });

    return (
        <FormItem>
            <FormLabel>{label}</FormLabel>
            <div className="grid grid-cols-2 gap-4 items-center">
                 <FormControl>
                    <div {...getRootProps()} className={`relative flex flex-col items-center justify-center w-full p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-border'}`}>
                        <input {...getInputProps()} />
                        <UploadCloud className="w-8 h-8 mx-auto text-muted-foreground" />
                        <p className="mt-2 text-sm text-center">Arrastra o haz clic para cambiar</p>
                    </div>
                </FormControl>
                {preview && (
                    <div className="relative aspect-video w-full">
                        <Image src={preview} alt={`${label} preview`} fill className="object-contain rounded-md" />
                    </div>
                )}
            </div>
            <FormMessage />
        </FormItem>
    );
};


export function SiteImagesTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialData, setInitialData] = useState<SiteImages | null>(null);
  const { toast } = useToast();

  const form = useForm<SiteImagesFormValues>({
    resolver: zodResolver(siteImagesSchema),
  });

  const { setValue, control } = form;

  const fetchSiteImages = useCallback(async () => {
    setLoading(true);
    try {
      const docRef = doc(db, "siteConfig", "images");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as SiteImages;
        setInitialData(data);
        form.reset({
          logo: data.logo,
          favicon: data.favicon,
          hero: data.hero,
          essence: data.essence,
          about: data.about,
          portfolio: data.portfolio,
        });
      }
    } catch (error) {
      console.error("Error fetching site images:", error);
      toast({ title: "Error", description: "No se pudieron cargar las imágenes del sitio.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [form, toast]);

  useEffect(() => {
    fetchSiteImages();
  }, [fetchSiteImages]);

  const uploadImage = async (file: File | string, name: string): Promise<string> => {
      if (typeof file === 'string') return file; // It's already a URL
      if (!file) return '';

      const storageRef = ref(storage, `site/${name}_${Date.now()}_${file.name}`);
      const fileBuffer = await file.arrayBuffer();
      await uploadBytes(storageRef, fileBuffer);
      return getDownloadURL(storageRef);
  };
  
  const onSubmit = async (data: SiteImagesFormValues) => {
    setSaving(true);
    try {
        const logoUrl = data.logo ? await uploadImage(data.logo, 'logo') : initialData?.logo;
        const faviconUrl = data.favicon ? await uploadImage(data.favicon, 'favicon') : initialData?.favicon;
        const heroUrl = data.hero ? await uploadImage(data.hero, 'hero') : initialData?.hero;
        const essenceUrl = data.essence ? await uploadImage(data.essence, 'essence') : initialData?.essence;
        const aboutUrl = data.about ? await uploadImage(data.about, 'about') : initialData?.about;

        // For portfolio, we need to handle a mix of existing URLs and new files
        let portfolioUrls: string[] = [];
        if(data.portfolio && data.portfolio.length > 0) {
            portfolioUrls = await Promise.all(data.portfolio.map((img, i) => uploadImage(img, `portfolio_${i}`)));
        } else {
            portfolioUrls = initialData?.portfolio || [];
        }

        const siteData: SiteImages = {
            logo: logoUrl || '',
            favicon: faviconUrl || '',
            hero: heroUrl || '',
            essence: essenceUrl || '',
            about: aboutUrl || '',
            portfolio: portfolioUrls,
        };

        await setDoc(doc(db, "siteConfig", "images"), siteData);
        toast({ title: "Éxito", description: "Las imágenes del sitio han sido actualizadas." });
        fetchSiteImages(); // Refresh data
        window.location.reload();
    } catch (error) {
        console.error("Error saving site images:", error);
        toast({ title: "Error", description: "No se pudieron guardar los cambios.", variant: "destructive" });
    } finally {
        setSaving(false);
    }
  };

  if (loading) {
      return (
          <div className="space-y-8">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-40 w-full" />
          </div>
      );
  }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <ImageUploadField name="logo" label="Logo del Sitio" setValue={setValue} currentImageUrl={initialData?.logo || null} />
            <ImageUploadField name="favicon" label="Favicon del Sitio" setValue={setValue} currentImageUrl={initialData?.favicon || null} />
            <ImageUploadField name="hero" label="Imagen Hero (Página de Inicio)" setValue={setValue} currentImageUrl={initialData?.hero || null} />
            <ImageUploadField name="essence" label="Imagen 'Nuestra Esencia' (Página de Inicio)" setValue={setValue} currentImageUrl={initialData?.essence || null} />
            <ImageUploadField name="about" label="Imagen 'Nosotros'" setValue={setValue} currentImageUrl={initialData?.about || null} />
            
            {/* Portfolio Management */}
            <FormField
                control={control}
                name="portfolio"
                render={({ field }) => {
                    const previews = field.value?.map(val => typeof val === 'string' ? val : URL.createObjectURL(val)) || [];

                    const onPortfolioDrop = (acceptedFiles: File[]) => {
                        const currentFiles = field.value || [];
                        field.onChange([...currentFiles, ...acceptedFiles]);
                    };

                    const removePortfolioImage = (index: number) => {
                        const currentFiles = [...(field.value || [])];
                        currentFiles.splice(index, 1);
                        field.onChange(currentFiles);
                    };

                    const { getRootProps, getInputProps, isDragActive } = useDropzone({
                        onDrop: onPortfolioDrop,
                        accept: { 'image/*': [] },
                    });

                    return (
                        <FormItem>
                            <FormLabel>Galería del Portafolio (Empresas)</FormLabel>
                            <div {...getRootProps()} className={`relative flex flex-col items-center justify-center w-full p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-border'}`}>
                                <input {...getInputProps()} />
                                <UploadCloud className="w-8 h-8 mx-auto text-muted-foreground" />
                                <p className="mt-2 text-sm text-center">Arrastra imágenes aquí o haz clic para seleccionar</p>
                            </div>
                            {previews.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
                                    {previews.map((src, index) => (
                                        <div key={src} className="relative group aspect-video">
                                            <Image src={src} alt={`Portfolio preview ${index}`} fill className="object-cover rounded-md" />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                onClick={() => removePortfolioImage(index)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </FormItem>
                    );
                }}
            />

            <Button type="submit" disabled={saving} className="w-full">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {saving ? 'Guardando Cambios...' : 'Guardar Cambios'}
            </Button>
        </form>
    </Form>
  );
}
