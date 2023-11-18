import { http, createWalletClient } from "viem";
import { baseGoerli } from "viem/chains";

import { privateKeyToAccount } from "viem/accounts";
import { pulseTokenABI } from "@/utils/pulse-token-1155-abi";
import { easOffchainResolver } from "@/utils/eas-offchain-resolver-abi";

interface AttestationRequestData {
  recipient: string; // The recipient of the attestation.
  expirationTime: number; // The time when the attestation expires (Unix timestamp).
  revocable: boolean; // Whether the attestation is revocable.
  refUID: string; // The UID of the related attestation.
  data: string; // Custom attestation data.
  value: number; // An explicit ETH amount to send to the resolver.
}

interface AttestationRequest {
  schema: string; // The unique identifier of the schema.
  data: AttestationRequestData; // The arguments of the attestation request.
}

const privateKey = process.env.PRIVATE_KEY;

if (!privateKey) {
  console.error("Private key not found.");
  process.exit(1);
}

const account = privateKeyToAccount(`0x${privateKey}`);

const client = createWalletClient({
  account,
  chain: baseGoerli,
  transport: http(),
});

async function mintNewPulseToken(
  account: string,
  id: number,
  amount: number,
  newUri: string
) {
  try {
    const mintPulseToken = await client.writeContract({
      address: "0x05c37de132a6a0c12c356bdf7bc5b581405d84b3",
      abi: pulseTokenABI,
      functionName: "mintAndSetUri",
      args: [account, id, amount, "0x", newUri],
    });
  } catch (error) {
    console.error("Error calling mintAndSetUri:", error);
  }
}

async function generateEAS(
  schema: string,
  user: string,
  actionTimestamp: number,
  isSuperlike: boolean,
  action: number
) {
  try {
    const generateAttestation = await client.writeContract({
      address: "0x8b007fe63347077f560252cd3956ea591411eb43",
      abi: easOffchainResolver,
      functionName: "attestUint",
      args: [schema, user, actionTimestamp, isSuperlike, action],
    });
  } catch (error) {
    console.error("Error calling attest:", error);
  }
}
