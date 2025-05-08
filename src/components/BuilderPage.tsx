
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, Vote, ShoppingCart, Home, Settings } from 'lucide-react';
import DraggableComponent from './DraggableComponent';
import DropZone from './DropZone';
import TokenReceiveTemplate from './templates/TokenReceiveTemplate';
import VotingTemplate from './templates/VotingTemplate';
import NFTMarketplaceTemplate from './templates/NFTMarketplaceTemplate';
import { useToast } from '@/hooks/use-toast';

interface BuilderPageProps {
  isLoggedIn: boolean;
}

type ComponentType = 'token-receive' | 'voting' | 'nft-marketplace' | null;

const BuilderPage: React.FC<BuilderPageProps> = ({ isLoggedIn }) => {
  const [activeTab, setActiveTab] = useState('receive');
  const [projectName, setProjectName] = useState('My Web3 App');
  const [link, setLink] = useState('');
  const [droppedComponents, setDroppedComponents] = useState<{[key: string]: ComponentType}>({
    'main': null,
  });
  const { toast } = useToast();

  const handleDrop = (componentType: string, zoneId: string) => {
    setDroppedComponents(prev => ({
      ...prev,
      [zoneId]: componentType as ComponentType
    }));
  };

  const renderDroppedComponent = (zoneId: string) => {
    const componentType = droppedComponents[zoneId];
    
    switch (componentType) {
      case 'token-receive':
        return <TokenReceiveTemplate customizable={true} />;
      case 'voting':
        return <VotingTemplate customizable={true} />;
      case 'nft-marketplace':
        return <NFTMarketplaceTemplate customizable={true} />;
      default:
        return null;
    }
  };

  const generateLink = () => {
    // This would typically connect to a backend to generate a unique link and save the template
    const randomId = Math.random().toString(36).substr(2, 9);
    setLink(`https://blockbuilder.app/${randomId}`);
    
    toast({
      title: "Link Generated!",
      description: "Your application link has been created successfully."
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-background border-b py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-builder-accent rounded-md flex items-center justify-center">
            <div className="h-3 w-3 bg-white rounded-sm"></div>
          </div>
          <Input 
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="font-medium text-lg border-transparent focus-visible:border-input bg-transparent w-[200px]"
          />
        </div>
        <div className="flex items-center gap-4">
          <Button 
            onClick={generateLink} 
            disabled={!Object.values(droppedComponents).some(Boolean)}
          >
            Generate Link
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Components */}
        <div className="w-64 border-r bg-muted/30 p-4 overflow-y-auto hidden md:block">
          <h2 className="font-medium mb-4">Components</h2>
          <div className="space-y-3">
            <DraggableComponent 
              id="token-receive" 
              type="token-receive" 
              label="Token Receive" 
              icon={<Wallet size={18} />} 
            />
            <DraggableComponent 
              id="voting" 
              type="voting" 
              label="DAO Voting" 
              icon={<Vote size={18} />} 
            />
            <DraggableComponent 
              id="nft-marketplace" 
              type="nft-marketplace" 
              label="NFT Marketplace" 
              icon={<ShoppingCart size={18} />} 
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Preview Area */}
          <div className="flex-1 p-6 overflow-y-auto builder-grid">
            <div className="container mx-auto">
              <div className="mb-6">
                <h2 className="text-xl font-medium mb-3">Design Preview</h2>
                <p className="text-sm text-muted-foreground">Drag components from the sidebar onto the canvas.</p>
              </div>

              <Card className="p-6 min-h-[400px]">
                <DropZone 
                  id="main" 
                  onDrop={handleDrop}
                  isEmpty={!droppedComponents.main}
                >
                  {renderDroppedComponent('main')}
                </DropZone>
              </Card>

              {link && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <Label htmlFor="generated-link">Your Generated Link:</Label>
                  <div className="flex mt-2">
                    <Input id="generated-link" value={link} readOnly className="flex-1" />
                    <Button 
                      variant="secondary" 
                      className="ml-2"
                      onClick={() => {
                        navigator.clipboard.writeText(link);
                        toast({ title: "Copied to clipboard" });
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Tab Bar - Mobile Navigation */}
          <div className="md:hidden border-t bg-background p-2">
            <div className="flex justify-around">
              <Button variant={activeTab === 'receive' ? 'default' : 'ghost'} size="sm" className="flex-1" onClick={() => setActiveTab('receive')}>
                <Wallet size={20} />
              </Button>
              <Button variant={activeTab === 'voting' ? 'default' : 'ghost'} size="sm" className="flex-1" onClick={() => setActiveTab('voting')}>
                <Vote size={20} />
              </Button>
              <Button variant={activeTab === 'nft' ? 'default' : 'ghost'} size="sm" className="flex-1" onClick={() => setActiveTab('nft')}>
                <ShoppingCart size={20} />
              </Button>
              <Button variant={activeTab === 'settings' ? 'default' : 'ghost'} size="sm" className="flex-1" onClick={() => setActiveTab('settings')}>
                <Settings size={20} />
              </Button>
            </div>

            {/* Mobile Component Selection */}
            <div className="p-4">
              {activeTab === 'receive' && (
                <div className="space-y-4">
                  <h3 className="font-medium">Token Receiving</h3>
                  <Button 
                    className="w-full justify-start"
                    onClick={() => handleDrop('token-receive', 'main')}
                  >
                    <Wallet size={16} className="mr-2" />
                    Add Token Receive
                  </Button>
                </div>
              )}
              {activeTab === 'voting' && (
                <div className="space-y-4">
                  <h3 className="font-medium">DAO Voting</h3>
                  <Button 
                    className="w-full justify-start"
                    onClick={() => handleDrop('voting', 'main')}
                  >
                    <Vote size={16} className="mr-2" />
                    Add Voting Component
                  </Button>
                </div>
              )}
              {activeTab === 'nft' && (
                <div className="space-y-4">
                  <h3 className="font-medium">NFT Marketplace</h3>
                  <Button 
                    className="w-full justify-start"
                    onClick={() => handleDrop('nft-marketplace', 'main')}
                  >
                    <ShoppingCart size={16} className="mr-2" />
                    Add NFT Marketplace
                  </Button>
                </div>
              )}
              {activeTab === 'settings' && (
                <div className="space-y-4">
                  <h3 className="font-medium">Settings</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="project-name-mobile">Project Name</Label>
                      <Input 
                        id="project-name-mobile"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <Button 
                      onClick={generateLink} 
                      disabled={!Object.values(droppedComponents).some(Boolean)}
                      className="w-full"
                    >
                      Generate Link
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuilderPage;
