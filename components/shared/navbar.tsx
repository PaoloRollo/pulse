import { useSmartAccount } from "@/hooks/smart-account-context";
import { ExitSVG, PersonSVG, Profile } from "@ensdomains/thorin";
import { usePrivy } from "@privy-io/react-auth";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const { ready, authenticated, user, logout } = usePrivy();
  const { smartAccountAddress } = useSmartAccount();

  return (
    <div className="w-full flex items-center justify-between px-6 py-3 border border-b-1 z-50">
      <Image
        src={"/logo-pulse.svg"}
        alt="Pulse logo"
        height={40}
        width={40}
        onClick={() => router.push("/app")}
        className="cursor-pointer"
      />
      <Profile
        address={smartAccountAddress!}
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
