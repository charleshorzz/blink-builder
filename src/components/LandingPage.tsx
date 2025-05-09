import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navigation from "./Navigation";
import RotatingCard from "./3D/RotatingCard";

interface LandingPageProps {
  connectWallet: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ connectWallet }) => {
  // Initialize animation delay counters for staggered animations
  useEffect(() => {
    const animatedElements = document.querySelectorAll(".animate-on-scroll");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-slide-up");
            entry.target.classList.add("opacity-100");
          }
        });
      },
      { threshold: 0.1 }
    );

    animatedElements.forEach((el) => observer.observe(el));

    return () => {
      animatedElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col animated-bg">
      <Navigation isLoggedIn={false} connectWallet={connectWallet} />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 md:px-10 lg:px-20 flex flex-col md:flex-row items-center gap-10 lg:gap-20">
        <div className="w-full md:w-1/2 space-y-6 z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gradient">
            Build Web3 Apps
            <br />
            <span className="text-builder-accent">Without Code</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md animate-on-scroll opacity-0 transform translate-y-4">
            Create blockchain apps with our simple drag and drop builder. No
            coding required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-on-scroll opacity-0 transform translate-y-4">
            <Button
              onClick={connectWallet}
              size="lg"
              className="w-full sm:w-auto animate-glow bg-builder-accent hover:bg-builder-accent/80"
            >
              Start Building
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto gradient-border"
            >
              View Templates
            </Button>
          </div>
        </div>
        <div className="w-full md:w-1/2 h-[500px] md:h-[600px] relative">
          <div className="absolute inset-0 w-full h-full rounded-lg overflow-hidden">
            <RotatingCard />
            <div className="absolute bottom-10 right-10 w-20 h-20 bg-builder-accent/20 rounded-lg animate-pulse-light"></div>
            <div
              className="absolute top-10 left-10 w-16 h-16 bg-builder-secondary/20 rounded-lg animate-pulse-light"
              style={{ animationDelay: "1s" }}
            ></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 md:px-10 lg:px-20 neo-blur">
        <div className="text-center mb-16 animate-on-scroll opacity-0">
          <h2 className="text-3xl font-bold mb-4 text-gradient">
            Key Features
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Everything you need to build powerful Web3 applications
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Web3 Components",
              description:
                "Ready-to-use components for token transfers, DAO voting, and NFT marketplaces",
              delay: 0,
            },
            {
              title: "Template System",
              description:
                "Choose from professional templates that fit your project needs",
              delay: 100,
            },
            {
              title: "Mobile Responsive",
              description:
                "All templates are fully responsive and work on any device",
              delay: 200,
            },
            {
              title: "Custom Styling",
              description:
                "Personalize your app with custom colors, fonts and layouts",
              delay: 300,
            },
            {
              title: "Instant Deployment",
              description:
                "One-click deployment to get your app live in minutes",
              delay: 400,
            },
            {
              title: "Connect Any Wallet",
              description: "Support for MetaMask, WalletConnect, and more",
              delay: 500,
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="backdrop-blur-md bg-card/20 p-6 rounded-lg border border-white/10 hover-effect animate-on-scroll opacity-0"
              style={{ animationDelay: `${feature.delay}ms` }}
            >
              <h3 className="font-semibold text-xl mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Templates Section */}
      <section className="py-20 px-6 md:px-10 lg:px-20">
        <div className="text-center mb-16 animate-on-scroll opacity-0">
          <h2 className="text-3xl font-bold mb-4 text-gradient">
            Ready-Made Templates
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Start with a template and customize it to your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Token Receiver",
              description: "Accept token payments with a simple form",
              color: "#7E69AB",
              delay: 0,
            },
            {
              title: "DAO Voting",
              description: "Create proposals and collect community votes",
              color: "#6E59A5",
              delay: 200,
            },
            {
              title: "NFT Marketplace",
              description: "Buy, sell and trade NFTs in a custom marketplace",
              color: "#8B5CF6",
              delay: 400,
            },
          ].map((template, i) => (
            <div
              key={i}
              className="rounded-lg overflow-hidden border border-white/10 group hover:shadow-lg transition-all backdrop-blur-md bg-card/20 animate-on-scroll opacity-0 glow-effect"
              style={{ animationDelay: `${template.delay}ms` }}
            >
              <div className="h-48 relative">
                <img
                  src={"blockchainCard.png"}
                  alt={"image"}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-xl mb-2">{template.title}</h3>
                <p className="text-muted-foreground mb-4">
                  {template.description}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full group-hover:bg-builder-accent group-hover:text-white transition-colors"
                >
                  Use Template
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 md:px-10 lg:px-20 neo-blur">
        <div className="max-w-4xl mx-auto text-center space-y-6 animate-on-scroll opacity-0">
          <h2 className="text-3xl md:text-4xl font-bold text-gradient">
            Start Building Your Web3 App Today
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of creators and businesses building on the blockchain
            without writing a single line of code.
          </p>
          <Button
            onClick={connectWallet}
            size="lg"
            className="mt-4 px-8 animate-glow bg-builder-accent hover:bg-builder-accent/80"
          >
            Connect Wallet to Start
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6 md:px-10 lg:px-20 neo-blur">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-3 text-gradient">BlockBuilder</h3>
            <p className="text-sm text-muted-foreground">
              The no-code platform for Web3 development
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-3">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/features"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  to="/templates"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Templates
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-3">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/docs"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  to="/guides"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Guides
                </Link>
              </li>
              <li>
                <Link
                  to="/support"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Support
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-3">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-white/10 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} BlockBuilder. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
