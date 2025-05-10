"use client";
import { createPaiement } from "@/services/paiement.action";
import { useKKiaPay } from "kkiapay-react";
import { useCallback, useEffect } from "react";
import useGetDataPaiement from "./components/useGetDataPaiement";
import ErrorPage from "./components/errorPage";

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

  // Récupérer les données dans l'url
  const { amount, phone, name, email, orderId, isValid } = useGetDataPaiement();
  console.log({ amount, phone, name, email, orderId, isValid });

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
      console.log(response);

      // Vérification et création du paiement côté backend
      const res = await createPaiement({
        transactionId: response.transactionId,
        reason: response?.reason,
        orderId,
      });

      if (res.success) {
        console.log("Paiement synchronisé avec succès");
      } else {
        console.error("Erreur lors de la synchronisation du paiement");
      }
    },
    [orderId]
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
