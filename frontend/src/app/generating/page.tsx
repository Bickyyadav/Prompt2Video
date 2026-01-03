'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function GeneratingContent() {
    const searchParams = useSearchParams();
    const prompt = searchParams.get('prompt');
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!prompt) {
            router.push('/');
            return;
        }

        const generateVideo = async () => {
            try {
                const response = await fetch('https://2349a7a1-caa7-4eb3-a28a-5647cf81a9a5.k8s.civo.com/c/prompt', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ prompt: prompt }),
                });

                if (!response.ok) {
                    throw new Error(`Server responded with ${response.status}`);
                }

                const data = await response.json();

                // Assuming data contains the ID, e.g. { id: "..." }
                if (data && data.id) {
                    router.push(`/video/${data.id}`);
                } else {
                    throw new Error('Invalid response format: No ID received');
                }

            } catch (err: any) {
                console.error("Generation failed:", err);
                setError(err.message || 'Something went wrong');
            }
        };

        generateVideo();
    }, [prompt, router]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 text-center">
                <div className="text-red-500 bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                    <p className="font-semibold">Generation Failed</p>
                    <p className="text-sm opacity-80">{error}</p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
                >
                    Try Again
                </button>
                <button
                    onClick={() => router.push('/')}
                    className="px-6 py-2 text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-12">
            {/* Loading Animation */}
            <div className="relative">
                <div className="w-24 h-24 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-4 border-blue-500/30 border-b-blue-500 rounded-full animate-spin direction-reverse" />
            </div>

            <div className="space-y-2 text-center">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 animate-pulse">
                    Constructing Scene
                </h2>
                <p className="text-neutral-500 max-w-md">
                    We are processing your prompt: <br />
                    <span className="text-neutral-300 italic">"{prompt}"</span>
                </p>
            </div>
        </div>
    );
}

export default function GeneratingPage() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-white">
            <Suspense fallback={<div className="text-neutral-500">Initializing...</div>}>
                <GeneratingContent />
            </Suspense>
        </div>
    );
}
