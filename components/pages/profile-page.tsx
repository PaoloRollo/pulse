"use client";
import { useSmartAccount } from "@/hooks/smart-account-context";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useEnsName } from "wagmi";
import { publicClient } from "@/lib/viem-client";
import { useLazyQuery } from "@airstack/airstack-react";
import Navbar from "../shared/navbar";
import LoadingNavbar from "../loadings/loading-navbar";
import {
  Avatar,
  Button,
  FlameSVG,
  Heading,
  HeartSVG,
  Skeleton,
} from "@ensdomains/thorin";

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
  const [postsFilter, setPostsFilter] = useState<string>("likes");
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
      <div className="h-screen w-screen bg-[#EEF5FF]">
        <LoadingNavbar />
        <div className="p-8">
          <Skeleton loading>
            <div className="h-[120px] w-[120px]"></div>
          </Skeleton>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-screen w-screen bg-[#EEF5FF]">
        <Navbar />
        <div className="p-8">
          <div className="h-[120px] w-[120px]">
            <Avatar
              src={profileData?.Socials?.Social[0].profileImage}
              label="Profile image"
            />
          </div>
          <Heading className="my-4 text-[#1E2122]">
            {data ||
              `${profileAddress.slice(0, 4)}...${profileAddress.slice(-4)}`}
          </Heading>
          <div className="flex items-center space-x-6 !text-[#9B9BA7]">
            <div className="flex items-center space-x-1">
              <FlameSVG />
              <span>24</span>
            </div>
            <div className="flex items-center space-x-1">
              <HeartSVG />
              <span>2500</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 mt-8">
            <Button
              colorStyle={
                postsFilter === "likes" ? "bluePrimary" : "transparent"
              }
              // className={postsFilter === "likes" ? "" : "!text-[#056AFF]"}
              onClick={() => setPostsFilter("likes")}
              prefix={<HeartSVG />}
            >
              Likes
            </Button>
            <Button
              colorStyle={
                postsFilter === "fires" ? "pinkPrimary" : "transparent"
              }
              // className={postsFilter === "fires" ? "" : "!text-[#D52E7E]"}
              onClick={() => setPostsFilter("fires")}
              prefix={<FlameSVG />}
            >
              Fires
            </Button>
          </div>
        </div>
        {/* <div className="max-w-3xl mx-auto px-4">
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
        </div> */}
      </div>
    </>
  );
}
