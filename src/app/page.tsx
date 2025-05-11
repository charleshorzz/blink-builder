// app/page.tsx (Your Home component)
"use client";

import { useRouter } from "next/navigation";
import LandingPage from "./components/LandingPage";
// You will likely NOT need the custom WalletConnectModal anymore
// import { WalletConnectModal } from "./components/WalletConnectModal";

// Import the hooks from the wallet adapter libraries
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useEffect } from "react"; // To check connection status after render

export default function Home() {
  // Use the hooks provided by the wallet adapter context
  const { publicKey, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const router = useRouter();

  // This function will now simply open the adapter's built-in modal
  const connectWallet = () => {
    setVisible(true);
  };

  // You can use useEffect to check if the wallet is connected
  // and then redirect if necessary, maybe after a successful connection
  useEffect(() => {
    if (connected) {
      console.log("Wallet connected:", publicKey?.toBase58());
      // Redirect the user after successful connection
      // You might want more sophisticated logic here, e.g., waiting for
      // user confirmation or specific state
      // router.replace("/test"); // Uncomment or adapt this line
    }
  }, [connected, publicKey, router]); // Depend on connected, publicKey, and router

  // Your custom modal logic might be removed or heavily modified
  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const handleConfirm = async () => { ... }; // This logic might change significantly

  // You'll likely remove the custom modal component
  return (
    <>
      {/* Pass the connectWallet function to your LandingPage */}
      <LandingPage connectWallet={connectWallet} />

      {/* The WalletModalProvider in layout.tsx handles the modal UI */}
      {/* You likely don't need your custom WalletConnectModal here anymore */}
      {/* <WalletConnectModal
        isOpen={isModalOpen} // Remove or adapt this
        onClose={() => setIsModalOpen(false)} // Remove or adapt this
        onConfirm={handleConfirm} // Remove or adapt this
      /> */}

      {/* You can add the built-in wallet buttons if you like, or put them
          in a header component */}
      {/* <WalletMultiButton /> */}
      {/* {connected && <WalletDisconnectButton />} */}
    </>
  );
}
