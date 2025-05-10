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
    order?: { [key: string]: string | number | boolean };
}> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_PREFIX}/paiements/kkiapay`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
    });

    const data = await res.json();
    console.log(data);
    return {
        success: data.success,
        message: data.message,
        transactionId: data.transactionId,
        order: data.order,
    };
};