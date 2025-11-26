import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ error: 'Build time' }, { status: 503 });
  }

  const { getWalletData, publicClient } = await import('@/lib/somnia');
  
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get('address');

  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
  }

  try {
    const walletData = await getWalletData(address as `0x${string}`);
    const blockNumber = await publicClient.getBlockNumber();
    const balanceInEth = (BigInt(walletData.balance) / BigInt(10 ** 18)).toString();

    return NextResponse.json({
      address: walletData.address,
      balance: walletData.balance,
      balanceFormatted: `${balanceInEth} STT`,
      transactionCount: walletData.transactionCount,
      blockNumber: blockNumber.toString(),
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch Somnia data', message: error.message },
      { status: 500 }
    );
  }
}
