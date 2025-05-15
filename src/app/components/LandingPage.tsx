"use client";

import React, { useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import Link from "next/link";
import Navigation from "./Navigation";
import RotatingCard from "./3D/RotatingCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/app/components/ui/carousel";
import { CardSpotlight } from "./ui/card-spotlight";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";

interface LandingPageProps {
  connectWallet: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ connectWallet }) => {
  const { connected } = useWallet();
  const router = useRouter();

  const handleOnClick = () => {
    if (connected) {
      router.replace("/test"); // <-- Ensure this is '/builder'
    } else {
      connectWallet?.();
    }
  };

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

  const templates = [
    {
      title: "Token Payment",
      description:
        "Let others send you tokens instantly via a simple Blink form",
      color: "#7E69AB",
      img: "/tokenReceive.png",
      delay: 0,
    },
    {
      title: "DAO Voting",
      description:
        "Launch a Blink that allows your community to vote on DAO proposals",
      color: "#6E59A5",
      img: "voteSol.png",
      delay: 200,
    },
    {
      title: "NFT Marketplace",
      description:
        "Create a Blink for trading NFTs directly inside supported wallets",
      color: "#8B5CF6",
      img: "NFTsol.png",
      delay: 400,
    },
    {
      title: "Gambling",
      description:
        "Fun, chance-based interactions via an on-chain gambling Blink",
      color: "#8B5CF6",
      img: "/betSol.png",
      delay: 400,
    },
    {
      title: "Token Swap",
      description:
        "Trigger a token swap from within the wallet using this Blink action",
      color: "#8B5CF6",
      img: "swapSol.png",
      delay: 400,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col animated-bg">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 md:px-10 lg:px-20 flex flex-col md:flex-row items-center gap-10 lg:gap-20">
        <div className="w-full md:w-1/2 space-y-6 z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gradient">
            Build Solana Blinks
            <br />
            <span className="text-builder-accent">Without Code</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md animate-on-scroll opacity-0 transform translate-y-4">
            Create blinks with preconfigured templates and components. No coding
            required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-on-scroll opacity-0 transform translate-y-4">
            <Button
              onClick={handleOnClick}
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
        <Carousel className="w-ful none md:block">
          <CarouselContent className="-ml-1">
            {[
              {
                title: "Token Payment",
                description:
                  "Let others send you tokens instantly via a simple Blink form",
                color: "#7E69AB",
                delay: 0,
                image: "tokenBlink.png",
              },
              {
                title: "DAO Voting",
                description:
                  "Launch a Blink that allows your community to vote on DAO proposals",
                color: "#6E59A5",
                delay: 200,
                image: "voteBlink.png",
              },
              {
                title: "NFT Marketplace",
                description:
                  "Create a Blink for trading NFTs directly inside supported wallets",
                color: "#8B5CF6",
                delay: 400,
                image: "nftBlink.png",
              },
              {
                title: "Gambling",
                description:
                  "Fun, chance-based interactions via an on-chain gambling Blink",
                color: "#8B5CF6",
                delay: 400,
              },
              {
                title: "Token Swap",
                description:
                  "Trigger a token swap from within the wallet using this Blink action",
                color: "#8B5CF6",
                delay: 400,
              },
            ].map((template, i) => (
              <CarouselItem key={i} className="pl-1 md:basis-1/2 lg:basis-1/3">
                <CardSpotlight
                  className="rounded-lg overflow-hidden border border-white/10 bg-card/20 hover-effect animate-on-scroll opacity-0 "
                  style={{ animationDelay: `${template.delay}ms` }}
                >
                  <div className="relative overflow-hidden rounded-xl">
                    <img
                      src={template.image}
                      alt={"image"}
                      className="w-full h-full object-contain rounded-2xl"
                    />
                  </div>

                  <div className="p-6 text-center relative">
                    <h3 className="font-semibold text-xl mb-2">
                      {template.title}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {template.description}
                    </p>
                  </div>
                </CardSpotlight>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        {templates.map((template, i) => (
          <div
            className="rounded-lg overflow-hidden border border-white/10 bg-card/20 hover-effect animate-on-scroll opacity-0 block md:hidden"
            style={{ animationDelay: `${template.delay}ms` }}
          >
            <div className="relative overflow-hidden rounded-xl">
              <img
                src={template.img}
                alt={"image"}
                className="w-full h-full object-contain rounded-2xl"
              />
            </div>

            <div className="p-6 text-center relative">
              <h3 className="font-semibold text-xl mb-2">{template.title}</h3>
              <p className="text-muted-foreground mb-4">
                {template.description}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 md:px-10 lg:px-20 neo-blur">
        <div className="max-w-4xl mx-auto text-center space-y-6 animate-on-scroll opacity-0">
          <h2 className="text-3xl md:text-4xl font-bold text-gradient">
            Start Building Your Blinks Today
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of creators and businesses building on the blinks
            without writing a single line of code.
          </p>
          <Button
            onClick={handleOnClick}
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
                  href="/features"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Features
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-3">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/docs"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="/guides"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Guides
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-3">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/contact"
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
