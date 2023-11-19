"use client";
import { ThorinGlobalStyles, lightTheme } from "@ensdomains/thorin";
import { baseGoerli } from "wagmi/chains";
import { useRouter } from "next/navigation";
import { SmartAccountProvider } from "@/hooks/smart-account-context";
import { PrivyProvider } from "@privy-io/react-auth";
import { ThemeProvider } from "styled-components";
import { PrivyWagmiConnector } from "@privy-io/wagmi-connector";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { configureChains } from "wagmi";
import { init } from "@airstack/airstack-react";
import StyledComponentsRegistry from "./styled-components-registry";

init(process.env.NEXT_PUBLIC_AIRSTACK_API_KEY as string);

const configureChainsConfig = configureChains(
  [baseGoerli],
  [
    alchemyProvider({
      apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY as string,
    }),
  ]
);

export default function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      config={{
        loginMethods: ["email", "google", "github", "apple"],
        appearance: {
          theme: "light",
        },
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
          noPromptOnSignature: true,
        },
        defaultChain: baseGoerli,
      }}
      onSuccess={(user, isNewUser) => {
        router.push("/app");
      }}
    >
      <PrivyWagmiConnector wagmiChainsConfig={configureChainsConfig}>
        <SmartAccountProvider>
          <StyledComponentsRegistry>
            <ThemeProvider theme={lightTheme}>
              <ThorinGlobalStyles />
              {children}
            </ThemeProvider>
          </StyledComponentsRegistry>
        </SmartAccountProvider>
      </PrivyWagmiConnector>
    </PrivyProvider>
  );
}
