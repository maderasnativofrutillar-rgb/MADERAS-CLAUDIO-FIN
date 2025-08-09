
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

const FLOW_API_URL = 'https://sandbox.flow.cl/api'; // Use sandbox for testing

// Get credentials from environment variables
const apiKey = process.env.FLOW_API_KEY;
const secretKey = process.env.FLOW_SECRET_KEY;

// Generate signature for Flow API
const generateSignature = (params: Record<string, any>): string => {
    const sortedKeys = Object.keys(params).sort();
    const toSign = sortedKeys.map(key => `${key}${params[key]}`).join('');
    
    const hmac = crypto.createHmac('sha256', secretKey!);
    hmac.update(toSign);
    return hmac.digest('hex');
};

export async function createFlowOrder(paymentData: FlowPaymentRequest): Promise<FlowPaymentResponse | { message: string }> {
    if (!apiKey || !secretKey) {
        throw new Error('Flow API credentials are not configured.');
    }

    const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://maderasnativosur.com' // Replace with your actual production domain
        : 'http://localhost:9002'; // Or your local dev URL

    const params = {
        apiKey,
        commerceOrder: paymentData.commerceOrder,
        subject: `Pago por orden ${paymentData.commerceOrder}`,
        currency: 'CLP',
        amount: paymentData.amount,
        email: paymentData.email,
        urlConfirmation: `${baseUrl}/api/flow/confirm`,
        urlReturn: `${baseUrl}/checkout/result`,
        paymentMethod: 9 // All payment methods
    };
    
    const signature = generateSignature(params);
    const finalParams = new URLSearchParams({ ...params, s: signature, amount: String(params.amount) });

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
            // Flow might return JSON error on failure
            try {
                const errorData: FlowErrorResponse = JSON.parse(responseText);
                console.error("Flow API Error:", errorData);
                throw new Error(`Error de Flow: ${errorData.message} (Código: ${errorData.code})`);
            } catch (e) {
                // If parsing fails, it's likely a plain text error
                 console.error("Flow API raw error response:", responseText);
                 throw new Error(`Error inesperado del servidor de Flow. Status: ${response.status}`);
            }
        }
        
        // Flow returns a query string on success, so we parse it
        const parsedResponse = new URLSearchParams(responseText);
        const url = parsedResponse.get('url');
        const token = parsedResponse.get('token');
        const flowOrder = parsedResponse.get('flowOrder');
        
        if (!url || !token) {
            throw new Error('Respuesta inválida de Flow al crear el pago.');
        }

        return {
            url,
            token,
            flowOrder: Number(flowOrder),
        };

    } catch (error) {
        console.error('Failed to create Flow order:', error);
        return { message: error instanceof Error ? error.message : 'An unknown error occurred' };
    }
}
