import { ethers } from "ethers"
import { encodeFunctionData, formatUnits, parseUnits, createPublicClient, http, getContract, createWalletClient } from "viem"
import { Chain, WalletClient } from "wagmi"
import { baseGoerli } from 'viem/chains'
import { PULSE_TOKEN_ABI } from '../utils/pulseTokenABI'
import { privateKeyToAccount } from 'viem/accounts' 

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