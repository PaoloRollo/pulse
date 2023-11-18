"use client";
import { Button } from "@ensdomains/thorin";
import { useLogin } from "@privy-io/react-auth";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const { login } = useLogin({
    onComplete: (user, isNewUser, wasAlreadyAuthenticated) => {
      router.push("/app");
    },
  });
  return (
    <main className="flex h-screen w-full bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-[#2CCCFF] to-[#001CAE] relative">
      <Image
        src={"/logo-pulse-white.svg"}
        height={222}
        width={222}
        alt="Pulse logo white"
        className="absolute m-auto left-0 right-0 top-0 bottom-0"
      />
      <div className="w-full p-8 absolute bottom-0">
        <Button onClick={login} colorStyle="blueSecondary">
          Login
        </Button>
      </div>
    </main>
  );
}
