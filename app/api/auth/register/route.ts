import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { pulseTokenABI } from "@/utils/pulse-token-1155-abi";
import { createPublicClient, http, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseGoerli } from "viem/chains";
import { NFT_ADDRESS } from "@/lib/constants";

export async function POST(req: NextRequest) {
  const { address, subdomain } = await req.json();

  const supabase = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_KEY as string
  );

  const { data: record } = await supabase
    .from("records")
    .select("*")
    .eq("owner", address)
    .single();

  if (record) {
    return Response.json(
      { error: "subdomain already exists." },
      { status: 400 }
    );
  }

  await supabase.from("records").insert([
    {
      owner: address,
      name: subdomain,
      addresses: {
        "60": address,
      },
    },
  ]);

  const account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`);
  const publicClient = createPublicClient({
    chain: baseGoerli,
    transport: http(),
  });
  const walletClient = createWalletClient({
    account,
    chain: baseGoerli,
    transport: http(),
  });

  const result = await publicClient.readContract({
    account,
    address: NFT_ADDRESS,
    abi: pulseTokenABI,
    functionName: "authorizedUsers",
    args: [address],
  });

  if (!result) {
    const { request } = await publicClient.simulateContract({
      account,
      address: NFT_ADDRESS,
      abi: pulseTokenABI,
      functionName: "authorizeUser",
      args: [address, true],
    });

    await walletClient.writeContract(request);
  }

  return Response.json({ result: "ok" }, { status: 200 });
}
