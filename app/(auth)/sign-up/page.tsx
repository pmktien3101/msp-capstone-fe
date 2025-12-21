import { Suspense } from "react";
import SignUpPage from "../sign-up/SignUpPage";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUpPage />
    </Suspense>
  );
}
