import { gql } from '@apollo/client/core/index.js';

import { fetchAllPagesQuery } from '../utils.js';

export const fetchPoapsQuery = gql`
  query MyQuery($address: Identity!) {
    Poaps(input: { filter: { owner: { _eq: $address } }, blockchain: ALL, limit: 50 }) {
      Poap {
        id
        eventId
        tokenId
        tokenAddress
        tokenUri
        poapEvent {
          id
          eventId
          metadata
          contentType
          contentValue {
            image {
              extraSmall
              small
              medium
              large
              original
            }
            video
            audio
            animation_url {
              original
            }
          }
          eventName
          description
          country
          city
          startDate
          endDate
          isVirtualEvent
          eventURL
        }
        attendee {
          totalPoapOwned
        }
      }
      pageInfo {
        prevCursor
        nextCursor
      }
    }
  }
`;

interface PoapsResponse {
    Poaps: {
        Poap: Poap[];
        pageInfo: PageInfo;
    };
}

interface Poap {
    id: string;
    eventId: string;
    tokenId: string;
    tokenAddress: string;
    tokenUri: string;
    poapEvent: PoapEvent;
    attendee: Attendee;
}

interface PoapEvent {
    id: string;
    eventId: string;
    metadata: Metadata;
    contentType: string;
    contentValue: ContentValue;
    eventName: string;
    description: string;
    country: string;
    city: string;
    startDate: string;
    endDate: string;
    isVirtualEvent: boolean;
    eventURL: string;
}

interface Metadata {
    attributes: Attribute[];
    description: string;
    external_url: string;
    home_url: string;
    image_url: string;
    name: string;
    tags: string[];
    year: number;
}

interface Attribute {
    trait_type: string;
    value: string | boolean | number;
}

interface ContentValue {
    image?: ImageSizes;
    video?: string | null;
    audio?: string | null;
    animation_url?: AnimationUrl | null;
}

interface ImageSizes {
    extraSmall: string;
    small: string;
    medium: string;
    large: string;
    original: string;
}

interface AnimationUrl {
    original: string;
}

interface Attendee {
    totalPoapOwned: number;
}

// If you have a pageInfo structure as well, define it here
interface PageInfo {
    prevCursor?: string;
    nextCursor?: string;
}

export const fetchPoaps = async (address: string): Promise<Poap[]> => {
    const poapsResponse = await fetchAllPagesQuery<PoapsResponse>(fetchPoapsQuery, { address });
    return poapsResponse.flatMap((p) => p.Poaps.Poap);
};
