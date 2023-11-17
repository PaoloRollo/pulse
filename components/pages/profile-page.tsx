"use client";
import { useSmartAccount } from "@/hooks/smart-account-context";
import {
  Avatar,
  Banner,
  Button,
  Card,
  FieldSet,
  Heading,
  LeftArrowSVG,
  Profile,
  RadioButton,
  RadioButtonGroup,
  Tag,
} from "@ensdomains/thorin";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useEnsName } from "wagmi";
import { publicClient } from "@/lib/viem-client";
import { useLazyQuery } from "@airstack/airstack-react";

const query = `
query GetUserDetailsFromENS($addresses: [Identity!]) {
  Socials(
    input: {
      filter: { identity: { _in: $addresses } }
      blockchain: ethereum
    }
  ) {
    Social {
      userAddress
      dappName
      profileName
      profileImage
      profileDisplayName
      profileBio
    }
  }
}
`;

export default function ProfilePage({
  profileAddress,
}: {
  profileAddress: string;
}) {
  const [fetch, { data: profileData, loading, error }] = useLazyQuery(query, {
    addresses: [profileAddress],
  });
  const [postsFilter, setPostsFilter] = useState<string>("liked");
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
    await fetch({
      addresses: [profileAddress].concat(
        wallets.map((wallet) => wallet.address)
      ),
    });
  };

  if (isLoading || loading) {
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
        <div className="max-w-3xl mx-auto px-4">
          <Card>
            <Profile address={profileAddress} ensName={data || undefined} />
            <Heading level="2">Socials</Heading>
            {!profileData?.Socials && (
              <p>No web3 socials linked to this account!</p>
            )}
            {profileData?.Socials?.Social?.map((social: any, index: number) => (
              <Banner
                key={`${social.dappName}-${index}`}
                icon={
                  <Avatar src={social.profileImage} label={social.dappName} />
                }
                title={social.profileName}
                actionIcon={<Tag className="!mr-12">{social.dappName}</Tag>}
              >
                {social.profileBio}
              </Banner>
            ))}
            {/* <Heading level="2">Liked Posts</Heading> */}
            <FieldSet legend="Explore activity">
              <RadioButtonGroup
                inline
                value={postsFilter}
                onChange={(e) => setPostsFilter(e.target.value)}
              >
                <RadioButton
                  label="Liked posts"
                  name="RadioButtonGroup"
                  value="liked"
                  width="max"
                />
                <RadioButton
                  label="Loved posts"
                  name="RadioButtonGroup"
                  value="super-liked"
                  width="max"
                />
              </RadioButtonGroup>
            </FieldSet>
          </Card>
        </div>
      </div>
    </>
  );
}
