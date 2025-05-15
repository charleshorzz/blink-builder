"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { useWalletMultiButton } from "@solana/wallet-adapter-base-ui";
import { createClient } from "@supabase/supabase-js";
import { RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

const VoteRecordTemplate = () => {
  //   const supabase = createClientComponentClient();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { publicKey } = useWalletMultiButton({
    onSelectWallet() {
      // setModalVisible(true);
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [candidates, setCandidates] = useState<any[]>([]); // Use a proper type if you have one

  const fetchVoteRecords = async () => {
    if (!publicKey) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("candidates")
      .select("*")
      .eq("candidatePublicKey", publicKey.toBase58());

    if (error) {
      console.error("Error fetching candidates:", error);
      setError(error.message);
    } else {
      setCandidates(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (publicKey) {
      fetchVoteRecords();
    }
  }, [publicKey]);

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <>
      <div className="flex items-center gap-2 mb-2">
        <p className="font-medium text-gradient">WALLET :</p>
        <Badge variant="outline">
          {publicKey
            ? publicKey.toBase58().slice(0, 7) +
              ".." +
              publicKey.toBase58().slice(-4)
            : "You haven't logged in to your wallet."}
        </Badge>
        <Button
          className="size-7"
          variant="outline"
          size="icon"
          onClick={fetchVoteRecords}
          disabled={loading}
        >
          <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
        </Button>
      </div>

      <Card className="w-full backdrop-blur-sm bg-card/80 border-white/10">
        {loading ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Skeleton className="h-4 " />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 " />
                </TableHead>
                <TableHead className="text-right">
                  <Skeleton className="h-4 " />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 8 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={4} className="text-center text-sm">
                    <Skeleton className="h-4" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Title</TableHead>
                <TableHead>Candidate Name</TableHead>
                <TableHead className="text-right">Total Votes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm">
                    {publicKey
                      ? "No vote records found."
                      : "Connect your wallet to see records."}
                  </TableCell>
                </TableRow>
              ) : (
                candidates.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell className="font-medium">
                      {candidate.title || "-"}
                    </TableCell>
                    <TableCell>{candidate.candidateName || "-"}</TableCell>
                    <TableCell className="text-right">
                      {(candidate.voter && candidate.voter.length) || 0}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </>
  );
};

export default VoteRecordTemplate;
