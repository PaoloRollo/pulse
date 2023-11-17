"use client";
import { useSmartAccount } from "@/hooks/smart-account-context";
import {
  Button,
  Card,
  ExitSVG,
  LeftArrowSVG,
  Profile,
} from "@ensdomains/thorin";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useEnsName } from "wagmi";

export default function ProfilePage({
  profileAddress,
}: {
  profileAddress: string;
}) {
  const router = useRouter();
  const { ready, authenticated, user, logout } = usePrivy();
  const {
    smartAccountAddress,
    smartAccountProvider,
    sendSponsoredUserOperation,
    eoa,
  } = useSmartAccount();
  const { connectWallet } = usePrivy();
  const { wallets } = useWallets();
  const { data } = useEnsName({ address: profileAddress as `0x${string}` });

  // If the user is not authenticated, redirect them back to the landing page
  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  const isLoading = !smartAccountAddress || !smartAccountProvider;

  console.log(wallets);
  // console.log(user);

  const isLoggedUser =
    profileAddress.toLowerCase() === smartAccountAddress?.toLowerCase();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <>
      <div className="h-screen w-screen">
        <div className="flex items-center justify-between p-4">
          <Button
            colorStyle="blueSecondary"
            onClick={() => router.back()}
            shape="circle"
          >
            <LeftArrowSVG />
          </Button>
          <Button
            colorStyle="redSecondary"
            shape="circle"
            onClick={() => logout()}
          >
            <ExitSVG />
          </Button>
        </div>
        <div className="max-w-3xl mx-auto">
          <Card>
            <Profile
              address={profileAddress}
              ensName={data || profileAddress}
            />
            {/* {isLoggedUser && (
              <>
                <h1 className="font-bold">Connected wallets</h1>
                <div className="flex space-x-2">
                  {wallets.map((wallet) => (
                    <Profile key={wallet.address} address={wallet.address} />
                    // <h2 key={wallet.address}>{wallet.address}</h2>
                  ))}
                </div>
              </>
            )}
            {isLoggedUser && (
              <Button onClick={() => connectWallet()}>Connect wallet</Button>
            )} */}
          </Card>
        </div>
      </div>
    </>
  );
}
