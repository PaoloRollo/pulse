"use client";
import { useSmartAccount } from "@/hooks/smart-account-context";
import { publicClient } from "@/lib/viem-client";
import {
  AeroplaneSVG,
  Button,
  Card,
  CheckSVG,
  CounterClockwiseArrowSVG,
  CrossSVG,
  Dialog,
  ExitSVG,
  FlameSVG,
  HeartSVG,
  Input,
  LeftArrowSVG,
  PersonSVG,
  Profile,
  Skeleton,
  SkeletonGroup,
  Tooltip,
} from "@ensdomains/thorin";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { CONSTANTS, PushAPI } from "@pushprotocol/restapi";
import { PushStream } from "@pushprotocol/restapi/src/lib/pushstream/PushStream";
import { BellIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import TinderCard from "react-tinder-card";
import localforage from "localforage";

const db = [
  {
    name: "Richard Hendricks",
    url: "./img/richard.jpg",
  },
  {
    name: "Erlich Bachman",
    url: "./img/erlich.jpg",
  },
  {
    name: "Monica Hall",
    url: "./img/monica.jpg",
  },
  {
    name: "Jared Dunn",
    url: "./img/jared.jpg",
  },
  {
    name: "Dinesh Chugtai",
    url: "./img/dinesh.jpg",
  },
];

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
  const [currentIndex, setCurrentIndex] = useState(db.length - 1);
  const [lastDirection, setLastDirection] = useState();
  const [pushUser, setPushUser] = useState<PushAPI | null>(null);
  const [pushStream, setPushStream] = useState<PushStream | null>(null);
  const [pushStreamConnected, setPushStreamConnected] =
    useState<boolean>(false);
  const [permission, setPermission] = useState<boolean>(false);
  const currentIndexRef = useRef(currentIndex);
  const [showModal, setShowModal] = useState<boolean>(true);
  const [subdomain, setSubdomain] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<number>(0);

  const childRefs = useMemo<any[]>(
    () =>
      Array(db.length)
        .fill(0)
        .map((i) => React.createRef()),
    []
  );

  const updateCurrentIndex = (val: number) => {
    setCurrentIndex(val);
    currentIndexRef.current = val;
  };

  const canGoBack = currentIndex < db.length - 1;

  const canSwipe = currentIndex >= 0;

  // set last direction and decrease current index
  const swiped = (direction: any, nameToDelete: string, index: number) => {
    setLastDirection(direction);
    updateCurrentIndex(index - 1);
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
    if (canSwipe && currentIndex < db.length) {
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

  // useEffect(() => {
  //   const notificationPermission = Notification.permission === "granted";
  //   setPermission(notificationPermission);
  //   console.log(notificationPermission);
  //   if (notificationPermission) subscribeToNotifications();
  // }, []);

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

        // if (!token) {
        //   const messaging = getMessaging(firebaseApp);
        //   const fcmToken = getToken(messaging, {
        //     vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY as string,
        //   });
        //   localforage.setItem("pulse_fcm_token", fcmToken);
        // }

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
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center">
        <Skeleton loading={true}>
          <Card className="h-[250px] w-[250px]"></Card>
        </Skeleton>
        <SkeletonGroup loading={true}>
          <div className="flex items-center absolute bottom-8 space-x-4">
            <Skeleton>
              <Button shape="circle" colorStyle="yellowPrimary">
                <LeftArrowSVG />
              </Button>
            </Skeleton>
            <Skeleton className="rounded-full">
              <Button shape="circle" colorStyle="redPrimary">
                <CrossSVG />
              </Button>
            </Skeleton>
            <Skeleton>
              <Button shape="circle" colorStyle="greenPrimary">
                <CheckSVG />
              </Button>
            </Skeleton>
            <Skeleton>
              <Button shape="circle">
                <FlameSVG />
              </Button>
            </Skeleton>
          </div>
        </SkeletonGroup>
      </div>
    );
  }

  return (
    <>
      <div className="h-screen w-screen flex flex-col items-center justify-center">
        <div className="flex space-x-2 items-center absolute top-4 right-4">
          <Profile
            address={smartAccountAddress}
            className="cursor-pointer hover:-translate-y-0.5 transition-transform"
            dropdownItems={[
              {
                label: "Profile",
                onClick: () =>
                  router.push(`/app/profile/${smartAccountAddress}`),
                icon: <PersonSVG />,
              },
              {
                label: "Chats",
                onClick: () => router.push(`/app/chats`),
                icon: <AeroplaneSVG />,
              },
              {
                label: "Logout",
                onClick: () => logout(),
                icon: <ExitSVG />,
                color: "red",
              },
            ]}
          />
          <Button
            disabled={!pushStream}
            shape="circle"
            onClick={() => {
              !pushStreamConnected && subscribeToNotifications();
            }}
            colorStyle={!pushStreamConnected ? "bluePrimary" : "greenPrimary"}
          >
            <BellIcon />
          </Button>
        </div>
        {db.map((character, index) => (
          <TinderCard
            ref={childRefs[index]}
            className="swipe"
            key={character.name}
            preventSwipe={["down", "up"]}
            swipeRequirementType="position"
            onSwipe={(dir) => swiped(dir, character.name, index)}
            onCardLeftScreen={() => outOfFrame(character.name, index)}
          >
            <Card
              className="h-[250px] w-[250px] flex items-center justify-center"
              id={character.name}
            >
              <h3 className="select-none text-center">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem
                ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum
                dolor sit amet, consectetur adipiscing elit.
              </h3>
            </Card>
          </TinderCard>
        ))}
        <div className="flex items-center absolute bottom-8 space-x-4">
          <Tooltip
            additionalGap={0}
            content={<div className="pr-1">Go back</div>}
            mobilePlacement="top"
            placement="top"
            width={"auto"}
          >
            <Button
              disabled={!canGoBack}
              onClick={() => goBack()}
              shape="circle"
              colorStyle="yellowPrimary"
            >
              <CounterClockwiseArrowSVG />
            </Button>
          </Tooltip>
          <Tooltip
            additionalGap={0}
            content={<div className="pr-1">Skip content</div>}
            mobilePlacement="top"
            placement="top"
            width={"auto"}
          >
            <Button
              onClick={() => swipe("left")}
              shape="circle"
              disabled={!canSwipe}
              colorStyle="redPrimary"
            >
              <CrossSVG />
            </Button>
          </Tooltip>
          <Tooltip
            additionalGap={0}
            content={<div className="pr-1">Like content</div>}
            mobilePlacement="top"
            placement="top"
            width={"auto"}
          >
            <Button
              onClick={() => swipe("right")}
              shape="circle"
              disabled={!canSwipe}
              colorStyle="greenPrimary"
            >
              <CheckSVG />
            </Button>
          </Tooltip>
          <Tooltip
            additionalGap={0}
            content={<div className="pr-1">Love!</div>}
            mobilePlacement="top"
            placement="top"
            width={"auto"}
          >
            <Button
              onClick={() => swipe("up")}
              disabled={!canSwipe}
              shape="circle"
            >
              <HeartSVG className="pr-0.5" />
            </Button>
          </Tooltip>
        </div>
      </div>
      <Dialog
        open={showModal}
        variant="actionable"
        currentStep={currentStep}
        stepCount={2}
        onDismiss={() => {
          setShowModal(true);
        }}
      >
        {currentStep === 0 && (
          <>
            <Dialog.Heading title="Add an existing wallet" />
            <div className="w-full md:w-[500px]">
              <p className="mb-4 text-center">
                We will use the social graph from this wallet to ensure you a
                more customized posts feed.
              </p>
              {!connectedWallet ? (
                <Button
                  colorStyle="blueSecondary"
                  onClick={() => connectWallet()}
                >
                  Connect Wallet
                </Button>
              ) : (
                <Button colorStyle="blueSecondary">
                  {connectedWallet.ens ||
                    connectedWallet.address.slice(0, 8) +
                      "..." +
                      connectedWallet.address.slice(-8)}
                </Button>
              )}
            </div>
            <Dialog.Footer
              trailing={
                <Button onClick={() => setCurrentStep(1)}>Continue</Button>
              }
            />
          </>
        )}
        {currentStep === 1 && (
          <>
            <Dialog.Heading title="Select your pulse.eth subdomain" />
            <div className="w-full md:w-[500px]">
              <Input
                label="Your subdomain"
                placeholder="username"
                suffix=".pulse.eth"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
              />
            </div>
            <Dialog.Footer
              leading={<Button onClick={() => setCurrentStep(0)}>Back</Button>}
              trailing={
                <Button
                  disabled={!subdomain}
                  onClick={() => setShowModal(false)}
                  colorStyle="greenPrimary"
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
