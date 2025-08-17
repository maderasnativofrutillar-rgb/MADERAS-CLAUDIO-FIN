
'use server';

import crypto from 'crypto';

interface FlowPaymentRequest {
    amount: number;
    email: string;
    commerceOrder: string;
}

interface FlowPaymentResponse {
    url: string;
    token: string;
    flowOrder: number;
}

interface FlowErrorResponse {
    code: number;
    message: string;
}

// URL de producción, ya está configurada correctamente.
const FLOW_API_URL = 'https://www.flow.cl/api';

// Obtener las credenciales de las variables de entorno
const apiKey = process.env.FLOW_API_KEY;
const secretKey = process.env.FLOW_SECRET_KEY;

// Generar la firma para la API de Flow
const generateSignature = (params: Record<string, string>): string => {
    if (!secretKey) {
        throw new Error('Flow Secret Key no está configurada.');
    }
    // Los parámetros deben ordenarse alfabéticamente por su nombre
    const sortedKeys = Object.keys(params).sort();
    const toSign = sortedKeys.map(key => `${key}${params[key]}`).join('');
    
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(toSign);
    return hmac.digest('hex');
};

export async function createFlowOrder(paymentData: FlowPaymentRequest): Promise<FlowPaymentResponse | { message: string }> {
    if (!apiKey || !secretKey) {
        throw new Error('Las credenciales de la API de Flow no están configuradas.');
    }

    // Determinar dinámicamente la URL base de tu sitio
    const host = process.env.NEXT_PUBLIC_VERCEL_URL || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // Parámetros para la firma. Se deben firmar todos los parámetros que se envían.
    // Todos los valores DEBEN ser strings.
    const paramsForSignature: Record<string, string> = {
        apiKey: apiKey,
        commerceOrder: paymentData.commerceOrder,
        subject: `Pago por orden ${paymentData.commerceOrder}`,
        currency: 'CLP',
        amount: String(paymentData.amount), // El amount debe ser string para la firma
        email: paymentData.email,
        urlConfirmation: `${baseUrl}/api/flow/confirm`,
        urlReturn: `${baseUrl}/checkout/result`,
        paymentMethod: '9', // Todos los medios de pago
    };
    
    const signature = generateSignature(paramsForSignature);

    // Construir el cuerpo de la solicitud para el POST
    const finalParams = new URLSearchParams();
    // Añadir todos los parámetros firmados
    Object.keys(paramsForSignature).sort().forEach(key => {
      finalParams.append(key, paramsForSignature[key]);
    });
    // Agregar la firma al final
    finalParams.append('s', signature);

    // --- LOGS DE DEPURACIÓN (MUY ÚTILES) ---
    console.log("------------------------------------------");
    console.log("Parámetros para la firma:", paramsForSignature);
    const toSignString = Object.keys(paramsForSignature).sort().map(key => `${key}${paramsForSignature[key]}`).join('');
    console.log("Cadena a firmar:", toSignString);
    console.log("Firma generada:", signature);
    console.log("Cuerpo de la solicitud POST:", finalParams.toString());
    console.log("------------------------------------------");
    // --- FIN DE LOS LOGS DE DEPURACIÓN ---

    try {
        const response = await fetch(`${FLOW_API_URL}/payment/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: finalParams.toString(),
        });
        
        const responseData = await response.json(); // Parsea la respuesta como JSON
        
        if (!response.ok) {
            console.error("Flow API Error:", responseData);
            throw new Error(`Error de Flow: ${responseData.message} (Código: ${responseData.code})`);
        }
        
        // La respuesta exitosa es un objeto JSON
        const url = responseData.url;
        const token = responseData.token;
        const flowOrder = responseData.flowOrder;
        
        if (!url || !token || !flowOrder) {
            console.error("Invalid success response from Flow:", responseData);
            throw new Error('Respuesta inválida de Flow al crear el pago. Faltan datos clave.');
        }

        return {
            url,
            token,
            flowOrder: Number(flowOrder),
        };

    } catch (error) {
        console.error('Failed to create Flow order:', error);
        return { message: error instanceof Error ? error.message : 'Ocurrió un error desconocido al procesar el pago' };
    }
}
