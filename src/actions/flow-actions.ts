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

// Obtener las credenciales de las variables de entorno de Netlify
const apiKey = process.env.FLOW_API_KEY;
const secretKey = process.env.FLOW_SECRET_KEY;

// Generar la firma para la API de Flow
const generateSignature = (params: Record<string, any>): string => {
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
    const host = process.env.NEXT_PUBLIC_VERCEL_URL || 'localhost:3000'; // Corregí el puerto
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;
    
    // Parámetros para la firma. TODOS los parámetros que se envían deben ser firmados.
    const paramsForSignature = {
        apiKey: apiKey,
        commerceOrder: paymentData.commerceOrder,
        subject: `Pago por orden ${paymentData.commerceOrder}`,
        currency: 'CLP',
        amount: String(paymentData.amount), // El amount debe ser string para la firma
        email: paymentData.email,
        urlConfirmation: `${baseUrl}/api/flow/confirm`,
        urlReturn: `${baseUrl}/checkout/result`,
        paymentMethod: 9, // Todos los medios de pago
    };
    
    const signature = generateSignature(paramsForSignature);

    // Construir el cuerpo de la solicitud para el POST
    const finalParams = new URLSearchParams();
    finalParams.append('apiKey', apiKey);
    finalParams.append('commerceOrder', paymentData.commerceOrder);
    finalParams.append('subject', paramsForSignature.subject);
    finalParams.append('currency', 'CLP');
    finalParams.append('amount', String(paymentData.amount)); // Enviar como string
    finalParams.append('email', paymentData.email);
    finalParams.append('urlConfirmation', paramsForSignature.urlConfirmation);
    finalParams.append('urlReturn', paramsForSignature.urlReturn);
    finalParams.append('paymentMethod', '9'); // Enviar como string
    finalParams.append('s', signature);

    // --- LOGS DE DEPURACIÓN (MUY ÚTILES) ---
    console.log("------------------------------------------");
    console.log("Parámetros para la firma:", paramsForSignature);
    console.log("Cadena firmada:", generateSignature(paramsForSignature));
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
        
        const responseText = await response.text();
        
        if (!response.ok) {
            try {
                const errorData: FlowErrorResponse = JSON.parse(responseText);
                console.error("Flow API JSON Error:", errorData);
                throw new Error(`Error de Flow: ${errorData.message} (Código: ${errorData.code})`);
            } catch (e) {
                console.error("Flow API raw error response:", responseText);
                throw new Error(`Error inesperado del servidor de Flow. Status: ${response.status}.`);
            }
        }
        
        const parsedResponse = new URLSearchParams(responseText);
        const url = parsedResponse.get('url');
        const token = parsedResponse.get('token');
        const flowOrder = parsedResponse.get('flowOrder');
        
        if (!url || !token || !flowOrder) {
            console.error("Invalid success response from Flow:", responseText);
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