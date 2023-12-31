import { useSmartAccount } from "@/hooks/smart-account-context";
import { ExitSVG, PersonSVG, Profile } from "@ensdomains/thorin";
import { usePrivy } from "@privy-io/react-auth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const { ready, authenticated, user, logout } = usePrivy();
  const { smartAccountAddress } = useSmartAccount();
  const [pulseSubdomain, setPulseSubdomain] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    if (smartAccountAddress) fetchAuthData();
  }, [smartAccountAddress]);

  const fetchAuthData = async () => {
    const response = await fetch(`/api/auth/${smartAccountAddress}`);

    const { ens } = await response.json();
    setPulseSubdomain(ens || undefined);
  };

  return (
    <div className="w-full flex items-center justify-between px-6 py-3 border border-b-1 z-50">
      <Image
        src={"/navbar-logo.png"}
        alt="Pulse logo"
        height={40}
        width={120}
        onClick={() => router.push("/app")}
        className="cursor-pointer"
      />
      <Profile
        address={smartAccountAddress!}
        ensName={pulseSubdomain}
        className="cursor-pointer hover:-translate-y-0.5 transition-transform"
        dropdownItems={[
          {
            label: "Profile",
            onClick: () => router.push(`/app/profile/${smartAccountAddress}`),
            icon: <PersonSVG />,
          },
          {
            label: "Logout",
            onClick: () => logout(),
            icon: <ExitSVG />,
            color: "red",
          },
        ]}
      />
    </div>
  );
}
