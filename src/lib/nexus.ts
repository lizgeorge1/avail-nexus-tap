// Polyfill Buffer and process for browser environment
import { Buffer } from 'buffer';
import process from 'process';

if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
  window.process = process;
}

import { NexusSDK } from '@avail-project/nexus-core';

export const sdk = new NexusSDK({ network: 'testnet'});

 
// Thin wrapper that calls sdk.isInitialized() from the SDK
export function isInitialized() {
  return sdk.isInitialized();
}
 
export async function initializeWithProvider(provider: any) {
  if (!provider) throw new Error('No EIP-1193 provider (e.g., MetaMask) found');
  
  //If the SDK is already initialized, return
  if (sdk.isInitialized()) return;
 
  //If the SDK is not initialized, initialize it with the provider passed as a parameter
  await sdk.initialize(provider);
}
 
export async function deinit() {
  
  //If the SDK is not initialized, return
  if (!sdk.isInitialized()) return;
 
  //If the SDK is initialized, de-initialize it
  await sdk.deinit();
}
 
export async function getUnifiedBalances() {

  //Get the unified balances from the SDK
  return await sdk.getUnifiedBalances();
}

// Bridge Functions

import type { BridgeParams } from '@/types/nexus';

/**
 * Simulates a bridge transaction to preview costs and timing
 * @param params - Bridge parameters (token, amount, destination chain)
 * @returns Simulation result with estimated gas, time, and route
 */
export async function simulateBridge(params: BridgeParams) {
  if (!sdk.isInitialized()) {
    throw new Error('SDK not initialized. Please initialize first.');
  }

  return await sdk.simulateBridge(params);
}

/**
 * Executes a bridge transaction to move tokens from source chain(s) to destination
 * @param params - Bridge parameters (token, amount, destination chain, optional source chains)
 * @returns Bridge result with transaction hash and explorer URL
 */
export async function executeBridge(params: BridgeParams) {
  if (!sdk.isInitialized()) {
    throw new Error('SDK not initialized. Please initialize first.');
  }

  return await sdk.bridge(params);
}