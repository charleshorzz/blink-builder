
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Navigation from './Navigation';

interface LandingPageProps {
  connectWallet: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ connectWallet }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation isLoggedIn={false} connectWallet={connectWallet} />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 md:px-10 lg:px-20 flex flex-col md:flex-row items-center gap-10 lg:gap-20">
        <div className="w-full md:w-1/2 space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Build Web3 Apps<br />
            <span className="text-builder-accent">Without Code</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Create blockchain apps with our simple drag and drop builder. No coding required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button onClick={connectWallet} size="lg" className="w-full sm:w-auto">
              Start Building
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              View Templates
            </Button>
          </div>
        </div>
        <div className="w-full md:w-1/2 relative h-[300px] md:h-[400px]">
          <div className="absolute inset-0 w-full h-full bg-builder-light rounded-lg overflow-hidden builder-grid">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-white/90 rounded-lg border shadow-md p-4 animate-float">
              <div className="h-4 w-3/4 bg-builder-accent/20 rounded mb-3"></div>
              <div className="flex gap-2 mb-4">
                <div className="h-8 w-8 bg-builder-accent/30 rounded"></div>
                <div className="h-8 w-8 bg-builder-accent/30 rounded"></div>
                <div className="h-8 w-8 bg-builder-accent/30 rounded"></div>
              </div>
              <div className="h-24 w-full bg-builder-accent/10 rounded"></div>
            </div>
            <div className="absolute bottom-10 right-10 w-20 h-20 bg-builder-accent/20 rounded-lg animate-pulse-light"></div>
            <div className="absolute top-10 left-10 w-16 h-16 bg-builder-secondary/20 rounded-lg animate-pulse-light" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 md:px-10 lg:px-20 bg-muted/50">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Key Features</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Everything you need to build powerful Web3 applications
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Web3 Components",
              description: "Ready-to-use components for token transfers, DAO voting, and NFT marketplaces",
            },
            {
              title: "Drag & Drop Interface",
              description: "Simple visual builder to design your app with no coding required",
            },
            {
              title: "Mobile Responsive",
              description: "All templates are fully responsive and work on any device",
            },
            {
              title: "Custom Styling",
              description: "Personalize your app with custom colors, fonts and layouts",
            },
            {
              title: "Instant Deployment",
              description: "One-click deployment to get your app live in minutes",
            },
            {
              title: "Connect Any Wallet",
              description: "Support for MetaMask, WalletConnect, and more",
            },
          ].map((feature, i) => (
            <div key={i} className="bg-background p-6 rounded-lg border hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-xl mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Templates Section */}
      <section className="py-20 px-6 md:px-10 lg:px-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Ready-Made Templates</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Start with a template and customize it to your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Token Receiver",
              description: "Accept token payments with a simple form",
              image: "bg-gradient-to-br from-purple-500/20 to-blue-500/20",
            },
            {
              title: "DAO Voting",
              description: "Create proposals and collect community votes",
              image: "bg-gradient-to-br from-blue-500/20 to-green-500/20",
            },
            {
              title: "NFT Marketplace",
              description: "Buy, sell and trade NFTs in a custom marketplace",
              image: "bg-gradient-to-br from-pink-500/20 to-purple-500/20",
            },
          ].map((template, i) => (
            <div key={i} className="rounded-lg overflow-hidden border group hover:shadow-lg transition-all">
              <div className={`h-48 ${template.image}`}></div>
              <div className="p-6">
                <h3 className="font-semibold text-xl mb-2">{template.title}</h3>
                <p className="text-muted-foreground mb-4">{template.description}</p>
                <Button variant="secondary" size="sm" className="w-full group-hover:bg-builder-accent group-hover:text-white transition-colors">
                  Use Template
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 md:px-10 lg:px-20 bg-builder-accent/10">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">Start Building Your Web3 App Today</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of creators and businesses building on the blockchain without writing a single line of code.
          </p>
          <Button onClick={connectWallet} size="lg" className="mt-4 px-8">
            Connect Wallet to Start
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12 px-6 md:px-10 lg:px-20">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-3">BlockBuilder</h3>
            <p className="text-sm text-muted-foreground">
              The no-code platform for Web3 development
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-3">Product</h4>
            <ul className="space-y-2">
              <li><Link to="/features" className="text-sm text-muted-foreground hover:text-foreground">Features</Link></li>
              <li><Link to="/templates" className="text-sm text-muted-foreground hover:text-foreground">Templates</Link></li>
              <li><Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-3">Resources</h4>
            <ul className="space-y-2">
              <li><Link to="/docs" className="text-sm text-muted-foreground hover:text-foreground">Documentation</Link></li>
              <li><Link to="/guides" className="text-sm text-muted-foreground hover:text-foreground">Guides</Link></li>
              <li><Link to="/support" className="text-sm text-muted-foreground hover:text-foreground">Support</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-3">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm text-muted-foreground hover:text-foreground">About Us</Link></li>
              <li><Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground">Blog</Link></li>
              <li><Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} BlockBuilder. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
