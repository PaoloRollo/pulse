"use client";
import { useSmartAccount } from "@/hooks/smart-account-context";
import { Button, Card, LeftArrowSVG, Profile } from "@ensdomains/thorin";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useEnsName } from "wagmi";
import { publicClient } from "@/lib/viem-client";

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
  const [mappedWallets, setMappedWallets] = useState<any>(
    wallets.map((wallet) => ({ address: wallet.address, ens: undefined }))
  );
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

  useEffect(() => {
    if (wallets && wallets.length > 0) {
      getEnsFromWallets();
    }
  }, [wallets]);

  const getEnsFromWallets = async () => {
    const mappedWallets = await Promise.all(
      wallets.map(async (wallet) => {
        const ens = await publicClient.getEnsName({
          address: wallet.address as `0x${string}`,
        });
        return {
          address: wallet.address,
          ens: ens,
        };
      })
    );
    setMappedWallets(mappedWallets);
  };

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
            onClick={() => router.push("/app")}
            shape="circle"
          >
            <LeftArrowSVG />
          </Button>
        </div>
        <div className="max-w-3xl mx-auto">
          <Card>
            <Profile address={profileAddress} ensName={data || undefined} />
            {/* {isLoggedUser && (
              <>
                <h1 className="font-bold">Connected wallets</h1>
                <div className="flex space-x-2">
                  {mappedWallets.map(
                    (wallet: { address: string; ens: string | undefined }) => (
                      <Profile
                        key={wallet.address}
                        address={wallet.address}
                        ensName={wallet.ens}
                      />
                      // <h2 key={wallet.address}>{wallet.address}</h2>
                    )
                  )}
                </div>
              </>
            )} */}
            {/* {isLoggedUser && (
              <Button onClick={() => connectWallet()}>Connect wallet</Button>
            )} */}
          </Card>
        </div>
      </div>
    </>
  );
}
