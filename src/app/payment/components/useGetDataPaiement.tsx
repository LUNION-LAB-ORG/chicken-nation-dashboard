"use client";

import { useSearchParams } from "next/navigation";

// Hook pour récupérer les données de paiement depuis l'url
const useGetDataPaiement = () => {
  const searchParams = useSearchParams();

  const amount = Number(searchParams.get("amount"));
  const phone = searchParams.get("phone") as string;
  const name = searchParams.get("name") as string;
  const email = searchParams.get("email") as string;
  const orderId = searchParams.get("orderId") as string;
  const token = searchParams.get("token") as string;

  const isValid = amount && phone && email && name && token;

  return {
    amount,
    phone,
    name,
    email,
    orderId,
    token,
    isValid,
  };
};

export default useGetDataPaiement;
