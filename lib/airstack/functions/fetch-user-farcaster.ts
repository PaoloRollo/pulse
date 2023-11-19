import {gql} from "@apollo/client/core/index.js";
import {fetchPoapsQuery} from "@/lib/airstack/functions/fetch-poaps";
import {fetchQuery} from "@airstack/node";
import {gqlToString} from "@/lib/airstack/utils";

export const fetchUserFarcasterQuery = gql`
query MyQuery($name: Identity!) {
  Socials(
    input: {filter: {identity: {_eq: $name}, dappName: {_eq: farcaster}}, blockchain: ethereum}
  ) {
    Social {
      dappName
      userAddress
    }
  }
}`

export interface FetchUserFarcasterResponse {
    Socials: {
        Social: FarcasterSocial;
    }
}

export interface FarcasterSocial {
    dappName: string;
    userAddress: string;
}

export const fetchFarcasterUserAddress = async (fname: string): Promise<string> => {
    const farcasterUserAddressResponse = await fetchQuery(
        gqlToString(fetchUserFarcasterQuery),
        { name: `fc_fname:${fname}` }
    );
    return farcasterUserAddressResponse.data.Socials.Social[0].userAddress;
};
