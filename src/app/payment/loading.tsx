import React from "react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-xl font-bold text-orange-500 mb-4">
          Chargement...
        </h2>
        <p className="text-gray-600">Vérification de votre authentification</p>
      </div>
    </div>
  );
}