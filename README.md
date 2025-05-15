# BlinkBuilder
BlinkBuilder is a no-code tool designed to generate Solana Blinks—special links that trigger on-chain actions like token transfers, NFT trades, DAO votes, or wagers on NBA games. Users can easily create interactive, blockchain-powered experiences and share them across social platforms. Whether you're betting against friends or collecting payments, BlinkBuilder simplifies Solana development to just a few clicks—no coding required.

## Project info

**URL**: https://blink-builder-roan.vercel.app

## Installation
Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Create variable below in .env.local at the root of the project.(Don't forget to add it into .gitignore file)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
RPC_URL=your_solana_rpc_url
SOLANA_PRIVATE_KEY=your_solana_private_key
PINATA_API_KEY=your_pinata_api_key
PINATA_API_SECRET=your_pinata_api_secret
NEXT_PUBLIC_API_URL=your_backend_api_url
WALLET_ADDRESS=your_wallet_address

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```
## What technologies are used for this project?
Frontend:
- React: The main UI library (.tsx files, React hooks, components).
- Next.js: Likely used for routing and server-side rendering (usage of pages, app, and API routes).
- TypeScript: For type safety in both frontend and backend (.ts and .tsx files).
- Tailwind CSS (or similar utility-first CSS): Used for styling (class names like bg-indigo-600, rounded-lg, etc.).
- Solana Wallet Adapter: For connecting and interacting with Solana wallets (e.g., Phantom, Solflare).
- Solana Web3.js: For building and sending Solana blockchain transactions.
- Dialect Blinks: For social actions and sharing (e.g., miniblink links, @dialectlabs/blinks).
  
Backend:
- Next.js API Routes: For backend logic (e.g., /api/actions/gamble-sol).
- Solana Web3.js: For constructing and serializing transactions on the backend.
- Node.js: The runtime for the backend API routes.
