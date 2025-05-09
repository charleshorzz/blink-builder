import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Wallet } from "lucide-react";

interface NavigationProps {
  isLoggedIn: boolean;
  connectWallet: () => void;
}

const Navigation: React.FC<NavigationProps> = ({
  isLoggedIn,
  connectWallet,
}) => {
  return (
    <header className="w-full py-4 px-6 flex items-center justify-between neo-blur fixed top-0 left-0 right-0 z-50 border-b border-white/10">
      <div className=" items-center gap-2">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="logo-white.png"
            alt="Logo"
            className="h-[1.25rem] w-[1.25rem] rounded-full object-cover"
          />
          <span className="font-bold text-xl tracking-tight text-gradient">
            BlockBuilder
          </span>
        </Link>
      </div>

      <nav className="hidden md:flex items-center gap-8">
        <Link
          to="/"
          className="text-sm font-medium hover:text-builder-accent transition-colors"
        >
          Home
        </Link>
        <Link
          to="/templates"
          className="text-sm font-medium hover:text-builder-accent transition-colors"
        >
          Templates
        </Link>
        <Link
          to="/docs"
          className="text-sm font-medium hover:text-builder-accent transition-colors"
        >
          Docs
        </Link>
        <Link
          to="/pricing"
          className="text-sm font-medium hover:text-builder-accent transition-colors"
        >
          Pricing
        </Link>
      </nav>

      <div className="flex items-center gap-4">
        {isLoggedIn ? (
          <Link to="/builder">
            <Button className="gradient-border bg-builder-accent hover:bg-builder-accent/80">
              Go to Builder
            </Button>
          </Link>
        ) : (
          <Button
            onClick={connectWallet}
            className="flex items-center gap-2 gradient-border animate-glow bg-builder-accent hover:bg-builder-accent/80"
          >
            <Wallet size={16} />
            Connect Wallet
          </Button>
        )}
      </div>
    </header>
  );
};

export default Navigation;
