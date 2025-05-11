"use client";

import {
  CheckCircle,
  XCircle,
  CreditCard,
  Banknote,
  BadgeDollarSign,
  Hash,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ThankYouPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const transactionId = searchParams.get("transactionId") ?? "";
  const total = searchParams.get("total") ?? "";
  const mode = searchParams.get("mode") ?? "";
  const source = searchParams.get("source") ?? "";
  const reason = searchParams.get("reason") ?? "";
  const status = searchParams.get("status") ?? "";

  const isSuccess = status === "SUCCESS";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="bg-white shadow-lg rounded-2xl p-6 max-w-md w-full text-center">
        {isSuccess ? (
          <CheckCircle className="mx-auto text-green-500 w-16 h-16 mb-4" />
        ) : (
          <XCircle className="mx-auto text-red-500 w-16 h-16 mb-4" />
        )}

        <h1 className="text-2xl font-bold text-[#F17922] mb-2">
          {isSuccess ? "Merci pour votre visite !" : "Erreur lors du paiement"}
        </h1>

        <p className="text-gray-600 mb-6 text-sm">
          {isSuccess ? (
            <>
              Cette page est destinée à recevoir les paiements en ligne de{" "}
              <strong>Chicken-Nation</strong>.<br />
              Si votre paiement a réussi, vous recevrez un email de confirmation
              et votre paiement sera pris en compte dans le traitement des
              applications.
            </>
          ) : (
            <>
              Une erreur est survenue lors du paiement.
              <br />
              {reason && (
                <span className="text-xs text-red-500">Raison : {reason}</span>
              )}
            </>
          )}
        </p> 
        {isSuccess && (
          <div className="bg-gray-100 text-gray-700 rounded-xl p-4 mb-6 text-left space-y-3">
            <div className="flex items-center space-x-2">
              <Hash className=" w-5 h-5" />
              <span className="text-sm">
                <strong>ID :</strong> {transactionId ?? ""}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <CreditCard className=" w-5 h-5" />
              <span className="text-sm">
                <strong>Mode :</strong> {mode ?? "Non fourni"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Banknote className=" w-5 h-5" />
              <span className="text-sm">
                <strong>Source :</strong> {source ?? "Non fourni"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <BadgeDollarSign className=" w-5 h-5" />
              <span className="text-sm">
                <strong>Montant :</strong> {total ?? "Non fourni"} FCFA
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 items-center">
          <button
            onClick={() => router.push("https://chicken-nation.com/")}
            className="w-full py-3 bg-[#ECECEC] text-[#F17922] rounded-xl font-medium hover:bg-[#f17922]/90 transition"
          >
            {"Découvrir Chicken-Nation"}
          </button>
          <button
            onClick={() => router.back()}
            className="w-full py-3 bg-[#F17922] text-white rounded-xl font-medium hover:bg-[#f17922]/90 transition"
          >
            {"Revenir à la page de paiement"}
          </button>
        </div>
      </div>
    </div>
  );
}
