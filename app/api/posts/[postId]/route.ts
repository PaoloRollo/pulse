import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Address, encodePacked, keccak256 } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { CONSTANTS, PushAPI } from "@pushprotocol/restapi";
import { ethers } from "ethers";
import { LensClient, production } from "@lens-protocol/client";
import { fetchFarcasterUserAddress } from "@/lib/airstack/functions/fetch-user-farcaster";

export async function POST(
  req: NextRequest,
  params: { params: { postId: string } }
) {
  const { postId } = params.params;
  const { address, reaction, notificationAddress } = await req.json();

  if (!["GO_BACK", "LIKE", "FIRE", "SKIP"].includes(reaction)) {
    return Response.json({ error: "invalid reaction." }, { status: 400 });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_KEY as string
  );

  const { data: dbReaction } = await supabase
    .from("reactions")
    .select("*")
    .eq("address", address)
    .eq("content_id", postId)
    .single();

  if (dbReaction) {
    await supabase.from("reactions").delete().eq("id", dbReaction.id);
  }

  await supabase.from("reactions").insert([
    {
      address,
      content_id: postId,
      reaction,
    },
  ]);

  if (reaction === "FIRE") {
    const [{ data: content }, { count }] = await Promise.all([
      supabase
        .from("unified_posts")
        .select("*")
        .eq(
          "content_id:unified_posts!inner(content_id,author_id, source)",
          postId
        )
        .single(),
      supabase
        .from("reactions")
        .select("id", { count: "exact", head: true })
        .eq("content_id", postId)
        .eq("reaction", "FIRE"),
    ]);
    console.log(count, content);
    if (count && content) {
      let authorAddress: string;
      if (content.source === "Lens") {
        const lensClient = new LensClient({
          environment: production,
        });
        const profileById = await lensClient.profile.fetch({
          forProfileId: content.author_id,
        });
        authorAddress = profileById?.ownedBy.address!;
      } else {
        authorAddress = await fetchFarcasterUserAddress(content.author_id);
      }
      console.log(authorAddress);
      const account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`);

      const easData = encodePacked(
        ["string", "address", "uint256"],
        [postId, authorAddress as Address, BigInt(count)]
      );

      const nonHashed = encodePacked(
        ["address", "uint256", "bytes"],
        [address, BigInt(count), easData]
      );

      const message = keccak256(nonHashed);

      const signature = await account.signMessage({
        message,
      });

      console.log(easData, message, nonHashed, signature);

      const signer = new ethers.Wallet(process.env.PRIVATE_KEY as string);

      const pushAPI = await PushAPI.initialize(signer, {
        env: CONSTANTS.ENV.STAGING,
      });

      const pushProtocolResponse = await pushAPI.channel.send(
        [`eip155:11155111:${notificationAddress}`],
        {
          notification: {
            title: "New NFT minted!",
            body: "You just minted a new NFT!",
          },
        }
      );

      console.log(pushProtocolResponse);

      return Response.json(
        { easData, signature, count, nonHashed },
        { status: 200 }
      );
    }
  }

  return Response.json({ result: "ok" }, { status: 200 });
}
