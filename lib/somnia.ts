import { createPublicClient, createWalletClient, http, webSocket, defineChain } from "viem";

export const somniaTestnet = defineChain({
  id: 50311,
  name: "Somnia Testnet",
  network: "somnia-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "STT",
    symbol: "STT",
  },
  rpcUrls: {
    default: {
      http: ["https://dream-rpc.somnia.network"],
      webSocket: ["wss://dream-rpc.somnia.network"],
    },
    public: {
      http: ["https://dream-rpc.somnia.network"],
      webSocket: ["wss://dream-rpc.somnia.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "Somnia Explorer",
      url: "https://explorer.somnia.network",
    },
  },
  testnet: true,
});

export const publicClient = createPublicClient({
  chain: somniaTestnet,
  transport: http(),
});

export const wsClient = createPublicClient({
  chain: somniaTestnet,
  transport: webSocket(),
});

export async function getWalletData(address: `0x${string}`) {
  try {
    const [balance, txCount] = await Promise.all([
      publicClient.getBalance({ address }),
      publicClient.getTransactionCount({ address }),
    ]);

    return {
      address,
      balance: balance.toString(),
      transactionCount: txCount,
    };
  } catch (error) {
    console.error("Failed to fetch wallet data:", error);
    throw error;
  }
}

export async function getRecentTransactions(address: `0x${string}`, limit = 10) {
  try {
    const latestBlock = await publicClient.getBlockNumber();
    const transactions = [];

    for (let i = 0; i < limit && i < 100; i++) {
      const block = await publicClient.getBlock({
        blockNumber: latestBlock - BigInt(i),
        includeTransactions: true,
      });

      const relevantTxs = block.transactions.filter(
        (tx: any) =>
          tx.from?.toLowerCase() === address.toLowerCase() ||
          tx.to?.toLowerCase() === address.toLowerCase()
      );

      transactions.push(...relevantTxs);
      if (transactions.length >= limit) break;
    }

    return transactions.slice(0, limit);
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return [];
  }
}

export async function getNFTBalance(address: `0x${string}`) {
  try {
    return {
      totalNFTs: 0,
      collections: 0,
      nfts: [],
      message: "NFT indexing coming soon",
    };
  } catch (error) {
    console.error("Failed to fetch NFTs:", error);
    return { totalNFTs: 0, collections: 0, nfts: [] };
  }
}

export async function getTokenBalances(address: `0x${string}`) {
  try {
    return {
      tokens: [],
      message: "Token balance indexing coming soon",
    };
  } catch (error) {
    console.error("Failed to fetch tokens:", error);
    return { tokens: [] };
  }
}

export async function getContractInfo(address: `0x${string}`) {
  try {
    const code = await publicClient.getBytecode({ address });
    return {
      address,
      isContract: !!code && code !== "0x",
      bytecode: code,
    };
  } catch (error) {
    console.error("Failed to fetch contract info:", error);
    return { address, isContract: false };
  }
}

export async function getBlockDetails(blockNumber: bigint) {
  try {
    const block = await publicClient.getBlock({
      blockNumber,
      includeTransactions: false,
    });

    return {
      number: block.number?.toString(),
      hash: block.hash,
      timestamp: block.timestamp?.toString(),
      transactionCount: block.transactions.length,
      gasUsed: block.gasUsed?.toString(),
      gasLimit: block.gasLimit?.toString(),
    };
  } catch (error) {
    console.error("Failed to fetch block details:", error);
    throw error;
  }
}
