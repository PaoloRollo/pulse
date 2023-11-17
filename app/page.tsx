"use client";

import { Button } from "@ensdomains/thorin";
import { useLogin } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const { login } = useLogin({
    onComplete: (user, isNewUser, wasAlreadyAuthenticated) => {
      console.log(user, isNewUser, wasAlreadyAuthenticated);
      if (isNewUser) {
        router.push("/onboarding");
      } else {
        router.push("/app");
      }
    },
  });
  return (
    <main className="flex min-h-screen min-w-full items-center justify-center bg-white">
      <div className="w-64">
        <Button onClick={login}>Login</Button>
      </div>
    </main>
  );
}
