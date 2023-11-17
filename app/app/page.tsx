import dynamic from "next/dynamic";

const AppPageComponent = dynamic(() => import("@/components/pages/app-page"), {
  ssr: false,
});

export default function AppPage() {
  return <AppPageComponent />;
}
