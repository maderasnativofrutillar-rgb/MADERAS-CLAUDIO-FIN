export default function RefundPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-24">
      <div className="prose max-w-4xl mx-auto">
        <h1 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Política de Reembolso</h1>
        <p className="lead">
            Fecha de última actualización: {new Date().toLocaleDateString('es-CL')}
        </p>

        <p>Nuestra política tiene una duración de 30 días. Si han pasado 30 días desde tu compra, lamentablemente no podemos ofrecerte un reembolso o cambio.</p>

        <h2>1. Condiciones para Devoluciones</h2>
        <p>Para ser elegible para una devolución, tu artículo debe estar sin usar y en las mismas condiciones en que lo recibiste. También debe estar en el embalaje original.</p>
        <p>Para completar tu devolución, requerimos un recibo o prueba de compra.</p>

        <h2>2. Proceso de Devolución</h2>
        <p>Para devolver tu producto, debes contactarnos primero a través de nuestra página de <a href="/contacto">contacto</a>. Te proporcionaremos las instrucciones sobre cómo y dónde enviar tu paquete. Los costos de envío para devolver tu artículo corren por tu cuenta y no son reembolsables.</p>

        <h2>3. Reembolsos</h2>
        <p>Una vez que tu devolución es recibida e inspeccionada, te enviaremos un correo electrónico para notificarte que hemos recibido tu artículo devuelto. También te notificaremos la aprobación o rechazo de tu reembolso.</p>
        <p>Si eres aprobado, entonces tu reembolso será procesado y un crédito será automáticamente aplicado a tu tarjeta de crédito o método original de pago, dentro de una cierta cantidad de días.</p>

        <h2>4. Artículos en Oferta</h2>
        <p>Solo los artículos con precio regular pueden ser reembolsados. Lamentablemente, los artículos en oferta no pueden ser reembolsados.</p>

        <h2>5. Cambios</h2>
        <p>Solo reemplazamos artículos si están defectuosos o dañados. Si necesitas cambiarlo por el mismo artículo, envíanos un correo electrónico a través de nuestra página de <a href="/contacto">contacto</a>.</p>
        
        <h2>6. Contacto</h2>
        <p>Si tienes alguna pregunta sobre nuestra Política de Reembolso, no dudes en contactarnos.</p>
      </div>
    </div>
  );
}
