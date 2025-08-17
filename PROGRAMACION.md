
# Guía de Componentes y Funcionalidades Clave

Este documento sirve como una guía técnica para entender cómo se implementaron algunas de las funcionalidades y componentes más importantes de este proyecto. Está pensado para estudiantes o desarrolladores que quieran entender el "cómo" detrás de la interfaz.

---

## 1. Botón Flotante de WhatsApp

Esta funcionalidad crea un botón de chat fijo en la esquina inferior derecha, que se expande al pasar el mouse sobre él.

**Ubicación del Código:** `src/components/footer.tsx`

**Explicación:**
*   Se utiliza un componente `Link` de Next.js que apunta a la URL de la API de WhatsApp (`https://wa.me/NUMERO`).
*   El posicionamiento se logra con clases de Tailwind: `fixed bottom-6 right-6`.
*   La animación de expansión se maneja con el estado `group` y `group-hover` de Tailwind. El contenedor principal tiene la clase `group`. El texto `<span>` interior está oculto por defecto (`max-w-0`) y se expande (`group-hover:max-w-xs`) cuando el cursor entra en el `group`. Las transiciones (`transition-all duration-300`) suavizan el efecto.

**Código de Ejemplo:**
```jsx
<Link
  href="https://wa.me/56912345678"
  target="_blank"
  className="fixed bottom-6 right-6 group"
  aria-label="Contáctanos por WhatsApp"
>
  <div className="flex items-center justify-center bg-green-500 text-white rounded-full shadow-lg transition-all duration-300 ease-in-out w-14 h-14 hover:w-60">
    <Phone size={24} className="flex-shrink-0" />
    <span className="overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out max-w-0 font-bold group-hover:max-w-xs group-hover:ml-3">
      Chatea con Nosotros
    </span>
  </div>
</Link>
```

---

## 2. Barra de Anuncios con Efecto Marquee

Es la franja superior que muestra un mensaje en movimiento continuo, como "ENVÍO GRATIS...".

**Ubicación del Código:** `src/components/announcement-bar.tsx` y `src/app/globals.css`

**Explicación:**
*   **Estructura HTML:** Se duplica el contenido del mensaje dentro de un contenedor.
*   **Animación CSS:** Se define una animación de `keyframes` llamada `marquee` en `globals.css`. Esta animación simplemente traslada el contenido horizontalmente (`transform: translateX(-100%)`).
*   **Aplicación:** La clase `.marquee` se aplica a los contenedores del texto. Al duplicar el contenido, se crea la ilusión de un bucle infinito. La animación se pausa con `hover` para mejorar la usabilidad.

**Código de Ejemplo (CSS en `globals.css`):**
```css
@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-100%); }
}

.marquee {
  animation: marquee 20s linear infinite;
}

.marquee-container:hover .marquee {
  animation-play-state: paused;
}
```

---

## 3. Carrito de Compras (Sheet y Context)

El carrito utiliza un estado global gestionado por `React Context` y se muestra en un panel lateral (Sheet).

**Ubicación del Código:**
*   `src/context/cart-context.tsx`: Lógica del carrito.
*   `src/components/cart-sheet.tsx`: Componente visual del panel.

**Explicación:**
1.  **CartProvider (`cart-context.tsx`):**
    *   Usa `useState` para almacenar los `cartItems`.
    *   Usa `useEffect` para guardar y cargar el carrito desde `localStorage`, haciéndolo persistente entre sesiones.
    *   Expone funciones para manipular el estado: `addToCart`, `removeFromCart`, `updateQuantity`, `clearCart`.
    *   Calcula y expone valores derivados como `cartCount` (total de ítems) y `cartTotal` (suma de precios).
2.  **CartSheet (`cart-sheet.tsx`):**
    *   Es un componente cliente (`'use client'`).
    *   Importa el hook `useCart()` para acceder al estado y las funciones del contexto.
    *   Utiliza el componente `<Sheet>` de ShadCN para crear el panel lateral.
    *   Mapea los `cartItems` para renderizarlos y conecta los botones de la UI a las funciones del contexto (ej: `onClick={() => removeFromCart(item.id)}`).

---

## 4. Efecto de Botón con Cambio de Contenido al Pasar el Mouse

Botón que muestra "Agregar" y, al pasar el cursor, cambia para mostrar un icono de carrito.

**Ubicación del Código:** `src/components/product-card.tsx`

**Explicación:**
*   Se utiliza un `Button` de ShadCN con `position: relative` y `overflow: hidden`.
*   Dentro del botón, se colocan dos `<span>`, ambos con `position: absolute`.
*   El primer `<span>` (con el texto) está visible por defecto.
*   El segundo `<span>` (con el icono) está posicionado fuera de la vista (`translate-y-full`).
*   Al hacer `hover` en el botón (`group-hover/button`), se aplican transformaciones a los `<span>`:
    *   El primero se desliza hacia arriba y afuera (`-translate-y-full`).
    *   El segundo se desliza a su posición original (`translate-y-0`).
*   Se añade `transition-transform` para que el movimiento sea suave.

**Código de Ejemplo:**
```jsx
<Button className="group/button relative w-28 h-10 overflow-hidden">
    <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 group-hover/button:-translate-y-full">
        Agregar
    </span>
    <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 translate-y-full group-hover/button:translate-y-0">
        <ShoppingCart className="h-5 w-5" />
    </span>
</Button>
```

---

## 5. Acordeón para Descripción de Producto

Componente desplegable utilizado en la página de detalles del producto para mostrar la descripción y la información de envío.

**Ubicación del Código:** `src/app/producto/[id]/page.tsx`

**Explicación:**
*   Se utilizan los componentes `Accordion`, `AccordionItem`, `AccordionTrigger`, y `AccordionContent` de ShadCN.
*   `<Accordion type="single" collapsible>` define que solo un ítem puede estar abierto a la vez y que se puede cerrar.
*   `<AccordionItem value="description">` define una sección del acordeón.
*   `<AccordionTrigger>` es el encabezado en el que el usuario hace clic para desplegar el contenido.
*   `<AccordionContent>` es el contenedor del contenido que se muestra u oculta.

**Código de Ejemplo:**
```jsx
<Accordion type="single" collapsible className="w-full">
  <AccordionItem value="description">
    <AccordionTrigger>Descripción</AccordionTrigger>
    <AccordionContent>
      <p>Aquí va la descripción detallada del producto.</p>
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="shipping">
    <AccordionTrigger>Información de Envío</AccordionTrigger>
    <AccordionContent>
      <p>Aquí va la información sobre los tiempos y costos de envío.</p>
    </AccordionContent>
  </AccordionItem>
</Accordion>
```
