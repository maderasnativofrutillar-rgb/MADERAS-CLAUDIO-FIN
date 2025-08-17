
# Dossier del Proyecto: E-commerce "Maderas Nativo Sur"

Este documento resume el proceso de desarrollo, los desafíos encontrados y las soluciones implementadas durante la creación del sitio de e-commerce. Además, proporciona una guía de prompts para replicar un proyecto similar con una IA conversacional.

---

## 1. Prompts Clave para Replicación del Sitio

Para replicar este proyecto desde cero con una IA similar, se pueden utilizar los siguientes prompts de manera secuencial y progresiva.

### **Fase 1: Estructura y Diseño Inicial**
> "Crea una aplicación de e-commerce con Next.js, TypeScript, Tailwind CSS y ShadCN UI. El sitio venderá productos de madera artesanal y debe tener un diseño rústico pero moderno, inspirado en el sur de Chile, usando una paleta de colores tierra (marrones, naranjas, beiges). Las páginas necesarias son: Inicio, Tienda, Nosotros, Empresas y Contacto. Configura dos fuentes personalizadas: 'Lexend Deca' para titulares y 'Open Sans' para el cuerpo de texto."

### **Fase 2: Funcionalidad E-commerce Core**
> "Implementa un contexto de React para manejar un carrito de compras persistente en localStorage. El carrito debe permitir añadir, eliminar, actualizar la cantidad de productos y calcular el total. Crea los siguientes componentes de ShadCN: Card para productos, Sheet para el carrito, Button, Input, Textarea y Toast para notificaciones."

### **Fase 3: Páginas y Componentes Clave**
> "Diseña la página de Inicio con una sección 'hero' a pantalla completa que tenga una imagen de fondo y un efecto de máquina de escribir para los títulos. Debajo, añade un carrusel para mostrar productos destacados que se obtengan desde una base de datos. En la página 'Tienda', implementa filtros por categoría, una barra de búsqueda y opciones de ordenamiento por precio y fecha. La página de 'Nosotros' debe combinar texto e imagen para contar la historia de la marca."

### **Fase 4: Integración con Backend (Firebase)**
> "Configura Firebase (Firestore y Storage) en el proyecto. Crea una estructura de datos en Firestore para 'products' que incluya nombre, descripción, precio, imágenes, categorías, etc. Desarrolla un panel de administración protegido por autenticación para crear, editar y eliminar productos, incluyendo la subida de imágenes a Firebase Storage."

### **Fase 5: Flujo de Pago y Checkout**
> "Crea una página de 'Finalizar Compra'. El formulario debe solicitar datos de contacto y dirección, con validación estricta para RUT chileno, email y campos obligatorios. Implementa selectores dinámicos para Región y Comuna de Chile. Integra la pasarela de pago Flow, creando una Server Action que genere una orden de pago con la firma HMAC-SHA256 requerida y redirija al usuario."

---

## 2. Historial de Desafíos y Soluciones

### **2.1. Formulario de Contacto (Integración con Netlify)**

*   **Problema Inicial:** El formulario de contacto hecho en React no era detectado por los bots de Netlify durante el proceso de build, por lo que los envíos no llegaban al correo configurado.
*   **Intento 1 (Fallido):** Se intentó eliminar la lógica de `onSubmit` de JavaScript para que el formulario se enviara de forma nativa. Aunque esto funciona para HTML puro, en un entorno de Next.js/React, el renderizado del lado del cliente seguía impidiendo que Netlify lo detectara correctamente.
*   **Intento 2 (Checkpoint Funcional):** Se recuperó el `onSubmit` en React y se utilizó la API `fetch` para enviar los datos del formulario de forma asíncrona a Netlify. Se creó una función `encode` para formatear los datos en `application/x-www-form-urlencoded`, que es el formato que Netlify espera.
*   **Solución Final (Recomendada y Robusta):**
    1.  **Creación de un "Formulario Señuelo":** Se creó un archivo `public/forms.html` con una estructura de formulario HTML simple y oculta. Este archivo es detectado por Netlify durante la compilación, registrando el formulario `contact` en su sistema.
    2.  **Envío Asíncrono al Señuelo:** El `onSubmit` en el componente de React se modificó para que, en lugar de enviar a la raíz del sitio (`/`), enviara la solicitud `POST` directamente a `/forms.html`.
    3.  **Resultado:** Este enfoque híbrido resolvió el problema de raíz. Netlify detecta el formulario gracias al archivo HTML estático, y el envío desde React funciona a la perfección, manteniendo una experiencia de usuario fluida sin recargas de página.

