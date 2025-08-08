
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { clientConfig } from '@/config/client';


const FIREBASE_CONSOLE_URL = `https://console.firebase.google.com/project/${clientConfig.projectId}/authentication/users`;

export function UsersTab() {
  return (
    <div className="text-center py-8">
      <div className="mx-auto bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full h-16 w-16 flex items-center justify-center mb-4">
          <ShieldCheck className="h-8 w-8" />
      </div>
      <h3 className="font-headline text-xl font-bold">Gestión Segura de Usuarios</h3>
      <p className="text-muted-foreground mt-2 mb-6 max-w-lg mx-auto">
        Por razones de seguridad, la creación, eliminación y gestión de roles de usuarios se debe realizar directamente en la Consola de Firebase. Esto protege tu aplicación de acciones no autorizadas.
      </p>
      <Button asChild>
        <a href={FIREBASE_CONSOLE_URL} target="_blank" rel="noopener noreferrer">
          Gestionar Usuarios en Firebase
          <ExternalLink className="ml-2 h-4 w-4" />
        </a>
      </Button>
    </div>
  );
}
