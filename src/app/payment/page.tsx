import { Suspense } from "react";
import Content from "./content";
import ErrorPage from "./components/errorPage";
import Loading from "./loading";

export default async function PaymentPage() {
  // Récupération sécurisée des clés
  const apiKey = process.env.KKIA_PAY_API_KEY ?? "";
  const sandbox = process.env.KKIA_PAY_SANDBOX;

  if (!apiKey || !sandbox) {
    return <ErrorPage />;
  }

  return (
    <Suspense fallback={<Loading />}>
      <Content apiKey={apiKey} sandbox={sandbox === "true"} />
    </Suspense>
  );
}
