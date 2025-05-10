import React from "react";
import Navigation from "@/app/components/Navigation";
import { Button } from "@/app/components/ui/button";
import { Check } from "lucide-react";

const PricingPage = () => {
  // Mock function for connecting wallet
  const connectWallet = () => {
    console.log("Connect wallet clicked from pricing page");
  };

  return (
    <div className="min-h-screen flex flex-col animated-bg">
      <Navigation isLoggedIn={false} connectWallet={connectWallet} />

      <div className="container mx-auto pt-32 px-4 pb-20">
        <h1 className="text-4xl font-bold mb-4 text-center text-gradient">
          Simple, transparent pricing
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-16 text-center">
          Choose the plan that's right for your project
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Tier */}
          <div className="border border-white/10 rounded-lg p-6 backdrop-blur-md">
            <h3 className="text-xl font-semibold mb-2">Free</h3>
            <p className="text-4xl font-bold mb-6">
              $0
              <span className="text-muted-foreground text-sm font-normal">
                /month
              </span>
            </p>
            <hr className="border-white/10 mb-6" />
            <ul className="space-y-4 mb-8">
              {["3 projects", "Basic templates", "Community support"].map(
                (feature, i) => (
                  <li key={i} className="flex items-center">
                    <Check size={18} className="mr-2 text-builder-accent" />{" "}
                    {feature}
                  </li>
                )
              )}
            </ul>
            <Button variant="outline" className="w-full">
              Get Started
            </Button>
          </div>

          {/* Pro Tier */}
          <div className="border-2 border-builder-accent rounded-lg p-6 backdrop-blur-md relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-builder-accent px-4 py-1 rounded-full text-sm font-medium">
              Popular
            </div>
            <h3 className="text-xl font-semibold mb-2">Pro</h3>
            <p className="text-4xl font-bold mb-6">
              $29
              <span className="text-muted-foreground text-sm font-normal">
                /month
              </span>
            </p>
            <hr className="border-white/10 mb-6" />
            <ul className="space-y-4 mb-8">
              {[
                "Unlimited projects",
                "All templates",
                "Priority support",
                "Custom domains",
                "No branding",
              ].map((feature, i) => (
                <li key={i} className="flex items-center">
                  <Check size={18} className="mr-2 text-builder-accent" />{" "}
                  {feature}
                </li>
              ))}
            </ul>
            <Button className="w-full bg-builder-accent hover:bg-builder-accent/80">
              Buy Pro
            </Button>
          </div>

          {/* Enterprise Tier */}
          <div className="border border-white/10 rounded-lg p-6 backdrop-blur-md">
            <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
            <p className="text-4xl font-bold mb-6">Custom</p>
            <hr className="border-white/10 mb-6" />
            <ul className="space-y-4 mb-8">
              {[
                "Unlimited projects",
                "Custom templates",
                "Dedicated support",
                "Advanced security",
                "SLA guarantee",
              ].map((feature, i) => (
                <li key={i} className="flex items-center">
                  <Check size={18} className="mr-2 text-builder-accent" />{" "}
                  {feature}
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full">
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
