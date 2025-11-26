import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export interface ParsedQuery {
  intent: string;
  entities: string[];
  filters: string[];
  timeRange?: string;
  limit?: number;
}

export async function parseNaturalLanguage(query: string): Promise<ParsedQuery> {
  if (openai) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a blockchain query parser. Convert natural language questions into structured queries.
Return JSON with: intent (balance|transactions|nfts|tokens|contracts|overview), entities (addresses, token names), filters (wallet|tx|nft|contract), timeRange (24h|7d|30d|all), limit (number).`,
          },
          {
            role: "user",
            content: query,
          },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      });

      const parsed = JSON.parse(completion.choices[0].message.content || "{}");
      return {
        intent: parsed.intent || "overview",
        entities: parsed.entities || [],
        filters: parsed.filters || [],
        timeRange: parsed.timeRange,
        limit: parsed.limit || 10,
      };
    } catch (error) {
      console.error("OpenAI parsing failed, using fallback:", error);
    }
  }

  const queryLower = query.toLowerCase();
  const parsed: ParsedQuery = {
    intent: "overview",
    entities: [],
    filters: [],
    limit: 10,
  };

  // Check for general knowledge queries first (before wallet queries)
  if (queryLower.match(/what is|tell me about|explain|how does|how do|what are|define|describe/)) {
    parsed.intent = "general_knowledge";
    return parsed;
  }
  
  // Also catch question words without wallet context
  if (queryLower.match(/why|when|where/) && !queryLower.match(/my|i have|show|get/)) {
    parsed.intent = "general_knowledge";
    return parsed;
  }

  // Wallet-specific queries
  if (queryLower.match(/balance|how much|worth|value/)) {
    parsed.intent = "balance";
  } else if (queryLower.match(/nft|collectible|token id|erc721|erc1155/) && !queryLower.match(/what is|explain/)) {
    parsed.intent = "nfts";
  } else if (queryLower.match(/token|erc20|holdings|asset/) && !queryLower.match(/what is|explain/)) {
    parsed.intent = "tokens";
  } else if (queryLower.match(/transaction|tx|transfer|sent|received|activity/)) {
    parsed.intent = "transactions";
  } else if (queryLower.match(/contract|deploy|interact|call/)) {
    parsed.intent = "contracts";
  } else if (queryLower.match(/block|timestamp|when|date/) && !queryLower.match(/what is|explain/)) {
    parsed.intent = "blocks";
  }

  if (queryLower.match(/today|24 hour|last day/)) {
    parsed.timeRange = "24h";
  } else if (queryLower.match(/week|7 day/)) {
    parsed.timeRange = "7d";
  } else if (queryLower.match(/month|30 day/)) {
    parsed.timeRange = "30d";
  }

  // Extract limit
  const limitMatch = queryLower.match(/(\d+)\s*(transaction|nft|token)/);
  if (limitMatch) {
    parsed.limit = parseInt(limitMatch[1]);
  }

  return parsed;
}

export async function generateGeneralResponse(query: string): Promise<string> {
  const queryLower = query.toLowerCase();

  // Somnia-specific questions
  if (queryLower.match(/somnia/)) {
    if (queryLower.match(/testnet/)) {
      return "The Somnia testnet is your practice ground in the Emerald City, where developers can deploy and test smart contracts without risking real assets. It uses STT as its native token, perfect for experimenting before the grand mainnet performance.";
    }
    if (queryLower.match(/mainnet/)) {
      return "Somnia mainnet is the production blockchain where real value flows through the Emerald City. Unlike the testnet practice grounds, mainnet transactions involve actual assets and are permanent on the yellow brick road.";
    }
    if (queryLower.match(/stt|token/)) {
      return "STT is the native token of Somnia, the currency that powers the Emerald City. It's used for transaction fees, smart contract execution, and as the fundamental unit of value in the Somnia ecosystem.";
    }
    if (queryLower.match(/speed|fast|performance|tps/)) {
      return "Somnia is designed for high-performance with exceptional transaction speeds, allowing thousands of transactions per second. The Emerald City processes your requests faster than Dorothy's tornado travels.";
    }
    if (queryLower.match(/evm|compatible/)) {
      return "Somnia is EVM-compatible, meaning smart contracts from Ethereum work seamlessly here. Developers can bring their existing spells and enchantments from other chains to the Emerald City.";
    }
    return "Somnia is a high-performance blockchain network, the Emerald City of decentralized applications. Built for scalability and speed, it welcomes developers to create magic on the yellow brick road.";
  }

  // Blockchain basics
  if (queryLower.match(/blockchain/)) {
    if (queryLower.match(/how|work/)) {
      return "A blockchain is like an enchanted ledger that records every transaction across multiple wizards' towers. Each block contains transaction data and is cryptographically linked to the previous one, creating an unbreakable chain of truth.";
    }
    if (queryLower.match(/decentralized/)) {
      return "Decentralization means no single wizard controls the Emerald City. Instead, many validators work together to verify transactions, ensuring no one can manipulate the truth or rewrite history.";
    }
    if (queryLower.match(/consensus/)) {
      return "Consensus is how all the wizards in the network agree on what's true. Through cryptographic magic and economic incentives, they collectively verify each transaction on the yellow brick road.";
    }
    return "A blockchain is a distributed ledger where transactions are recorded in blocks and linked together cryptographically. Think of it as the Emerald City's permanent record book, visible to all but changeable by none.";
  }

  // Gas and fees
  if (queryLower.match(/gas|fee/)) {
    if (queryLower.match(/why|purpose/)) {
      return "Gas fees are the price of magic in the Emerald City. They compensate validators for processing your transactions and prevent spam by making each action cost something, ensuring the network stays efficient.";
    }
    if (queryLower.match(/calculate|determine/)) {
      return "Gas fees are calculated by multiplying gas units (computational work) by gas price (what you're willing to pay). Complex spells require more gas, while simple transfers need less magic.";
    }
    if (queryLower.match(/high|expensive/)) {
      return "Gas fees rise when many travelers crowd the yellow brick road. During peak times, you can pay more to skip ahead in line, or wait patiently for the crowd to thin.";
    }
    return "Gas fees are transaction costs paid to validators for processing and securing your journey through the blockchain. Higher gas prices typically result in faster confirmation, like paying for express delivery in the Emerald City.";
  }

  // NFTs
  if (queryLower.match(/nft/)) {
    if (queryLower.match(/how|work/)) {
      return "NFTs are unique tokens on the blockchain, each with its own magical properties. Unlike regular coins that are identical, each NFT is as distinct as Dorothy's ruby slippers, with ownership permanently recorded in the Emerald City.";
    }
    if (queryLower.match(/create|mint/)) {
      return "Minting an NFT means creating a new unique token on the blockchain. You inscribe your digital asset's details into a smart contract, giving it a permanent home in the Emerald City's records.";
    }
    if (queryLower.match(/erc721|erc1155/)) {
      return "ERC-721 and ERC-1155 are the standard spells for creating NFTs. ERC-721 creates one-of-a-kind tokens, while ERC-1155 can create both unique and semi-fungible tokens in a single contract.";
    }
    if (queryLower.match(/metadata/)) {
      return "NFT metadata contains the magical properties of your collectible: name, description, image, and attributes. This data can live on-chain in the Emerald City or off-chain in external storage.";
    }
    return "NFTs (Non-Fungible Tokens) are unique digital collectibles on the blockchain. Each one has distinct properties and cannot be exchanged one-to-one like regular tokens, making them perfect for art, gaming items, and digital ownership.";
  }

  // Tokens
  if (queryLower.match(/token/)) {
    if (queryLower.match(/erc20|erc-20/)) {
      return "ERC-20 is the standard spell for creating fungible tokens on EVM chains. These tokens are interchangeable like coins in a purse, each one identical in value and properties.";
    }
    if (queryLower.match(/fungible/)) {
      return "Fungible tokens are interchangeable, like gold coins in the Emerald City. Each token has the same value and properties, making them perfect for currencies and utility tokens.";
    }
    if (queryLower.match(/utility/)) {
      return "Utility tokens grant access to services or features in the Emerald City. They're like tickets to the Wizard's show, providing specific benefits within their ecosystem.";
    }
    if (queryLower.match(/governance/)) {
      return "Governance tokens give you voting power in the Emerald City's decisions. Hold them to influence protocol changes, treasury spending, and the future direction of the project.";
    }
    return "Tokens are digital assets built on blockchain networks. They can represent currency, utility, governance rights, or other assets. Common standards include ERC-20 for fungible tokens and ERC-721 for NFTs.";
  }

  // Smart contracts
  if (queryLower.match(/smart contract/)) {
    if (queryLower.match(/how|work/)) {
      return "Smart contracts are self-executing spells stored in the Emerald City. When conditions are met, they automatically perform actions without needing the Wizard's intervention, ensuring trustless and transparent execution.";
    }
    if (queryLower.match(/solidity/)) {
      return "Solidity is the primary language for writing smart contracts on EVM chains like Somnia. It's the spellbook language that lets you encode logic and rules into the blockchain.";
    }
    if (queryLower.match(/deploy/)) {
      return "Deploying a smart contract means permanently inscribing your code into the blockchain. Once deployed to the Emerald City, the contract lives there forever, executing its magic whenever called.";
    }
    if (queryLower.match(/audit|security/)) {
      return "Smart contract audits are essential security checks before deployment. Expert wizards review your code for vulnerabilities, ensuring no wicked bugs can drain funds or break functionality.";
    }
    return "Smart contracts are self-executing programs stored on the blockchain. They automatically execute when predetermined conditions are met, without requiring intermediaries or trust in any single party.";
  }

  // Private keys
  if (queryLower.match(/private key|seed phrase|mnemonic/)) {
    return "Your private key is the ultimate secret to your vault in the Emerald City. Guard it like the Wizard guards his secrets - anyone with your private key controls your entire wallet and all its treasures.";
  }

  // Multisig (check before general wallet)
  if (queryLower.match(/multisig|multi.?sig|multiple.*signat/)) {
    return "Multisig wallets require multiple signatures to approve transactions, like needing several wizards to agree before opening the vault. They're perfect for shared treasuries and enhanced security.";
  }

  // Wallets
  if (queryLower.match(/wallet/)) {
    if (queryLower.match(/metamask|connect/)) {
      return "Wallet connections let you interact with the Emerald City through your browser. MetaMask and similar wallets act as your magical portal, signing transactions and managing your identity on the blockchain.";
    }
    if (queryLower.match(/address/)) {
      return "Your wallet address is your public identity in the Emerald City, starting with 0x followed by 40 hexadecimal characters. Share it freely to receive funds, but never share your private key.";
    }
    if (queryLower.match(/custodial|non-custodial/)) {
      return "Non-custodial wallets give you full control of your private keys - you're the only wizard with access. Custodial wallets are managed by a third party, like leaving your treasures with the Wizard.";
    }
    return "A crypto wallet is your magical vault in the Emerald City. It stores your private keys and allows you to interact with blockchain networks, sending, receiving, and managing your digital treasures.";
  }

  // Proof of Stake
  if (queryLower.match(/proof of stake|pos/)) {
    return "Proof of Stake is like being chosen as a guardian of the Emerald City based on how much you've invested. Validators stake their tokens to earn the right to verify transactions and earn rewards.";
  }

  // Proof of Work
  if (queryLower.match(/proof of work|pow/)) {
    return "Proof of Work requires solving complex puzzles to add blocks to the chain. Miners compete to solve these cryptographic riddles, with the winner earning the right to write the next page in the ledger.";
  }

  // Mining and validation
  if (queryLower.match(/mining|validator|staking/)) {
    return "Validators are the guardians of the Emerald City, verifying transactions and maintaining the blockchain's security. They stake tokens or computational power to earn the right to validate and receive rewards.";
  }

  // Liquidity pools
  if (queryLower.match(/liquidity|pool/)) {
    return "Liquidity pools are shared vaults where traders deposit token pairs. These pools enable instant swaps in the Emerald City, with liquidity providers earning fees from each trade.";
  }

  // DEX
  if (queryLower.match(/dex|decentralized exchange/)) {
    return "Decentralized exchanges (DEXs) let you trade tokens directly with others in the Emerald City, no middleman wizard required. Smart contracts handle the swaps automatically and transparently.";
  }

  // Yield farming
  if (queryLower.match(/yield|farming/)) {
    return "Yield farming is earning rewards by providing liquidity or staking tokens in DeFi protocols. It's like planting magic beans in the Emerald City and watching your rewards grow.";
  }

  // DeFi
  if (queryLower.match(/defi|decentralized finance/)) {
    return "DeFi (Decentralized Finance) brings traditional financial services to the blockchain without banks or intermediaries. Lending, borrowing, trading, and earning interest all happen through smart contracts in the Emerald City.";
  }

  // Layer 2 and scaling
  if (queryLower.match(/layer 2|l2|scaling|rollup/)) {
    return "Layer 2 solutions are like express lanes above the main yellow brick road. They process transactions faster and cheaper, then batch them onto the main chain for security.";
  }

  // Security
  if (queryLower.match(/security|safe|protect/)) {
    return "Security in the Emerald City means protecting your private keys, verifying contracts before interacting, and being wary of phishing attempts. Never share your seed phrase - not even with the Wizard himself.";
  }

  // Transactions
  if (queryLower.match(/transaction|transfer/)) {
    if (queryLower.match(/pending|confirm/)) {
      return "Transactions wait in the mempool until validators include them in a block. Higher gas fees can speed up confirmation, moving you to the front of the line on the yellow brick road.";
    }
    if (queryLower.match(/failed|revert/)) {
      return "Transactions can fail if they run out of gas, encounter errors in smart contracts, or violate conditions. Failed transactions still cost gas because validators spent computational power attempting the spell.";
    }
    return "Transactions are the heartbeat of the blockchain, moving value and data through the Emerald City. Each one is cryptographically signed, verified by validators, and permanently recorded on the yellow brick road.";
  }

  // Web3
  if (queryLower.match(/web3|dapp/)) {
    return "Web3 is the decentralized internet built on blockchain technology. DApps (decentralized applications) run on the Emerald City's infrastructure, giving users control over their data and digital identity.";
  }

  // Cryptography
  if (queryLower.match(/cryptography|encryption|hash/)) {
    if (queryLower.match(/hash|hashing/)) {
      return "Cryptographic hashing is the magic spell that turns any data into a unique fixed-length string. Like a fingerprint for data, the same input always produces the same hash, but you can't reverse it to get the original data back.";
    }
    if (queryLower.match(/public key|asymmetric/)) {
      return "Public key cryptography uses two magical keys: a public key you share with everyone, and a private key you keep secret. Messages encrypted with your public key can only be decrypted with your private key.";
    }
    return "Cryptography is the foundation of blockchain security, using mathematical spells to encrypt data, verify identities, and ensure transactions can't be tampered with in the Emerald City.";
  }

  // Addresses and accounts
  if (queryLower.match(/address|account/)) {
    if (queryLower.match(/checksum/)) {
      return "Checksummed addresses use mixed case letters to detect typos. The Wizard verifies each character's case matches the hash, preventing you from sending funds to the wrong destination.";
    }
    if (queryLower.match(/ens|domain/)) {
      return "ENS (Ethereum Name Service) lets you use human-readable names like 'wizard.eth' instead of long hexadecimal addresses. It's like having a memorable address in the Emerald City instead of coordinates.";
    }
    return "Blockchain addresses are your unique identifier in the Emerald City, derived from your public key. They start with 0x and contain 40 hexadecimal characters.";
  }

  // Oracles
  if (queryLower.match(/oracle/)) {
    return "Blockchain oracles are bridges between the Emerald City and the outside world. They bring real-world data onto the blockchain, allowing smart contracts to react to events like weather, prices, or sports scores.";
  }

  // Bridges
  if (queryLower.match(/bridge|cross-chain/)) {
    return "Blockchain bridges let you move assets between different chains, like traveling from one magical land to another. They lock your tokens on one chain and mint equivalent tokens on the destination chain.";
  }

  // Mempool
  if (queryLower.match(/mempool/)) {
    return "The mempool is the waiting room for transactions in the Emerald City. Pending transactions sit here until validators pick them up and include them in a block, with higher gas fees getting priority.";
  }

  // Nonce
  if (queryLower.match(/nonce/)) {
    return "A nonce is a transaction counter that ensures each transaction from your wallet is processed in order. It's like numbering your letters to the Wizard so they arrive in sequence.";
  }

  // ABI
  if (queryLower.match(/abi|application binary interface/)) {
    return "The ABI (Application Binary Interface) is like a spellbook that tells you how to interact with a smart contract. It defines all the functions, their parameters, and what they return.";
  }

  // Events and logs
  if (queryLower.match(/event|log/)) {
    return "Smart contract events are announcements broadcast to the Emerald City when something important happens. They're stored in transaction logs and can be searched, making it easy to track contract activity.";
  }

  // Forks
  if (queryLower.match(/fork|hard fork|soft fork/)) {
    if (queryLower.match(/hard fork/)) {
      return "A hard fork is a permanent split in the blockchain, like the yellow brick road dividing into two paths. It requires all validators to upgrade, creating a new version incompatible with the old one.";
    }
    if (queryLower.match(/soft fork/)) {
      return "A soft fork is a backward-compatible upgrade to the blockchain. Old validators can still participate, but new rules are enforced, like adding new signs along the yellow brick road.";
    }
    return "Forks are changes to blockchain protocols. Hard forks create permanent splits, while soft forks are backward-compatible upgrades that keep the community together.";
  }

  // Finality
  if (queryLower.match(/finality|confirmation/)) {
    return "Finality is when a transaction becomes permanent and irreversible in the Emerald City. The more blocks built on top of your transaction, the more final it becomes, like pages sealed in the Wizard's book.";
  }

  // Slashing
  if (queryLower.match(/slashing/)) {
    return "Slashing is the penalty for misbehaving validators in Proof of Stake. If they try to cheat or go offline, part of their staked tokens are burned, ensuring guardians of the Emerald City stay honest.";
  }

  // MEV
  if (queryLower.match(/mev|maximal extractable value|front.?run/)) {
    return "MEV (Maximal Extractable Value) is profit validators can make by reordering, including, or excluding transactions. It's like having the power to rearrange travelers on the yellow brick road for personal gain.";
  }

  // Sharding
  if (queryLower.match(/shard/)) {
    return "Sharding splits the blockchain into parallel chains called shards, each processing its own transactions. It's like having multiple yellow brick roads running side by side, dramatically increasing throughput.";
  }

  // IPFS
  if (queryLower.match(/ipfs|interplanetary/)) {
    return "IPFS (InterPlanetary File System) is decentralized storage for files too large for the blockchain. NFT images and metadata often live on IPFS, addressed by their content hash rather than location.";
  }

  // DAO
  if (queryLower.match(/dao|decentralized autonomous organization/)) {
    return "A DAO is a community-governed organization run by smart contracts in the Emerald City. Token holders vote on proposals, and approved decisions execute automatically without central leadership.";
  }

  // Testnet vs Mainnet
  if (queryLower.match(/testnet.*mainnet|mainnet.*testnet|difference.*test/)) {
    return "Testnets are practice grounds where tokens have no real value, perfect for experimenting. Mainnets are production blockchains where real assets flow. Always test your spells before casting them with real magic.";
  }

  // RPC
  if (queryLower.match(/rpc|remote procedure call/)) {
    return "RPC endpoints are gateways to the blockchain, letting your applications read data and send transactions. They're like magical portals connecting your computer to the Emerald City.";
  }

  // Nodes
  if (queryLower.match(/node|full node|light node/)) {
    if (queryLower.match(/full node/)) {
      return "Full nodes store the entire blockchain history and validate every transaction. They're the complete archives of the Emerald City, ensuring the network stays decentralized and secure.";
    }
    if (queryLower.match(/light node/)) {
      return "Light nodes only store block headers and request data as needed. They're like travelers carrying a map instead of the entire library, perfect for mobile devices and quick access.";
    }
    return "Nodes are computers running blockchain software, maintaining the network and validating transactions. They're the foundation that keeps the Emerald City running smoothly.";
  }

  // Impermanent loss
  if (queryLower.match(/impermanent loss/)) {
    return "Impermanent loss happens when you provide liquidity to a pool and token prices change. You might end up with less value than if you'd just held the tokens, though trading fees can offset this loss.";
  }

  // Slippage
  if (queryLower.match(/slippage/)) {
    return "Slippage is the difference between expected and actual trade prices. Large trades in small liquidity pools can cause significant slippage, like trying to exchange too many emeralds at once.";
  }

  // Default response
  return "Welcome to the Emerald City of blockchain knowledge. I can help you understand Somnia, smart contracts, tokens, NFTs, DeFi, cryptography, and much more. Ask me anything about your journey through the decentralized world.";
}

export async function generateSummary(
  data: any,
  intent: string,
  walletAddress?: string,
  userQuery?: string
): Promise<string> {
  if (openai) {
    try {
      // ENFORCE CORRECT MESSAGE STRUCTURE
      const systemPrompt = `You are Veriked, a smart, friendly, and whimsical blockchain assistant with a Wicked and Wizard of Oz inspired personality.

CRITICAL RULES:
- ALWAYS read and use the Somnia blockchain data provided in the user message
- Extract wallet address, balance, transaction count, blocks, timestamps, and raw JSON from the data
- ALWAYS provide a direct answer to the user's question using the actual numbers from the blockchain data
- Include specific values: balance amounts, transaction counts, block numbers, addresses
- Weave Wicked/Oz references naturally into responses while keeping data clear
- Use thematic vocabulary: Emerald City (blockchain), yellow brick road (transactions), sparkle/shine (balance), wizard (verification)
- Keep responses engaging and thematic (2-3 sentences)
- DO NOT use emojis
- DO NOT add "Veriked Verified" to responses
- DO NOT ask follow-up questions

RESPONSE EXAMPLES:
- Balance query: "Your wallet sparkles with 5.2 STT in the Emerald City, with 12 transactions along the yellow brick road at block 238800679."
- No balance: "Your wallet in the Emerald City currently holds 0 STT with no adventures on the yellow brick road yet."
- Transaction count: "You have 15 transactions dancing through the Somnia blockchain, each step verified by the Wizard."
- NFT query: "No magical collectibles found in your treasure chest at this time, but the journey continues."
- General blockchain: "The Emerald City reveals block 238800679 containing 45 transactions, all verified and true."

For non-wallet queries (general questions about blockchain, crypto, Somnia):
- Provide helpful, accurate information with Wicked/Oz theming
- Explain Somnia testnet features when asked
- Answer general crypto questions with personality
- Keep responses educational and engaging

Always provide accurate blockchain information with specific numbers and thematic flair.`;

      // User message MUST include both query and blockchain data
      const userMessage = `User question: "${userQuery || 'Tell me about my wallet'}"

Somnia Blockchain Data:
- Intent: ${intent}
- Wallet Address: ${walletAddress || 'Not provided'}
- Data: ${JSON.stringify(data, null, 2)}

Please analyze this blockchain data and respond in your signature Wicked/Oz style. Use the actual numbers and addresses from the data above.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        temperature: 0.95,
        max_tokens: 300,
      });

      const response = completion.choices[0].message.content;
      
      // Validate response includes data
      if (response && !response.includes("developer") && !response.includes("missing")) {
        return response;
      }
      
      return response || "Something wicked this way comes... but I couldn't quite catch it! 🌪️";
    } catch (error) {
      console.error("Summary generation failed:", error);
    }
  }

  // Fallback responses with actual data and Wicked/Oz theming
  switch (intent) {
    case "balance":
      const balance = data.balanceFormatted || data.balance || "0 STT";
      const txCount = data.transactionCount || 0;
      if (txCount === 0) {
        return `Your wallet in the Emerald City holds ${balance} with no adventures on the yellow brick road yet.`;
      }
      return `Your wallet sparkles with ${balance} in the Emerald City, with ${txCount} transaction${txCount !== 1 ? 's' : ''} along the yellow brick road.`;
    
    case "transactions":
      const count = data.count || data.transactions?.length || 0;
      if (count === 0) {
        return "No transactions found on your yellow brick road through the Emerald City yet.";
      }
      return `You have ${count} transaction${count !== 1 ? 's' : ''} dancing through the Somnia blockchain, each step verified by the Wizard.`;
    
    case "nfts":
      const nftCount = data.totalNFTs || 0;
      if (nftCount === 0) {
        return "No magical collectibles found in your treasure chest at this time, but every great collection starts somewhere.";
      }
      return `Your collection shines with ${nftCount} NFT${nftCount !== 1 ? 's' : ''} across ${data.collections || 0} collection${data.collections !== 1 ? 's' : ''}, each as unique as ruby slippers.`;
    
    case "tokens":
      const tokenCount = data.tokens?.length || 0;
      if (tokenCount === 0) {
        return "No additional tokens found in your Emerald City vault at this time.";
      }
      return `Your vault holds ${tokenCount} different token${tokenCount !== 1 ? 's' : ''}, each shining with its own magic.`;
    
    case "blocks":
      const blockNum = data.number || data.blockNumber || "unknown";
      const txInBlock = data.transactionCount || 0;
      return `The Wizard reveals block ${blockNum} in the Emerald City, containing ${txInBlock} transaction${txInBlock !== 1 ? 's' : ''}.`;
    
    default:
      return `Your ${intent} data from the Emerald City of Somnia has been retrieved and verified.`;
  }
}
