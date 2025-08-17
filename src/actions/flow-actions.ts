
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

const generateSignature = (params: Record<string, string>, secret: string): string => {
    const sortedKeys = Object.keys(params).sort();
    const toSign = sortedKeys.map(key => `${key}${params[key]}`).join('');
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

        const signature = generateSignature(paramsForSignature, secretKey);
        
        const body = new URLSearchParams({
            ...paramsForSignature,
            s: signature,
        });

        console.log("Sending to Flow with body:", body.toString());

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

        return {
            url: `${url}?token=${token}`,
            token,
            flowOrder: Number(flowOrder),
        };

    } catch (error) {
        console.error('Fallo al crear la orden en Flow:', error);
        const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error inesperado al procesar el pago.';
        return { message: errorMessage };
    }
}
