
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
    if (!secretKey) {
        throw new Error('Flow Secret Key no está configurada.');
    }
    // The parameters must be sorted alphabetically by key
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

    // Dynamically determine the base URL from environment variables
    const host = process.env.NEXT_PUBLIC_VERCEL_URL || 'localhost:9002';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // Parameters for the signature MUST include the apiKey itself.
    const paramsForSignature = {
        apiKey: apiKey,
        commerceOrder: paymentData.commerceOrder,
        subject: `Pago por orden ${paymentData.commerceOrder}`,
        currency: 'CLP',
        amount: String(paymentData.amount), // Amount must be a string for signature and request
        email: paymentData.email,
        urlConfirmation: `${baseUrl}/api/flow/confirm`,
        urlReturn: `${baseUrl}/checkout/result`,
        paymentMethod: "9" // All payment methods
    };

    const signature = generateSignature(paramsForSignature);

    // The final parameters sent to Flow are the same ones used for the signature,
    // plus the signature itself in the 's' field.
    const finalParams = new URLSearchParams({
        ...paramsForSignature,
        s: signature,
    });

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
            // Flow might return a JSON error object on failure
            try {
                const errorData: FlowErrorResponse = JSON.parse(responseText);
                console.error("Flow API JSON Error:", errorData);
                throw new Error(`Error de Flow: ${errorData.message} (Código: ${errorData.code})`);
            } catch (e) {
                // If parsing fails, it's likely a plain text error, e.g., 401 Unauthorized
                 console.error("Flow API raw error response:", responseText);
                 throw new Error(`Error inesperado del servidor de Flow. Status: ${response.status}.`);
            }
        }
        
        // On success, Flow returns a query string, so we parse it
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
