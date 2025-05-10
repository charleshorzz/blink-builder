import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Vote } from "lucide-react";
import { Progress } from "@/app/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { Label } from "@/app/components/ui/label";

interface VotingTemplateProps {
  customizable?: boolean;
  onCustomize?: () => void;
}

const VotingTemplate: React.FC<VotingTemplateProps> = ({
  customizable = false,
  onCustomize,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  return (
    <Card className="w-full max-w-md mx-auto backdrop-blur-sm bg-card/80 border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Vote size={20} className="text-builder-accent" />
          DAO Proposal Voting
        </CardTitle>
        <CardDescription>
          Cast your vote on this community proposal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">
            Proposal: Community Treasury Allocation
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            How should we allocate the 1000 ETH in the community treasury for
            Q3?
          </p>

          <RadioGroup
            value={selectedOption || ""}
            onValueChange={setSelectedOption}
            className="space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="development" id="development" />
                <Label htmlFor="development">
                  Fund development initiatives
                </Label>
              </div>
              <Progress value={40} className="h-2 bg-muted" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>40%</span>
                <span>400 votes</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="marketing" id="marketing" />
                <Label htmlFor="marketing">Increase marketing efforts</Label>
              </div>
              <Progress value={25} className="h-2 bg-muted" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>25%</span>
                <span>250 votes</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="reserve" id="reserve" />
                <Label htmlFor="reserve">Keep in reserve</Label>
              </div>
              <Progress value={35} className="h-2 bg-muted" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>35%</span>
                <span>350 votes</span>
              </div>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {customizable && (
          <Button
            variant="outline"
            onClick={onCustomize}
            className="gradient-border"
          >
            Customize
          </Button>
        )}
        <Button
          disabled={!selectedOption}
          className="w-full gradient-border bg-builder-accent hover:bg-builder-accent/80"
        >
          Cast Vote
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VotingTemplate;
