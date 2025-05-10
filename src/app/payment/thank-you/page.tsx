"use client";

import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ThankYouPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-md text-center">
        <CheckCircle className="mx-auto text-green-500 w-16 h-16 mb-4" />
        <h1 className="text-2xl text-[#F17922] font-bold mb-2">
          Merci pour votre visite !
        </h1>
        <p className="text-gray-600 mb-6">
          Cette page est destinée à recevoir les paiements en ligne de{" "}
          <strong>Chicken-Nation</strong>.<br />
          Si votre paiement a réussi, vous recevrez un email de confirmation et
          votre paiement sera pris en compte dans le traitement des
          applications.
        </p>
        <Link href={"https://chicken-nation.com/"}>
          <button className="w-44 py-3 px-4 bg-[#F17922] text-white font-sofia-medium rounded-2xl transition-all duration-300 hover:bg-[#F17922]/90 focus:outline-none focus:ring-2 focus:ring-[#F17922] focus:ring-opacity-50">
            Découvrir Chicken-Nation
          </button>
        </Link>
      </div>
    </div>
  );
}
