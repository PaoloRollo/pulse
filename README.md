# Pulse - Social App README

Pulse is a revolutionary mobile-first social client leveraging Lens and Farcaster frameworks. This Next.js application boasts a dynamic recommendation engine, tailoring your feed based on your interactions within the app and activities on Lens and Farcaster platforms, along with POAPS (Proof of Attendance Protocol Tokens) collected.

## Overview

Pulse presents a unique user experience, drawing inspiration from the intuitive swiping gestures of popular apps like Tinder. The app challenges conventional scrolling behaviors, providing three primary interaction modes:

- **Swipe left:** Skip content that doesn't match your interests.
- **Swipe right:** Like content that resonates with you.
- **Swipe up:** Super like and mint on-chain NFTs based on the content you highly appreciate.

## Goal and Focus

The primary goal of Pulse is to curate a user-specific feed, emphasizing quality content over quantity. By analyzing user engagement patterns and preferences, the app aims to offer a slower-paced and more curated content consumption experience.

## Unique Features

Pulse distinguishes itself by implementing innovative strategies:

- **Anonymized Feed:** Initially hides the authors of posts, fostering unbiased opinions over the influence of popular content creators.
- **Reveal Authors via Interaction:** Authors are revealed upon user interaction (liking content or minting NFTs), promoting a more conscious approach to social engagement.

## Getting Started

To run the Pulse app locally:

1. Clone this repository.
2. Install dependencies using `bun install`.
3. Copy the env file example using `cp .env.example .env`.
4. Populate the env file
5. Start the development server using `bun run dev`.

## Technologies Used

Pulse is built using the following technologies:

- Next.js
- Lens Framework
- Farcaster Framework

## Other repositories

- [pulse-push-subgraph-webhook](https://github.com/PaoloRollo/pulse-push-subgraph-webhook) - "webhook"-like system based on Push Protocol and TheGraph for creating NFT metadata, uploading it to NFT.Storage and updating NFTs URI. Everything asynchronously;
- [pulse-subgraph](https://github.com/PaoloRollo/pulse-subgraph) - TheGraph subgraph for Pulse;
- [ens-supabase-cf-gateway](https://github.com/PaoloRollo/ens-supabase-cf-gateway) - Cloudflare Worker for ENS Offchain resolution and Supabase integration;
- [rec-engine](https://github.com/pulse-social/rec-engine) - Recommendation Engine for Pulse.
