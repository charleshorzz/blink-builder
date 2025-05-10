
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/app/hooks/use-toast";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  walletAddress: string;
}

const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  walletAddress,
}) => {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleRegister = async () => {
    if (!username.trim()) {
      toast({
        title: "Error",
        description: "Please enter a username",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Insert new user into the database
      const { error } = await supabase
        .from('user')
        .insert([
          { wallet_address: walletAddress }
        ]);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Your account has been registered!",
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to register. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-black/70 border border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center text-gradient">Register Your Wallet</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wallet" className="text-sm text-gray-300">Wallet Address</Label>
            <Input
              id="wallet"
              value={walletAddress}
              disabled
              className="bg-black/50 border-white/20 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm text-gray-300">Username (optional)</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter a username"
              className="bg-black/50 border-white/20 text-white"
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-center">
          <Button
            onClick={handleRegister}
            disabled={isLoading}
            className="gradient-border bg-builder-accent hover:bg-builder-accent/80 w-full"
          >
            {isLoading ? "Registering..." : "Confirm Registration"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterModal;
