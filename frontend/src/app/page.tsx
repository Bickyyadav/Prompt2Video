'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    try {
      // const response = await fetch('http://2349a7a1-caa7-4eb3-a28a-5647cf81a9a5.k8s.civo.com/c/prompt', {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/c/prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt }),
      });
      console.log("🔴🔴🔴🔴🔴🔴");
      console.log(response);
      if (!response.ok) {
        throw new Error('Failed to generate');
      }
      const data = await response.json();
      console.log("🔴🔴🔴🔴🔴🔴");
      console.log(data);
      if (data && data.id) {
        // Navigate directly to the video results page with the ID
        router.push(`/video/${data.id}`);
      } else {
        console.error('No ID returned');
        // Fallback or error handling
      }
    } catch (error) {
      console.error('Error:', error);
      // Ideally show an error message to the user
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-black selection:bg-purple-500/30">

      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

      <main className="relative z-10 w-full max-w-3xl px-6 text-center space-y-8">

        {/* Hero Text */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
            Transform Ideas into <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">Video</span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto">
            Enter your concept below and let our AI engine craft a stunning visual narrative for you in seconds.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto group">
          <div className="relative flex items-center">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your video idea..."
              disabled={isLoading}
              className="w-full px-6 py-4 bg-neutral-900/50 border border-neutral-800 rounded-2xl md:rounded-full text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all shadow-2xl backdrop-blur-xl text-lg disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!prompt.trim() || isLoading}
              className="absolute right-2 md:right-3 p-3 md:px-6 md:py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl md:rounded-full font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/25 active:scale-95 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="hidden md:inline">Generating...</span>
                </>
              ) : (
                <>
                  <span className="hidden md:inline">Generate</span>
                  <span className="md:hidden">→</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Floating Tags / Examples */}
        <div className="flex flex-wrap justify-center gap-3 text-sm text-neutral-500 pt-8">
          <span className="px-3 py-1 rounded-full border border-neutral-800 bg-neutral-900/30 hover:border-neutral-700 transition-colors cursor-default">
            ✨ physics simulations
          </span>
          <span className="px-3 py-1 rounded-full border border-neutral-800 bg-neutral-900/30 hover:border-neutral-700 transition-colors cursor-default">
            📊 data visualization
          </span>
          <span className="px-3 py-1 rounded-full border border-neutral-800 bg-neutral-900/30 hover:border-neutral-700 transition-colors cursor-default">
            🚀 product teasers
          </span>
        </div>
      </main>

      <footer className="absolute bottom-6 text-neutral-600 text-sm">
        Powered by Advanced Agentic Coding
      </footer>
    </div>
  );
}
