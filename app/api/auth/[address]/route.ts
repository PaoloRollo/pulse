import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(
  req: NextRequest,
  params: { params: { address: string } }
) {
  const { address } = params.params;
  const supabase = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_KEY as string
  );

  const { data } = await supabase
    .from("records")
    .select("*")
    .eq("owner", address)
    .single();

  if (!data) {
    return Response.json({ ens: "" }, { status: 200 });
  }

  return Response.json({ ens: data.name }, { status: 200 });
}
