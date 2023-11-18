import { NFTStorage, File } from "nft.storage";
import * as fs from "fs";
import * as cheerio from "cheerio";

interface DynamicSVGParameters {
  width: number;
  height: number;
  avatarUrl: string;
  textPreview: string;
  authorHandle: string;
  // Add other parameters as needed
}

// Read the API key from an environment variable. You'll need to set this before running the example!
const API_KEY: string | undefined = process.env.NFTSTORAGE_PRIVATE_KEY;

/*
async function getExampleImage(): Promise<Blob> {
  const imageOriginUrl = "https://user-images.githubusercontent.com/87873179/144324736-3f09a98e-f5aa-4199-a874-13583bf31951.jpg";
  const r = await fetch(imageOriginUrl);
  if (!r.ok) {
    throw new Error(`Error fetching image: [${r.status}]: ${r.statusText}`);
  }
  return r.blob();
}*/

async function getDynamicSVGImage(params: DynamicSVGParameters): Promise<Blob> {
  // Read the SVG template from a local file
  const svgTemplatePath = "../utils/NFT-template.svg";
  const svgTemplate = fs.readFileSync(svgTemplatePath, "utf-8");

  // Load the SVG template using Cheerio
  const $ = cheerio.load(svgTemplate, { xmlMode: true });

  // Modify SVG elements based on input parameters
  $("text.preview").text(params.textPreview);
  $("text.author-handle").text(params.authorHandle);
  // Add logic to replace other elements like avatar, etc.

  // Convert the modified SVG element to a string
  const modifiedSvgString = $.xml();

  // Convert the SVG string to Blob
  const blob = new Blob([modifiedSvgString], { type: "image/svg+xml" });

  return blob;
}

async function storeExampleNFT(params: DynamicSVGParameters): Promise<void> {
  if (!API_KEY) {
    throw new Error("NFT_STORAGE_API_KEY is not set.");
  }

  const image = await getDynamicSVGImage(params);

  const nft = {
    image: new File([image], "example.jpg", { type: "image/jpeg" }),
    name: "Storing the Pulse NFT superlike content with NFT.Storage",
    description: "Pulse NFT representing a superlike content",
    properties: {
      type: "content-post",
      authors: [{ name: "Pulse" }],
      content: {
        "text/markdown":
          "This is the Pulse content minted by an user through a superlike action.",
      },
    },
  };

  const client = new NFTStorage({ token: API_KEY });
  const metadata = await client.store(nft);

  console.log("NFT data stored!");
  console.log("Metadata URI: ", metadata.url);
}
