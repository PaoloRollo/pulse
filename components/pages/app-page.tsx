"use client";
import { useSmartAccount } from "@/hooks/smart-account-context";
import {
  Button,
  Card,
  CheckSVG,
  CrossSVG,
  ExitSVG,
  FlameSVG,
  LeftArrowSVG,
  Profile,
  Skeleton,
  SkeletonGroup,
} from "@ensdomains/thorin";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import TinderCard from "react-tinder-card";

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
  const { ready, authenticated, user, logout } = usePrivy();
  const {
    smartAccountAddress,
    smartAccountProvider,
    sendSponsoredUserOperation,
    eoa,
  } = useSmartAccount();
  const [currentIndex, setCurrentIndex] = useState(db.length - 1);
  const [lastDirection, setLastDirection] = useState();
  // used for outOfFrame closure
  const currentIndexRef = useRef(currentIndex);

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

  // If the user is not authenticated, redirect them back to the landing page
  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

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
            onClick={() => {
              router.push(`/app/profile/${smartAccountAddress}`);
            }}
            // ensName="frontend.ens.eth"
          />
          <Button
            colorStyle="redSecondary"
            shape="circle"
            onClick={() => logout()}
          >
            <ExitSVG />
          </Button>
        </div>
        {db.map((character, index) => (
          <TinderCard
            ref={childRefs[index]}
            className="swipe"
            key={character.name}
            preventSwipe={["down", "up"]}
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
          <Button
            disabled={!canGoBack}
            onClick={() => goBack()}
            shape="circle"
            colorStyle="yellowPrimary"
          >
            <LeftArrowSVG />
          </Button>
          <Button
            onClick={() => swipe("left")}
            shape="circle"
            disabled={!canSwipe}
            colorStyle="redPrimary"
          >
            <CrossSVG />
          </Button>
          <Button
            onClick={() => swipe("right")}
            shape="circle"
            disabled={!canSwipe}
            colorStyle="greenPrimary"
          >
            <CheckSVG />
          </Button>
          <Button
            onClick={() => swipe("up")}
            disabled={!canSwipe}
            shape="circle"
          >
            <FlameSVG />
          </Button>
        </div>
      </div>
    </>
  );
}
