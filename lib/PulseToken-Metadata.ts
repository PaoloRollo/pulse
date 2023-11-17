import { NFTStorage, File } from 'nft.storage';

// Read the API key from an environment variable. You'll need to set this before running the example!
const API_KEY: string | undefined = process.env.NFTSTORAGE_PRIVATE_KEY;

// TBD
async function getExampleImage(): Promise<Blob> {
  const imageOriginUrl = "https://user-images.githubusercontent.com/87873179/144324736-3f09a98e-f5aa-4199-a874-13583bf31951.jpg";
  const r = await fetch(imageOriginUrl);
  if (!r.ok) {
    throw new Error(`Error fetching image: [${r.status}]: ${r.statusText}`);
  }
  return r.blob();
}

async function storeExampleNFT(): Promise<void> {
  if (!API_KEY) {
    throw new Error('NFT_STORAGE_API_KEY is not set.');
  }

  const image = await getExampleImage();

  const nft = {
    image: new File([image], 'example.jpg', { type: 'image/jpeg' }), 
    name: "Storing the World's Most Valuable Virtual Assets with NFT.Storage",
    description: "The metaverse is here. Where is it all being stored?",
    properties: {
      type: "blog-post",
      origins: {
        http: "https://blog.nft.storage/posts/2021-11-30-hello-world-nft-storage/",
        ipfs: "ipfs://bafybeieh4gpvatp32iqaacs6xqxqitla4drrkyyzq6dshqqsilkk3fqmti/blog/post/2021-11-30-hello-world-nft-storage/"
      },
      authors: [{ name: "David Choi" }],
      content: {
        "text/markdown": "The last year has witnessed the explosion of NFTs onto the world’s mainstage. From fine art to collectibles to music and media, NFTs are quickly demonstrating just how quickly grassroots Web3 communities can grow, and perhaps how much closer we are to mass adoption than we may have previously thought. <... remaining content omitted ...>"
      }
    }
  };

  const client = new NFTStorage({ token: API_KEY });
  const metadata = await client.store(nft);

  console.log('NFT data stored!');
  console.log('Metadata URI: ', metadata.url);
}

storeExampleNFT();
