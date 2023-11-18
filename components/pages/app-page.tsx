"use client";
import { useSmartAccount } from "@/hooks/smart-account-context";
import { publicClient } from "@/lib/viem-client";
import {
  Button,
  Card,
  CounterClockwiseArrowSVG,
  CrossSVG,
  Dialog,
  FlameSVG,
  HeartSVG,
  Input,
  ScrollBox,
  Typography,
  WalletSVG,
} from "@ensdomains/thorin";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { CONSTANTS, PushAPI } from "@pushprotocol/restapi";
import { PushStream } from "@pushprotocol/restapi/src/lib/pushstream/PushStream";
import { useRouter } from "next/navigation";
import React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import TinderCard from "react-tinder-card";
import localforage from "localforage";
import Navbar from "../shared/navbar";
import LoadingAppPage from "../loadings/loading-app-page";

export default function AppPage() {
  const router = useRouter();
  const { ready, authenticated, user, logout, connectWallet } = usePrivy();
  const {
    smartAccountAddress,
    smartAccountProvider,
    smartAccountSigner,
    sendSponsoredUserOperation,
    eoa,
  } = useSmartAccount();
  const { wallets } = useWallets();
  const [connectedWallet, setConnectedWallet] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(99);
  const [lastDirection, setLastDirection] = useState();
  const [pushUser, setPushUser] = useState<PushAPI | null>(null);
  const [pushStream, setPushStream] = useState<PushStream | null>(null);
  const [pushStreamConnected, setPushStreamConnected] =
    useState<boolean>(false);
  const [permission, setPermission] = useState<boolean>(false);
  const currentIndexRef = useRef(currentIndex);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [subdomain, setSubdomain] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState<number>(0);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [pulseSubdomain, setPulseSubdomain] = useState<string | undefined>(
    undefined
  );

  const childRefs = useMemo<any[]>(
    () =>
      Array(100)
        .fill(0)
        .map((i) => React.createRef()),
    []
  );

  const updateCurrentIndex = (val: number) => {
    setCurrentIndex(val);
    currentIndexRef.current = val;
  };

  const canGoBack = currentIndex < posts.length - 1;

  const canSwipe = currentIndex >= 0;

  const react = async (direction: string, postId: string) => {
    const reaction =
      direction === "left" ? "SKIP" : direction === "up" ? "FIRE" : "LIKE";
    await fetch(`/api/posts/${postId}`, {
      method: "POST",
      body: JSON.stringify({
        address: smartAccountAddress,
        reaction,
      }),
    });
  };

  // set last direction and decrease current index
  const swiped = (direction: any, nameToDelete: string, index: number) => {
    setLastDirection(direction);
    updateCurrentIndex(index - 1);
    react(direction, nameToDelete);
  };

  const outOfFrame = (name: string, idx: number) => {
    console.log(`${name} (${idx}) left the screen!`, currentIndexRef.current);
    // handle the case in which go back is pressed before card goes outOfFrame
    currentIndexRef.current >= idx && childRefs[idx].current.restoreCard();
    // TODO: when quickly swipe and restore multiple times the same card,
    // it happens multiple outOfFrame events are queued and the card disappear
    // during latest swipes. Only the last outOfFrame event should be considered valid
  };

  const swipe = async (dir: any) => {
    if (canSwipe && currentIndex < posts.length) {
      await childRefs[currentIndex].current.swipe(dir); // Swipe the card!
    }
  };

  // increase current index and show card
  const goBack = async () => {
    if (!canGoBack) return;
    const newIndex = currentIndex + 1;
    updateCurrentIndex(newIndex);
    await childRefs[newIndex].current.restoreCard();
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (smartAccountAddress) fetchAuthData();
  }, [smartAccountAddress]);

  // If the user is not authenticated, redirect them back to the landing page
  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  useEffect(() => {
    if (wallets && wallets.length > 0) {
      fetchConnectedWallet();
    }
  }, [wallets]);

  useEffect(() => {
    if (smartAccountSigner) {
      fetchNotificationStatus().then(() => {
        const notificationPermission = Notification.permission === "granted";
        setPermission(notificationPermission);
        if (notificationPermission) subscribeToNotifications();
      });
    }
  }, [smartAccountSigner]);

  const registerUser = async () => {
    try {
      setConfirmLoading(true);
      const response = await fetch(`/api/auth/register`, {
        method: "POST",
        body: JSON.stringify({
          address: smartAccountAddress,
          subdomain: `${subdomain}.pulse.eth`,
        }),
      });
      const { result, error } = await response.json();
      setShowModal(false);
    } catch (error) {
      console.error(error);
    } finally {
      setConfirmLoading(false);
    }
  };

  const fetchAuthData = async () => {
    const response = await fetch(`/api/auth/${smartAccountAddress}`);

    const { ens } = await response.json();
    setShowModal(!ens);
    setPulseSubdomain(ens || undefined);
  };

  const fetchPosts = async () => {
    const response = await fetch(
      `/api/posts?page=${page}&address=${smartAccountAddress}`
    );
    const data = await response.json();

    setPosts(data.posts);
    setCurrentIndex(data.posts.length - 1);
  };

  const fetchConnectedWallet = async () => {
    const wallet = wallets.find(
      (wallet) => wallet.connectorType !== "embedded"
    );
    if (wallet) {
      const ens = await publicClient.getEnsName({
        address: wallet.address as `0x${string}`,
      });
      setConnectedWallet({
        ...wallet,
        ens,
      });
      if (ens) {
        setSubdomain(ens.split(".")[0]);
      }
    }
  };

  const subscribeToNotifications = async () => {
    if (pushStream) {
      let notificationPermission = permission;
      if (!notificationPermission) {
        const result = await Notification.requestPermission();
        notificationPermission = result === "granted";
      }
      if (notificationPermission) {
        const token = await localforage.getItem("pulse_fcm_token");

        pushStream.on(CONSTANTS.STREAM.NOTIF, (data: any) => {
          console.log(data);
          const { body, title } = data.message.notification;
          console.log(body, title);
          const notification = new Notification(title, {
            body: body,
          });
        });

        pushStream.on(CONSTANTS.STREAM.CONNECT, () => {
          console.log("CONNECTED");
        });

        pushStream.on(CONSTANTS.STREAM.DISCONNECT, () => {
          console.log("DISCONNECTED");
        });

        await pushStream.connect();

        setPushStreamConnected(true);
      }
    }
  };

  const fetchNotificationStatus = async () => {
    try {
      const pushAPIUser = await PushAPI.initialize(smartAccountSigner?.inner, {
        env: CONSTANTS.ENV.STAGING,
      });
      setPushUser(pushAPIUser);
      const subscriptions = await pushAPIUser.notification.subscriptions();
      console.log(subscriptions);
      const channel = subscriptions.find((subscription: any) => {
        return (
          subscription.channel === process.env.NEXT_PUBLIC_CHANNEL_DELEGATE
        );
      });
      console.log(process.env.NEXT_PUBLIC_CHANNEL_DELEGATE);
      if (!channel) {
        await pushAPIUser.notification.subscribe(
          process.env.NEXT_PUBLIC_CHANNEL_ADDRESS as string
        );
      }

      const stream = await pushAPIUser.initStream([CONSTANTS.STREAM.NOTIF], {
        filter: {
          channels: [process.env.NEXT_PUBLIC_CHANNEL_DELEGATE as string],
        },
        connection: {
          retries: 3,
        },
        raw: false,
      });

      setPushStream(stream);
    } catch (error) {
      console.error(error);
    }
  };

  const isLoading = !smartAccountAddress || !smartAccountProvider;

  if (isLoading) {
    return <LoadingAppPage />;
  }

  return (
    <>
      <div className="h-screen w-screen bg-[#EEF5FF] overflow-hidden">
        <Navbar />
        <div className="flex items-center justify-center h-[500px] overflow-hidden">
          {posts.map((post, index) => (
            <TinderCard
              ref={childRefs[index]}
              className="swipe"
              key={post.content_id}
              preventSwipe={["down", "up"]}
              swipeRequirementType="position"
              onSwipe={(dir) => swiped(dir, post.content_id, index)}
              onCardLeftScreen={() => outOfFrame(post.content_id, index)}
            >
              <Card className="h-[449px] w-[313px] p-4" id={post.content_id}>
                <ScrollBox style={{ height: "449px" }}>
                  <Typography className="select-none w-full break-words text-xl">
                    {post.cleaned_text}
                  </Typography>
                </ScrollBox>
              </Card>
            </TinderCard>
          ))}
        </div>
        <div className="grid grid-cols-3 absolute bottom-16 left-1/2 -translate-x-1/2 gap-8 mx-auto w-[304px] ">
          <div className="h-[140px] flex flex-col justify-end items-center space-y-2">
            <Button
              // shadow
              shape="circle"
              disabled={!canSwipe}
              onClick={() => swipe("left")}
              style={{ height: "80px", width: "80px" }}
              colorStyle="greyPrimary"
            >
              <CrossSVG style={{ height: "32px", width: "32px" }} />
            </Button>
            <Typography color="grey">Skip</Typography>
          </div>
          <div className="h-[140px] flex flex-col items-center space-y-2">
            <Button
              shadow
              shape="circle"
              colorStyle="pinkPrimary"
              disabled={!canSwipe}
              onClick={() => swipe("up")}
              style={{ height: "80px", width: "80px" }}
            >
              <FlameSVG style={{ height: "32px", width: "32px" }} />
            </Button>
            <Typography color="pink">Love</Typography>
          </div>
          <div className="h-[140px] flex flex-col items-center justify-end space-y-2">
            <Button
              shadow
              shape="circle"
              disabled={!canSwipe}
              onClick={() => swipe("right")}
              style={{ height: "80px", width: "80px" }}
            >
              <HeartSVG style={{ height: "32px", width: "32px" }} />
            </Button>
            <Typography color="blue">Like</Typography>
          </div>
        </div>
        <div className="flex items-center justify-center absolute bottom-8 left-1/2 -translate-x-1/2">
          <Button
            disabled={!canGoBack}
            colorStyle="background"
            onClick={() => goBack()}
            size="small"
            prefix={<CounterClockwiseArrowSVG />}
          >
            Undo
          </Button>
        </div>
      </div>
      <Dialog
        open={showModal}
        variant="actionable"
        // currentStep={currentStep}
        // stepCount={2}
        onDismiss={() => {
          setShowModal(true);
        }}
      >
        {currentStep === 0 && (
          <>
            <Dialog.Heading title="Add wallet" />
            <div className="w-full md:w-[500px]">
              <p className="mb-4 text-center">
                We will use the social graph from this wallet to ensure you a
                more customized posts feed.
              </p>
              {!connectedWallet ? (
                <Button
                  prefix={<WalletSVG />}
                  colorStyle="bluePrimary"
                  onClick={() => connectWallet()}
                >
                  Connect Wallet
                </Button>
              ) : (
                <Button prefix={<WalletSVG />} colorStyle="bluePrimary">
                  {connectedWallet.ens ||
                    connectedWallet.address.slice(0, 8) +
                      "..." +
                      connectedWallet.address.slice(-8)}
                </Button>
              )}
            </div>
            <Dialog.Footer
              trailing={
                <Button
                  colorStyle="blueSecondary"
                  onClick={() => setCurrentStep(1)}
                >
                  {connectedWallet ? "Continue" : "Skip"}
                </Button>
              }
            />
          </>
        )}
        {currentStep === 1 && (
          <>
            <Dialog.Heading title="Create subdomain" />
            <div className="w-full md:w-[500px]">
              <Input
                label=""
                placeholder="username"
                suffix=".pulse.eth"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
              />
            </div>
            <Dialog.Footer
              trailing={
                <Button
                  disabled={!subdomain}
                  onClick={() => registerUser()}
                  colorStyle="blueSecondary"
                  loading={confirmLoading}
                >
                  Confirm
                </Button>
              }
            />
          </>
        )}
      </Dialog>
    </>
  );
}
