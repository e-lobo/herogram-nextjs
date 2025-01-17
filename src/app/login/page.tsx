import LoginComponent from "@/modules/login";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginComponent />
    </Suspense>
  );
}
