export default function TermsAndConditionsPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-24">
      <div className="prose max-w-4xl mx-auto">
        <h1 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Términos y Condiciones</h1>
        <p className="lead">
          Fecha de última actualización: {new Date().toLocaleDateString('es-CL')}
        </p>
        
        <p>Bienvenido a Madera Nativo Sur. Estos términos y condiciones describen las reglas y regulaciones para el uso del sitio web de Madera Nativo Sur, ubicado en la URL de esta tienda.</p>
        <p>Al acceder a este sitio web, asumimos que aceptas estos términos y condiciones en su totalidad. No continúes usando el sitio web de Madera Nativo Sur si no aceptas todos los términos y condiciones establecidos en esta página.</p>

        <h2>1. Propiedad Intelectual</h2>
        <p>A menos que se indique lo contrario, Madera Nativo Sur y/o sus licenciantes son dueños de los derechos de propiedad intelectual de todo el material en Madera Nativo Sur. Todos los derechos de propiedad intelectual están reservados. Puedes ver y/o imprimir páginas desde nuestro sitio web para tu uso personal sujeto a las restricciones establecidas en estos términos y condiciones.</p>
        <p>No debes:</p>
        <ul>
          <li>Republicar material de nuestro sitio web.</li>
          <li>Vender, alquilar o sublicenciar material de nuestro sitio web.</li>
          <li>Reproducir, duplicar o copiar material de nuestro sitio web.</li>
        </ul>

        <h2>2. Uso del Sitio Web</h2>
        <p>Estás de acuerdo en usar nuestro sitio web solo para fines legítimos y de una manera que no infrinja los derechos de, restrinja o inhiba el uso y disfrute de este sitio web por parte de cualquier tercero.</p>

        <h2>3. Precios y Pagos</h2>
        <p>Todos los precios están en Pesos Chilenos (CLP) e incluyen los impuestos aplicables. Nos reservamos el derecho de cambiar los precios en cualquier momento sin previo aviso. El pago debe realizarse en el momento de la compra a través de las pasarelas de pago disponibles, como Flow.</p>
        
        <h2>4. Envíos y Entregas</h2>
        <p>Los tiempos de envío y los costos se detallarán durante el proceso de compra. Haremos todo lo posible para cumplir con los plazos de entrega estimados, pero no nos hacemos responsables de los retrasos causados por terceros o por fuerza mayor. Nuestra dirección de operación es Diego Portales 860, Puerto Montt, Región De Los Lagos, Chile, aunque no contamos con atención presencial.</p>

        <h2>5. Limitación de Responsabilidad</h2>
        <p>En la máxima medida permitida por la ley aplicable, excluimos todas las representaciones, garantías y condiciones relacionadas con nuestro sitio web y el uso de este sitio web. Nada en este descargo de responsabilidad:</p>
        <ul>
          <li>Limitará o excluirá nuestra o tu responsabilidad por fraude o tergiversación fraudulenta.</li>
          <li>Limitará cualquiera de nuestras o tus responsabilidades de cualquier manera que no esté permitida por la ley aplicable.</li>
        </ul>

        <h2>6. Ley Aplicable</h2>
        <p>Estos términos y condiciones se regirán e interpretarán de acuerdo con las leyes de Chile, y te sometes irrevocablemente a la jurisdicción exclusiva de los tribunales de ese Estado o ubicación.</p>
        
        <h2>7. Contacto</h2>
        <p>Si tienes alguna pregunta sobre estos Términos y Condiciones, puedes contactarnos a través de nuestro correo electrónico morenosasesorias@gmail.com o en nuestra página de <a href="/contacto">contacto</a>.</p>
      </div>
    </div>
  );
}
