import Image from "next/image";

export default function LoadingPage() {
  return (
    <div className="h-screen w-screen bg-[#EEF5FF] flex flex-col items-center justify-center">
      <Image
        src={"/logo-pulse.svg"}
        alt="Pulse logo"
        height={40}
        width={40}
        className="animate-pulse"
      />
    </div>
  );
}
