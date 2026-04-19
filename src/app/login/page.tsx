import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-blue-800 border-t-transparent rounded-full" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
