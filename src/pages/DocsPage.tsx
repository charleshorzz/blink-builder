
import React from 'react';
import Navigation from '@/components/Navigation';

const DocsPage = () => {
  // Mock function for connecting wallet
  const connectWallet = () => {
    console.log("Connect wallet clicked from docs page");
  };

  return (
    <div className="min-h-screen flex flex-col animated-bg">
      <Navigation isLoggedIn={false} connectWallet={connectWallet} />
      
      <div className="container mx-auto pt-32 px-4">
        <h1 className="text-4xl font-bold mb-8 text-gradient">Documentation</h1>
        
        <div className="prose prose-invert max-w-3xl">
          <h2>Getting Started</h2>
          <p>
            BlockBuilder is a no-code platform for creating Web3 applications. 
            This documentation will guide you through using our platform effectively.
          </p>
          
          <h2>Templates</h2>
          <p>
            BlockBuilder offers various templates for different Web3 use cases. 
            Choose a template that best fits your project needs.
          </p>
          
          <h2>Components</h2>
          <p>
            Our drag and drop builder includes a wide range of Web3 components that 
            can be customized to build your application.
          </p>
          
          <h2>Deployment</h2>
          <p>
            Once your application is ready, you can deploy it with a single click. 
            We provide a shareable link that you can distribute to your users.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DocsPage;
