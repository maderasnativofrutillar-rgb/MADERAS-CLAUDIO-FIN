
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

const FLOW_API_URL = 'https://www.flow.cl/api';

const apiKey = process.env.FLOW_API_KEY;
const secretKey = process.env.FLOW_SECRET_KEY;

const generateSignature = (params: Record<string, string>): string => {
    if (!secretKey) {
        throw new Error('Flow Secret Key no está configurada.');
    }
    // Ordenar los parámetros alfabéticamente por la clave
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

    const host = process.env.NEXT_PUBLIC_VERCEL_URL || 'localhost:9002';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // 1. Prepara todos los parámetros requeridos por Flow, excepto la firma.
    // Asegúrate de que todos los valores sean strings.
    const paramsForSignature: Record<string, string> = {
        apiKey,
        commerceOrder: paymentData.commerceOrder,
        subject: `Pago por orden ${paymentData.commerceOrder}`,
        currency: 'CLP',
        amount: String(paymentData.amount),
        email: paymentData.email,
        urlConfirmation: `${baseUrl}/api/flow/confirm`,
        urlReturn: `${baseUrl}/checkout/result`,
        paymentMethod: '9',
    };

    // 2. Genera la firma usando los parámetros ordenados.
    const signature = generateSignature(paramsForSignature);

    // 3. Prepara el cuerpo de la solicitud (body) con FormData, que maneja el formato application/x-www-form-urlencoded
    const formData = new FormData();
    for (const key in paramsForSignature) {
        formData.append(key, paramsForSignature[key]);
    }
    formData.append('s', signature);
    
    try {
        const response = await fetch(`${FLOW_API_URL}/payment/create`, {
            method: 'POST',
            body: formData, // FormData se encargará de los headers correctos.
        });
        
        const responseData = await response.json();
        
        if (!response.ok) {
            console.error("Flow API Error:", responseData);
            // Proporciona un mensaje de error más claro al cliente.
            const errorMessage = `Error de Flow: ${responseData.message || 'Error desconocido'} (Código: ${responseData.code || 'N/A'})`;
            throw new Error(errorMessage);
        }
        
        const { url, token, flowOrder } = responseData;
        
        if (!url || !token || !flowOrder) {
            console.error("Invalid success response from Flow:", responseData);
            throw new Error('Respuesta inválida de Flow. Faltan datos clave para la redirección.');
        }

        // 4. Devuelve la URL y el token para la redirección.
        return {
            url,
            token,
            flowOrder: Number(flowOrder),
        };

    } catch (error) {
        console.error('Fallo al crear la orden en Flow:', error);
        // Devuelve el mensaje de error para ser mostrado en el frontend.
        return { message: error instanceof Error ? error.message : 'Ocurrió un error desconocido al procesar el pago.' };
    }
}
