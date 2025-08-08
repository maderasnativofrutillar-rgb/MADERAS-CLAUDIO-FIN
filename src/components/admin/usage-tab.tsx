
'use client';

import { Button } from '@/components/ui/button';
import { firebaseConfig } from '@/lib/firebase';
import { ExternalLink, TrendingUp } from 'lucide-react';


const FIREBASE_CONSOLE_URL = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/usage`;

export function UsageTab() {
  return (
    <div className="text-center py-8">
      <div className="mx-auto bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full h-16 w-16 flex items-center justify-center mb-4">
          <TrendingUp className="h-8 w-8" />
      </div>
      <h3 className="font-headline text-xl font-bold">Monitor de Uso de Firebase</h3>
      <p className="text-muted-foreground mt-2 mb-6 max-w-lg mx-auto">
        Para obtener una vista detallada y segura de las métricas de tu proyecto (lecturas/escrituras de base de datos, almacenamiento, etc.), utiliza la consola oficial de Firebase.
      </p>
      <Button asChild>
        <a href={FIREBASE_CONSOLE_URL} target="_blank" rel="noopener noreferrer">
          Ver Métricas en Firebase
          <ExternalLink className="ml-2 h-4 w-4" />
        </a>
      </Button>
    </div>
  );
}
