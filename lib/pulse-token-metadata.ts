import { NFTStorage, File } from "nft.storage";
import * as fs from "fs";
import * as cheerio from "cheerio";

interface DynamicSVGParameters {
  username: string;
  handle: string;
  preview: string;
  platform: string;
}

// Read the API key from an environment variable. You'll need to set this before running the example!
const API_KEY: string | undefined = process.env.NFTSTORAGE_PRIVATE_KEY;

async function getDynamicSVGImage(params: DynamicSVGParameters): Promise<Blob> {
  // Read the SVG template from a local file
  const svgTemplatePath = "../utils/Text.svg";
  const svgTemplate = fs.readFileSync(svgTemplatePath, "utf-8");

  // Load the SVG template using Cheerio
  const $ = cheerio.load(svgTemplate, { xmlMode: true });

  // Modify SVG elements based on input parameters
  $("text#\\@handle tspan").text(params.handle);
  $("text#username tspan").text(params.username);
  $("text#Lorem\\ ipsum\\ dolor\\ sit\\ amet\\ consectetur.\\ Sit\\ cras\\ porta\\ sed\\ nam\\ tristique\\ volutpat.\\ Id\\ vel\\ ipsum\\ morbi\\ purus\\ varius.\\ Mattis\\ vel\\ malesuada\\ eget\\ duis. tspan").text(params.preview);
  $("text#Farcaster tspan").text(params.platform);

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

// Example usage
const exampleParams: DynamicSVGParameters = {
  username: "JohnDoe",
  handle: "@john_doe",
  preview: "This is a preview text.",
  platform: "Twitter",
};

storeExampleNFT(exampleParams).then(res=>{console.log(res, "res")})