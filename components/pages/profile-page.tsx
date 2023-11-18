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
  Card,
  FlameSVG,
  Heading,
  HeartSVG,
  Skeleton,
  Typography,
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
  const [airstackFetch, { data: profileData, loading, error }] = useLazyQuery(
    query,
    {
      addresses: [profileAddress],
    }
  );
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
  const [likedPosts, setLikedPosts] = useState<any[]>([]);
  const [firePosts, setFirePosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  // If the user is not authenticated, redirect them back to the landing page
  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  const isLoading =
    !smartAccountAddress || !smartAccountProvider || postsLoading;

  useEffect(() => {
    if (wallets && wallets.length > 0) {
      getEnsFromWallets();
    }
  }, [wallets]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setPostsLoading(true);
      const response = await fetch(`/api/reactions?address=${profileAddress}`);
      const { reactions } = await response.json();
      const { likes, fires } = reactions;
      setLikedPosts(likes);
      setFirePosts(fires);
    } catch (error) {
      console.log(error);
    } finally {
      setPostsLoading(false);
    }
  };

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
    await airstackFetch({
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
              <span>{firePosts.length}</span>
            </div>
            <div className="flex items-center space-x-1">
              <HeartSVG />
              <span>{likedPosts.length}</span>
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
          {postsFilter === "likes" && (
            <div className="flex flex-col space-y-4 mt-3">
              {likedPosts.map((post) => (
                <Card key={post.id}>
                  <div className="flex items-center space-x-2">
                    <div className="h-10 w-10">
                      <Avatar
                        src={post.unified_posts.author_profile_image}
                        label={post.unified_posts.author_name}
                        height={40}
                        width={40}
                      />
                    </div>
                    <h1 className="font-bold">
                      @{post.unified_posts.author_name}
                    </h1>
                  </div>
                  <Typography>{post.unified_posts.cleaned_text}</Typography>
                  <div className="flex items-center space-x-2">
                    {post.unified_posts.source === "Farcaster" ? (
                      <img src="/see-on-farcaster.svg" className="h-5" />
                    ) : (
                      <img src="/see-on-lens.svg" className="h-5" />
                    )}
                    <p className="text-xs text-[#9B9BA7]">
                      {new Date(
                        post.unified_posts.publish_date
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
          {postsFilter === "fires" && (
            <div className="flex flex-col space-y-4 mt-3">
              {firePosts.map((post) => (
                <Card key={post.id}>
                  <div className="flex items-center space-x-2">
                    <div className="h-10 w-10">
                      <Avatar
                        src={post.unified_posts.author_profile_image}
                        label={post.unified_posts.author_name}
                        height={40}
                        width={40}
                      />
                    </div>
                    <h1 className="font-bold">
                      @{post.unified_posts.author_name}
                    </h1>
                  </div>
                  <Typography>{post.unified_posts.cleaned_text}</Typography>
                  <div className="flex items-center space-x-2">
                    {post.unified_posts.source === "Farcaster" ? (
                      <img src="/see-on-farcaster.svg" className="h-5" />
                    ) : (
                      <img src="/see-on-lens.svg" className="h-5" />
                    )}
                    <p className="text-xs text-[#9B9BA7]">
                      {new Date(
                        post.unified_posts.publish_date
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
