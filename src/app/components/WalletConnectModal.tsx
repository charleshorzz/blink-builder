"use client";

import { Button } from "./ui/button";
import { Modal } from "./ui/modal";

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function WalletConnectModal({
  isOpen,
  onClose,
  onConfirm,
}: WalletConnectModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gradient">Connect Wallet</h2>
        <p className="text-muted-foreground">
          Connect your wallet to start building your Web3 application.
        </p>
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-builder-accent hover:bg-builder-accent/80"
          >
            Connect
          </Button>
        </div>
      </div>
    </Modal>
  );
}
