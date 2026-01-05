'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';

// Mock Data for "Medium Level" look
const STEPS = [
    { id: 1, name: 'Concept Analysis', status: 'completed', time: '0.4s' },
    { id: 2, name: 'Script Generation', status: 'completed', time: '1.2s' },
    { id: 3, name: 'Scene Composition', status: 'completed', time: '0.8s' },
    { id: 4, name: 'Rendering Video', status: 'processing', time: '...' },
];

export default function VideoPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { id } = resolvedParams;

    const [aiPrompt, setAiPrompt] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>(['[00:00:01] INFO Initializing...']);
    const [isConsoleExpanded, setIsConsoleExpanded] = useState(false);

    // Polling for AI Prompt
    useEffect(() => {
        if (aiPrompt) return;

        let intervalId: NodeJS.Timeout;

        const fetchPrompt = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/c/prompt?id=${id}`);
                if (response.ok) {
                    const data = await response.json();
                    // Assuming the backend returns { ai_generated_prompt: "...", title: "..." }
                    if (data && data.ai_generated_prompt) {
                        setAiPrompt(data.ai_generated_prompt);
                        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] SUCCESS AI Context Received`]);
                        clearInterval(intervalId);
                    }
                }
            } catch (error) {
                console.error("Polling error:", error);
            }
        };

        intervalId = setInterval(fetchPrompt, 2000);
        fetchPrompt();

        return () => clearInterval(intervalId);
    }, [id, aiPrompt]);

    // Polling for Video URL
    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        const fetchVideo = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/c/cloudinary_url?id=${id}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.cloudinary_url) {
                        setVideoUrl(data.cloudinary_url);
                        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] SUCCESS Video Rendered`]);
                        clearInterval(intervalId);
                    }
                }
            } catch (error) {
                console.error("Video Polling error:", error);
            }
        };

        // Check every 3 seconds for video
        intervalId = setInterval(fetchVideo, 3000);
        fetchVideo();

        return () => clearInterval(intervalId);
    }, [id]);

    // Helper to render the structured AI prompt
    const renderAiPrompt = () => {
        if (!aiPrompt) return <p className="animate-pulse text-neutral-600">Waiting for AI generation...</p>;

        try {
            // Attempt to parse strictly if it looks like JSON
            let parsedData = null;
            if (typeof aiPrompt === 'string' && (aiPrompt.trim().startsWith('[') || aiPrompt.trim().startsWith('{'))) {
                parsedData = JSON.parse(aiPrompt);
            }

            if (!parsedData || !Array.isArray(parsedData)) {
                // Fallback to text if not array or parse fails
                return (
                    <div className="p-4 bg-neutral-800/30 rounded-lg border border-neutral-700/50 text-neutral-300 whitespace-pre-wrap font-mono text-xs">
                        <span className="text-purple-400 font-bold block mb-2">RAW OUTPUT:</span>
                        {aiPrompt}
                    </div>
                );
            }

            // Structured Render
            return (
                <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                        <h3 className="text-purple-400 font-bold text-sm">GENERATED SCENE PLAN</h3>
                        <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20">JSON PARSED</span>
                    </div>

                    {parsedData.map((chunk: any, i: number) => (
                        <div key={i} className="space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="flex items-center justify-center w-5 h-5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-bold ring-1 ring-blue-500/50">
                                    {chunk.chunk_index || i + 1}
                                </span>
                                <h4 className="text-white font-medium text-sm">{chunk.chunk_title}</h4>
                            </div>

                            <p className="text-xs text-neutral-500 pl-7 italic mb-2">
                                {chunk.chunk_purpose}
                            </p>

                            <div className="pl-4 border-l border-neutral-800 space-y-3">
                                {chunk.scenes?.map((scene: any, j: number) => (
                                    <div key={j} className="bg-neutral-900/80 rounded-lg border border-neutral-800 p-3 hover:border-neutral-700 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-semibold text-neutral-300">{scene.scene_title}</span>
                                            <span className="text-[10px] text-neutral-600 font-mono">{scene.estimated_duration_seconds}s</span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                                            <div className="bg-black/40 p-2 rounded border border-neutral-800/50">
                                                <span className="text-[10px] text-blue-400 font-bold block mb-1">VISUALS</span>
                                                <p className="text-[11px] text-neutral-400 leading-relaxed">{scene.visual_plan}</p>
                                            </div>
                                            <div className="bg-black/40 p-2 rounded border border-neutral-800/50">
                                                <span className="text-[10px] text-green-400 font-bold block mb-1">NARRATION</span>
                                                <ul className="list-disc list-inside space-y-1">
                                                    {Array.isArray(scene.narration_flow)
                                                        ? scene.narration_flow.map((line: string, k: number) => (
                                                            <li key={k} className="text-[11px] text-neutral-400 leading-relaxed truncate">{line}</li>
                                                        ))
                                                        : <li className="text-[11px] text-neutral-400">{scene.narration_flow}</li>
                                                    }
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            );

        } catch (e) {
            // Fallback on parse error
            return (
                <div className="p-4 bg-red-900/10 rounded-lg border border-red-500/20 text-red-200 whitespace-pre-wrap font-mono text-xs">
                    <span className="text-red-400 font-bold block mb-2">PARSE ERROR (Showing Raw):</span>
                    {aiPrompt}
                </div>
            );
        }
    };

    return (
        <div className="flex h-screen bg-black text-foreground overflow-hidden">

            {/* Sidebar */}
            <aside className="w-64 border-r border-neutral-800 bg-neutral-900/50 flex flex-col hidden md:flex">
                <div className="p-6 border-b border-neutral-800">
                    <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                        ManimGen
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <div className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Project</div>
                    <button className="w-full text-left px-4 py-2 bg-neutral-800/50 text-white rounded-lg border border-neutral-700/50">
                        Overview
                    </button>
                    <button className="w-full text-left px-4 py-2 text-neutral-400 hover:text-white hover:bg-neutral-800/30 rounded-lg transition-colors">
                        Assets
                    </button>
                    <button className="w-full text-left px-4 py-2 text-neutral-400 hover:text-white hover:bg-neutral-800/30 rounded-lg transition-colors">
                        Settings
                    </button>
                </nav>

                <div className="p-4 border-t border-neutral-800">
                    <div className="text-xs text-neutral-500">
                        Session ID: <span className="font-mono text-neutral-400">{id.slice(0, 8)}...</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden">

                {/* Header */}
                <header className="h-16 border-b border-neutral-800 flex items-center justify-between px-6 bg-neutral-900/20 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="md:hidden text-neutral-400">←</Link>
                        <h1 className="text-lg font-medium text-white">Project: {id}</h1>
                        <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 text-xs border border-yellow-500/20">
                            {videoUrl ? 'Completed' : 'Processing'}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="px-4 py-1.5 bg-neutral-800 text-white text-sm rounded-md border border-neutral-700 hover:bg-neutral-700 transition-colors">
                            Download Script
                        </button>
                        <button className="px-4 py-1.5 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-500 transition-colors shadow-lg shadow-purple-900/20">
                            Export Video
                        </button>
                    </div>
                </header>

                {/* Dashboard Grid */}
                <div className="flex-1 overflow-auto p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">

                        {/* Left Column: Preview */}
                        <div className="lg:col-span-2 flex flex-col gap-6">
                            {/* Video Player Placeholder */}
                            <div className="aspect-video bg-neutral-900 rounded-xl border border-neutral-800 relative group overflow-hidden flex items-center justify-center">
                                {videoUrl ? (
                                    <div className="absolute inset-0 z-20">
                                        <video
                                            src={videoUrl}
                                            controls
                                            autoPlay
                                            loop
                                            className="w-full h-full object-cover"
                                        >
                                            Your browser does not support the video tag.
                                        </video>
                                    </div>
                                ) : (
                                    <>
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent opacity-50" />

                                        {/* Grid lines for 'technical' look */}
                                        <div className="absolute inset-0" style={{
                                            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
                                            backgroundSize: '40px 40px'
                                        }} />

                                        <div className="text-center z-10 space-y-2">
                                            <div className="w-16 h-16 mx-auto bg-neutral-800 rounded-full flex items-center justify-center mb-4 shadow-2xl animate-pulse">
                                                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1" />
                                            </div>
                                            <p className="text-neutral-400 text-sm">Preview Rendering...</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Timeline / Console */}
                            {/* Timeline / Console */}
                            <div className={`
                                transition-all duration-300 ease-in-out flex flex-col font-mono text-sm overflow-hidden
                                ${isConsoleExpanded
                                    ? 'fixed inset-0 z-50 bg-black/90 backdrop-blur-xl p-8'
                                    : 'flex-1 bg-neutral-900/50 rounded-xl border border-neutral-800 p-4'}
                            `}>
                                <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-neutral-400 font-medium tracking-wide">System Output</span>
                                        {isConsoleExpanded && (
                                            <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                                LIVE MONITOR
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setIsConsoleExpanded(!isConsoleExpanded)}
                                            className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-neutral-400 hover:text-white"
                                            title={isConsoleExpanded ? "Minimize" : "Maximize"}
                                        >
                                            {isConsoleExpanded ? (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M20 8V4m0 0h-4M4 16v4m0 0h4M20 16v4m0 0h-4" />
                                                </svg>
                                            )}
                                        </button>
                                        <div className="flex gap-1.5">
                                            <div className="w-3 h-3 rounded-full bg-red-500/20 ring-1 ring-black/50" />
                                            <div className="w-3 h-3 rounded-full bg-yellow-500/20 ring-1 ring-black/50" />
                                            <div className="w-3 h-3 rounded-full bg-green-500/20 ring-1 ring-black/50" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-auto space-y-2 text-xs text-neutral-500 custom-scrollbar">
                                    {/* Render the new Structured prompt or fallback */}
                                    <div className={isConsoleExpanded ? "max-w-5xl mx-auto w-full" : ""}>
                                        {renderAiPrompt()}
                                    </div>

                                    {/* Basic poller logs */}
                                    <div className={`mt-4 pt-4 border-t border-white/5 space-y-1 ${isConsoleExpanded ? "max-w-5xl mx-auto w-full" : ""}`}>
                                        {logs.map((log, i) => (
                                            <p key={i} className="opacity-60 hover:opacity-100 transition-opacity font-mono">
                                                <span className="text-neutral-600 mr-2">{log.split(']')[0]}]</span>
                                                <span className={log.includes('SUCCESS') ? 'text-green-400' : 'text-neutral-300'}>
                                                    {log.split(']').slice(1).join(']')}
                                                </span>
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Details */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Progress Card */}
                            <div className="bg-neutral-900/50 rounded-xl border border-neutral-800 p-5">
                                <h3 className="font-semibold text-white mb-4">Generation Status</h3>
                                <div className="space-y-4">
                                    {STEPS.map((step) => (
                                        <div key={step.id} className="flex items-center gap-3">
                                            <div className={`
                                        w-6 h-6 rounded-full flex items-center justify-center text-[10px] border 
                                        ${step.status === 'completed' ? 'bg-green-500/10 border-green-500/50 text-green-500' :
                                                    step.status === 'processing' ? 'bg-blue-500/10 border-blue-500/50 text-blue-500 animate-pulse' :
                                                        'bg-neutral-800 border-neutral-700 text-neutral-500'}
                                    `}>
                                                {step.status === 'completed' ? '✓' : step.id}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between text-sm">
                                                    <span className={step.status === 'processing' ? 'text-white' : 'text-neutral-400'}>
                                                        {step.name}
                                                    </span>
                                                    <span className="text-xs text-neutral-600 font-mono">{step.time}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Metadata Card */}
                            <div className="bg-neutral-900/50 rounded-xl border border-neutral-800 p-5">
                                <h3 className="font-semibold text-white mb-4">Scene Details</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between py-2 border-b border-neutral-800">
                                        <span className="text-neutral-500">Resolution</span>
                                        <span className="text-white font-mono">1920x1080</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-neutral-800">
                                        <span className="text-neutral-500">Duration</span>
                                        <span className="text-white font-mono">~15s</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-neutral-800">
                                        <span className="text-neutral-500">Frame Rate</span>
                                        <span className="text-white font-mono">60fps</span>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <span className="text-neutral-500">Renderer</span>
                                        <span className="text-purple-400 font-mono">ManimGL</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
