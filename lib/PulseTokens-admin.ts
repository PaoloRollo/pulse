import { ethers } from "ethers"
import { encodeFunctionData, formatUnits, parseUnits, createPublicClient, http, getContract, createWalletClient, parseAbi, encodeAbiParameters } from "viem"
import { Chain, WalletClient } from "wagmi"
import { baseGoerli } from 'viem/chains'
import { PULSE_TOKEN_ABI } from '../utils/pulseTokenABI'
import {  EAS_ABI } from '../utils/EAS'

import { privateKeyToAccount } from 'viem/accounts' 

interface AttestationRequestData {
    recipient: string; // The recipient of the attestation.
    expirationTime: number; // The time when the attestation expires (Unix timestamp).
    revocable: boolean; // Whether the attestation is revocable.
    refUID: string; // The UID of the related attestation.
    data: string; // Custom attestation data.
    value: number; // An explicit ETH amount to send to the resolver.
}

interface AttestationRequest {
    schema: string; // The unique identifier of the schema.
    data: AttestationRequestData; // The arguments of the attestation request.
}


const privateKey = process.env.PRIVATE_KEY;

if (!privateKey) {
    console.error('Private key not found.');
    process.exit(1); 
}

const account = privateKeyToAccount(`0x${privateKey}`);

const client = createWalletClient({
    account,
    chain: baseGoerli,
    transport: http()
})

async function mintNewPulseToken(account: string, id: number, amount: number, newUri: string) {
    try {
        const mintPulseToken = await client.writeContract({
            address: '0x21e05e48ba21bf38464f70c0618cececfc4c6310',
            abi: PULSE_TOKEN_ABI,
            functionName: 'mintAndSetUri',
            args: [account, id, amount, "0x", newUri],
        });

    } catch (error) {
        console.error('Error calling mintAndSetUri:', error);
    }
}

async function generateEAS(schema: string, account: string, data: string ) {
    const attestationRequest: AttestationRequest = {
        schema: schema,
        data: {
            recipient: account,
            expirationTime: 0,
            revocable: false,
            refUID: "",
            data: data, 
            value: 0, 
        },
    };
    try {
        const generateAttestation = await client.writeContract({
            address: '0x4200000000000000000000000000000000000021',
            abi: EAS_ABI,
            functionName: 'attest',
            args: [attestationRequest],
        });

    } catch (error) {
        console.error('Error calling attest:', error);
    }
}