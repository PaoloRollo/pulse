import dynamic from "next/dynamic";

const ProfilePageComponent = dynamic(
  () => import("@/components/pages/profile-page"),
  {
    ssr: false,
  }
);

export default function ProfilePage({
  params: { profileAddress },
}: {
  params: { profileAddress: string };
}) {
  return <ProfilePageComponent profileAddress={profileAddress} />;
}
