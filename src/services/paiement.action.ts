"use server"


export interface PaiementDto {
    transactionId: string;
    orderId?: string;
    reason?: {
        code: string;
        description: string;
    };
}

export const createPaiement = async (formData: PaiementDto): Promise<{
    success: boolean;
    message: string;
    transactionId: string;
    paiement?: { [key: string]: string | number | boolean };
}> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_PREFIX}/paiements/pay`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
    });

    const data = await res.json();

    return {
        success: data.success,
        message: data.message,
        transactionId: data.transactionId,
        paiement: data.paiement,
    };
};