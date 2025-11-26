import { NextRequest, NextResponse } from "next/server";
import {
  getWalletData,
  getRecentTransactions,
  getNFTBalance,
  getTokenBalances,
  getBlockDetails,
  publicClient,
} from "@/lib/somnia";
import { parseNaturalLanguage, generateSummary, generateGeneralResponse } from "@/lib/nlp";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { query, walletAddress } = await request.json();

    console.log('Received query:', { query, walletAddress });

    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      console.log('Invalid wallet address:', walletAddress);
      return NextResponse.json({
        summary: "Oz Oracle: Please provide a valid wallet address to query Somnia blockchain data.",
        verified: false,
      }, { status: 400 });
    }

    const parsedQuery = await parseNaturalLanguage(query);
    
    let summary = "";
    let rawData: any = {};

    // Handle general knowledge queries without blockchain calls
    if (parsedQuery.intent === "general_knowledge") {
      summary = await generateGeneralResponse(query);
      return NextResponse.json({
        summary,
        verified: false,
        glindaGlorified: true,
        parsedQuery,
      });
    }

    const latestBlock = await publicClient.getBlockNumber();

    switch (parsedQuery.intent) {
      case "balance":
        const walletData = await getWalletData(walletAddress as `0x${string}`);
        const balanceInEth = (BigInt(walletData.balance) / BigInt(10 ** 18)).toString();
        
        const balanceData = {
          ...walletData,
          balanceFormatted: `${balanceInEth} STT`,
          walletShort: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
          hasBalance: parseFloat(balanceInEth) > 0,
          hasTransactions: walletData.transactionCount > 0,
        };
        
        summary = await generateSummary(balanceData, "balance", walletAddress, query);
        rawData = balanceData;
        break;

      case "transactions":
        const recentTxs = await getRecentTransactions(walletAddress as `0x${string}`);
        
        const txData = {
          transactions: recentTxs,
          count: recentTxs.length,
          hasTransactions: recentTxs.length > 0,
          walletShort: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
          latestTx: recentTxs[0]?.hash,
        };
        
        summary = await generateSummary(txData, "transactions", walletAddress, query);
        rawData = txData;
        break;

      case "nfts":
        const nftData = await getNFTBalance(walletAddress as `0x${string}`);
        summary = await generateSummary(nftData, "nfts", walletAddress, query);
        rawData = nftData;
        break;

      case "tokens":
        const tokenData = await getTokenBalances(walletAddress as `0x${string}`);
        summary = await generateSummary(tokenData, "tokens", walletAddress, query);
        rawData = tokenData;
        break;

      case "blocks":
        const blockDetails = await getBlockDetails(latestBlock);
        summary = await generateSummary(blockDetails, "blocks", walletAddress, query);
        rawData = blockDetails;
        break;

      default:
        const overviewData = await getWalletData(walletAddress as `0x${string}`);
        const overviewBalance = (BigInt(overviewData.balance) / BigInt(10 ** 18)).toString();
        
        const overviewEnhanced = {
          ...overviewData,
          balanceFormatted: `${overviewBalance} STT`,
          walletShort: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
        };
        
        summary = await generateSummary(overviewEnhanced, "overview", walletAddress, query);
        rawData = overviewEnhanced;
    }

    return NextResponse.json({
      summary,
      verified: true,
      proof: {
        blockNumber: Number(latestBlock),
        timestamp: new Date().toISOString(),
        rawData,
      },
      parsedQuery,
    });

  } catch (error: any) {
    console.error("Query error:", error);
    return NextResponse.json(
      {
        summary: "Oz Oracle: Connection error occurred. Please try again.",
        verified: false,
      },
      { status: 500 }
    );
  }
}
