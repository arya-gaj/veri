import { NextRequest } from "next/server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return new Response('Build time - stream not available', { status: 503 });
  }

  const { wsClient } = await import("@/lib/somnia");
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const initMessage = {
          type: "stream_init",
          message: "Oz Oracle: Connected to Somnia blockchain stream.",
          timestamp: Date.now(),
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(initMessage)}\n\n`));

        const unwatch = wsClient.watchBlocks({
          onBlock: async (block) => {
            try {
              const blockData = {
                type: "new_block",
                blockNumber: Number(block.number),
                timestamp: Number(block.timestamp),
                transactions: block.transactions.length,
                gasUsed: block.gasUsed?.toString(),
                hash: block.hash,
              };

              controller.enqueue(encoder.encode(`data: ${JSON.stringify(blockData)}\n\n`));
            } catch (error) {
              console.error("Block processing error:", error);
            }
          },
          onError: (error) => {
            console.error("Block watch error:", error);
          },
        });

        const keepAlive = setInterval(() => {
          const ping = {
            type: "ping",
            timestamp: Date.now(),
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(ping)}\n\n`));
        }, 30000);

        request.signal.addEventListener("abort", () => {
          clearInterval(keepAlive);
          unwatch();
          controller.close();
        });
      } catch (error) {
        console.error("Stream error:", error);
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Powered-By": "Oz-Oracle",
    },
  });
}