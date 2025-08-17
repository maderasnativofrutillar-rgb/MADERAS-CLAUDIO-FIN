
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

    const params: Record<string, string> = {
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

    const signature = generateSignature(params);

    const finalParams = new URLSearchParams(params);
    finalParams.append('s', signature);

    console.log("------------------------------------------");
    const toSignString = Object.keys(params).sort().map(key => `${key}${params[key]}`).join('');
    console.log("Cadena a firmar:", toSignString);
    console.log("Firma generada:", signature);
    console.log("Cuerpo de la solicitud POST:", finalParams.toString());
    console.log("------------------------------------------");
    
    try {
        const response = await fetch(`${FLOW_API_URL}/payment/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: finalParams.toString(),
        });
        
        const responseData = await response.json();
        
        if (!response.ok) {
            console.error("Flow API Error:", responseData);
            throw new Error(`Error de Flow: ${responseData.message} (Código: ${responseData.code})`);
        }
        
        const { url, token, flowOrder } = responseData;
        
        if (!url || !token || !flowOrder) {
            console.error("Invalid success response from Flow:", responseData);
            throw new Error('Respuesta inválida de Flow. Faltan datos clave.');
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
