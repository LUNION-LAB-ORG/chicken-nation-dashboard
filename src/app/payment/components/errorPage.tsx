const ErrorPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2 text-[#F17922] ">Erreur : données manquantes</h1>
        <p className="text-gray-600 mb-6">
          Veuillez vérifier les données de paiement.
        </p>
      </div>
    </div>
  );
};

export default ErrorPage;
