import dynamic from "next/dynamic";

const LandingPageComponent = dynamic(
  () => import("@/components/pages/landing-page"),
  {
    ssr: false,
  }
);

export default function LandingPage() {
  return <LandingPageComponent />;
}