### **2.2. Integración de Pasarela de Pago (Flow)**

*   **Problema:** La API de Flow requiere que todas las solicitudes de creación de pago estén firmadas con una clave secreta usando un algoritmo HMAC-SHA256. Esta operación debe realizarse en el backend para no exponer la clave secreta en el lado del cliente.
*   **Solución:**
    1.  **Next.js Server Action:** Se creó una Server Action (`createFlowOrder`) en el archivo `src/actions/flow-actions.ts`. Este código se ejecuta exclusivamente en el servidor.
    2.  **Variables de Entorno:** Se configuraron las credenciales `FLOW_API_KEY` y `FLOW_SECRET_KEY` como variables de entorno seguras en el servidor.
    3.  **Lógica de Firma:** Dentro de la Server Action, se implementó la lógica de firma requerida por Flow:
        *   Los parámetros de la solicitud (apiKey, commerceOrder, amount, etc.) se ordenan alfabéticamente por su clave.
        *   Se concatenan en una única cadena de texto.
        *   Se utiliza el módulo `crypto` de Node.js para generar el hash HMAC-SHA256 de la cadena usando la `secretKey`.
    4.  **Llamada desde el Cliente:** El formulario de `checkout` en el cliente llama a esta Server Action, pasándole los datos del pago. La Server Action devuelve la URL de pago de Flow, a la que el usuario es redirigido de forma segura.

### **2.3. Optimización de la Experiencia de Usuario (UI/UX)**

*   **Problema: Carga Lenta de la Imagen 'Hero'**: La imagen principal de la página de inicio, al ser de alta resolución, tardaba en cargar, mostrando un "destello blanco" que afectaba la percepción de velocidad del sitio.
*   **Solución:** Se implementó una técnica de carga progresiva:
    1.  **Color de Fondo Placeholder:** Se añadió un color de fondo oscuro y sólido al contenedor de la imagen en `src/app/globals.css`. Este color se carga de forma instantánea, eliminando el fondo blanco.
    2.  **Animación de Fade-in:** Una vez que la imagen real termina de cargarse, se le aplica una animación suave de `fade-in`. Esto crea una transición elegante y profesional, mejorando drásticamente la experiencia de carga percibida.

*   **Problema: Sincronización de Productos en Home:** Los productos en la página de inicio eran estáticos y no reflejaban los cambios realizados en el panel de administración.
*   **Solución:** Se modificó el componente de la página de inicio (`src/app/page.tsx`) para que realizara una consulta a la base de datos de Firestore. Ahora, obtiene los 8 productos más recientes ordenados por fecha de creación, asegurando que la vitrina principal esté siempre actualizada.

*   **Problema: Formulario de Checkout Básico:** El formulario inicial era funcional pero poco intuitivo.
*   **Solución:** Se rediseñó por completo:
    1.  Se separaron los campos de nombre y apellido.
    2.  Se implementó validación estricta para el RUT chileno (formato y dígito verificador).
    3.  Se añadió el prefijo `+56` al campo de teléfono.
    4.  Se crearon selectores desplegables para Región y Comuna, donde la lista de comunas se actualiza dinámicamente según la región seleccionada.
    5.  Se integró la lógica de envío gratis, deshabilitando el selector de zona de envío cuando el carrito supera los $49.000.
