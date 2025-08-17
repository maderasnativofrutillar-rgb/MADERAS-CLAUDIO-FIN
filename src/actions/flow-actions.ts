
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

// Helper para generar la firma requerida por Flow
const generateSignature = (params: Record<string, string>, secret: string): string => {
    // Ordenar los parámetros alfabéticamente por clave
    const sortedKeys = Object.keys(params).sort();
    
    // Concatenar clave y valor
    const toSign = sortedKeys.map(key => `${key}${params[key]}`).join('');
    
    // Generar el HMAC-SHA256
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(toSign);
    return hmac.digest('hex');
};

export async function createFlowOrder(paymentData: FlowPaymentRequest): Promise<FlowPaymentResponse | { message: string }> {
    if (!apiKey || !secretKey) {
        console.error('Flow API credentials are not configured.');
        return { message: 'Las credenciales de la API de Flow no están configuradas.' };
    }

    const host = process.env.NEXT_PUBLIC_VERCEL_URL || 'localhost:9002';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    try {
        // 1. Prepara todos los parámetros requeridos por Flow como strings.
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
        const signature = generateSignature(paramsForSignature, secretKey);
        
        // 3. Construye el cuerpo de la solicitud en formato x-www-form-urlencoded
        const body = new URLSearchParams({
            ...paramsForSignature,
            s: signature,
        });

        console.log("Sending to Flow with body:", body.toString());

        // 4. Realiza la solicitud a la API de Flow
        const response = await fetch(`${FLOW_API_URL}/payment/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body.toString(),
        });
        
        const responseData = await response.json();
        
        if (!response.ok) {
            console.error("Flow API Error:", response.status, responseData);
            const errorMessage = `Error de Flow: ${responseData.message || 'Error desconocido'} (Código: ${responseData.code || 'N/A'})`;
            return { message: errorMessage };
        }
        
        const { url, token, flowOrder } = responseData;
        
        if (!url || !token || !flowOrder) {
            console.error("Invalid success response from Flow:", responseData);
            return { message: 'Respuesta inválida de Flow. Faltan datos para la redirección.' };
        }

        // 5. Devuelve la URL y el token para la redirección.
        return {
            url,
            token,
            flowOrder: Number(flowOrder),
        };

    } catch (error) {
        console.error('Fallo al crear la orden en Flow:', error);
        const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error inesperado al procesar el pago.';
        return { message: errorMessage };
    }
}
