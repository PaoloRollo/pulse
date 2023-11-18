import { gql } from '@apollo/client/core/index.js';

import { fetchAllPagesQuery } from '../utils.js';

const GetUserSocials = gql`
  query GetUserSocials($addresses: [Identity!]) {
    Socials(input: { filter: { identity: { _in: $addresses } }, blockchain: ethereum }) {
      Social {
        userAddress
        dappName
        profileName
        profileImage
        profileDisplayName
        profileBio
      }
    }
  }
`;

export interface SocialsResponse {
    Socials: {
        Social: Social[];
    };
}

export interface Social {
    userAddress: string;
    dappName: string;
    profileName: string;
    profileImage: string;
    profileDisplayName: string;
    profileBio: string;
    userId: string;
}

export const fetchAddressSocialProfiles = async (address: string): Promise<Social[]> => {
    const socialsResponse = await fetchAllPagesQuery<SocialsResponse>(GetUserSocials, { addresses: [address] });
    return socialsResponse.flatMap((s) => s.Socials.Social);
};
