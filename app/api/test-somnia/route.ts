import { NextResponse } from 'next/server';
import { publicClient, getWalletData, somniaTestnet } from '@/lib/somnia';

export async function GET() {
  try {
    const blockNumber = await publicClient.getBlockNumber();
    
    const testAddress = '0x0000000000000000000000000000000000000000';
    const walletData = await getWalletData(testAddress as `0x${string}`);

    return NextResponse.json({
      success: true,
      message: 'Somnia connection successful',
      chain: {
        id: somniaTestnet.id,
        name: somniaTestnet.name,
        rpcUrl: somniaTestnet.rpcUrls.default.http[0],
      },
      latestBlock: blockNumber.toString(),
      testWallet: {
        address: testAddress,
        balance: walletData.balance,
        txCount: walletData.transactionCount,
      },
    });
  } catch (error: any) {
    console.error('Somnia test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
