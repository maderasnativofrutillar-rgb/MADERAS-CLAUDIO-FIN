export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-24">
      <div className="prose max-w-4xl mx-auto">
        <h1 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Política de Privacidad</h1>
        <p className="lead">
            Fecha de última actualización: {new Date().toLocaleDateString('es-CL')}
        </p>

        <p>En Madera Nativo Sur, valoramos y respetamos tu privacidad. Esta Política de Privacidad describe cómo recopilamos, usamos y protegemos tu información personal cuando visitas nuestro sitio web y utilizas nuestros servicios.</p>

        <h2>1. Información que Recopilamos</h2>
        <p>Podemos recopilar la siguiente información:</p>
        <ul>
            <li><strong>Información personal:</strong> Nombre, dirección de correo electrónico, dirección de envío, número de teléfono, etc., que nos proporcionas voluntariamente al realizar una compra o contactarnos.</li>
            <li><strong>Información de pago:</strong> Los datos de tu tarjeta de crédito/débito son procesados por pasarelas de pago seguras. No almacenamos esta información en nuestros servidores.</li>
            <li><strong>Información de navegación:</strong> Cookies, dirección IP, tipo de navegador y sistema operativo para mejorar tu experiencia en nuestro sitio.</li>
        </ul>

        <h2>2. Uso de la Información</h2>
        <p>Utilizamos la información recopilada para:</p>
        <ul>
            <li>Procesar y gestionar tus pedidos.</li>
            <li>Mejorar nuestro sitio web y servicios.</li>
            <li>Comunicarnos contigo sobre tu pedido o consultas.</li>
            <li>Enviar información promocional, si has optado por recibirla.</li>
        </ul>

        <h2>3. Cómo Compartimos tu Información</h2>
        <p>No vendemos, intercambiamos ni transferimos de ningún otro modo a terceros tu información personal identificable. Esto no incluye a terceros de confianza que nos asisten en la operación de nuestro sitio web o en la conducción de nuestro negocio, siempre que esas partes se comprometan a mantener esta información confidencial.</p>

        <h2>4. Seguridad de los Datos</h2>
        <p>Implementamos una variedad de medidas de seguridad para mantener la seguridad de tu información personal. Utilizamos encriptación para proteger la información sensible transmitida en línea.</p>

        <h2>5. Tus Derechos</h2>
        <p>Tienes derecho a acceder, corregir o eliminar tu información personal en cualquier momento. También puedes optar por no recibir nuestras comunicaciones de marketing.</p>

        <h2>6. Cambios en Nuestra Política de Privacidad</h2>
        <p>Nos reservamos el derecho de modificar esta política de privacidad en cualquier momento. Los cambios y aclaraciones entrarán en vigor inmediatamente después de su publicación en el sitio web.</p>

        <h2>7. Contacto</h2>
        <p>Si tienes alguna pregunta sobre esta Política de Privacidad, puedes contactarnos a través de nuestra página de <a href="/contacto">contacto</a>.</p>
      </div>
    </div>
  );
}
