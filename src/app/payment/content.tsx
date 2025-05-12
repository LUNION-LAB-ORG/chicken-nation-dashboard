"use client";
import { createPaiement } from "@/services/paiement.action"; 
import { useKKiaPay } from "kkiapay-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import useGetDataPaiement from "./components/useGetDataPaiement";  
import ErrorPage from "./components/ErrorPage";

export interface ResponseKkiaPay {
  transactionId: string;
  reason?: {
    code: string;
    description: string;
  };
}
export default function Content({
  apiKey,
  sandbox,
}: {
  apiKey: string;
  sandbox: boolean;
}) {
  const { openKkiapayWidget, addKkiapayListener, removeKkiapayListener } =
    useKKiaPay();
  const router = useRouter();
  // Récupérer les données dans l'url
  const { amount, phone, name, email, orderId, isValid } = useGetDataPaiement();

  function open() {
    openKkiapayWidget({
      theme: "orange",
      amount,
      api_key: apiKey,
      sandbox,
      email,
      phone,
      name,
    });
  }

  // Gestionnaire de la réponse du portail de paiement
  const handlerPaiement = useCallback(
    async (response: ResponseKkiaPay) => {
      // Vérification et création du paiement côté backend
      const res = await createPaiement({
        transactionId: response.transactionId,
        reason: response?.reason ?? undefined,
        orderId: orderId ?? undefined,
      });
      router.push(
        `/payment/thank-you?transactionId=${
          res.paiement?.reference ?? ""
        }&total=${res.paiement?.total ?? ""}&mode=${
          res.paiement?.mode ?? ""
        }&source=${res.paiement?.source ?? ""}&reason=${
          res.paiement?.failure_message ?? ""
        }&status=${res.paiement?.status ?? ""}`
      );
    },
    [orderId, router]
  );

  useEffect(() => {
    addKkiapayListener("success", handlerPaiement);
    addKkiapayListener("failed", handlerPaiement);
    return () => {
      removeKkiapayListener("success");
      removeKkiapayListener("failed");
    };
  }, [addKkiapayListener, removeKkiapayListener, handlerPaiement]);

  // Ouverture automatique du portail de paiement

  if (!isValid) {
    return <ErrorPage />;
  }
  open();
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4"></div>
  );
}