import { Profile, Skeleton, SkeletonGroup } from "@ensdomains/thorin";
import Image from "next/image";

export default function LoadingNavbar() {
  return (
    <SkeletonGroup loading>
      <div className="w-full flex items-center justify-between px-6 py-3 border border-b-1">
        <Skeleton>
          <Image
            src={"/logo-pulse.svg"}
            alt="Pulse logo"
            height={40}
            width={40}
          />
        </Skeleton>
        <Skeleton>
          <Profile
            address={""}
            className="cursor-pointer hover:-translate-y-0.5 transition-transform"
          />
        </Skeleton>
      </div>
    </SkeletonGroup>
  );
}
