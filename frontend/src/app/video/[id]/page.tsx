'use client';

import { use } from 'react';
import Link from 'next/link';

// Mock Data for "Medium Level" look
const STEPS = [
    { id: 1, name: 'Concept Analysis', status: 'completed', time: '0.4s' },
    { id: 2, name: 'Script Generation', status: 'completed', time: '1.2s' },
    { id: 3, name: 'Scene Composition', status: 'completed', time: '0.8s' },
    { id: 4, name: 'Rendering Video', status: 'processing', time: '...' },
];

export default function VideoPage({ params }: { params: Promise<{ id: string }> }) {
    // Unrap params using React.use() or await in async component (Next.js 15+)
    // Since this is 'use client', we handle the promise if passed, or just type it as is if Next version < 15.
    // The 'use' hook is the standard for params in recent Next.js.
    const resolvedParams = use(params);
    const { id } = resolvedParams;

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
                            Processing
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
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent opacity-50" />

                                {/* Grid lines for 'technical' look */}
                                <div className="absolute inset-0" style={{
                                    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
                                    backgroundSize: '40px 40px'
                                }} />

                                <div className="text-center z-10 space-y-2">
                                    <div className="w-16 h-16 mx-auto bg-neutral-800 rounded-full flex items-center justify-center mb-4 shadow-2xl">
                                        <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1" />
                                    </div>
                                    <p className="text-neutral-400 text-sm">Preview Rendering...</p>
                                </div>
                            </div>

                            {/* Timeline / Console */}
                            <div className="flex-1 bg-neutral-900/50 rounded-xl border border-neutral-800 p-4 font-mono text-sm overflow-hidden flex flex-col">
                                <div className="flex items-center justify-between mb-2 pb-2 border-b border-neutral-800">
                                    <span className="text-neutral-400">System Output</span>
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-500/20" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/20" />
                                    </div>
                                </div>
                                <div className="flex-1 overflow-auto space-y-1 text-xs text-neutral-500">
                                    <p>[00:00:01] <span className="text-blue-400">INFO</span> Initializing scene graph...</p>
                                    <p>[00:00:02] <span className="text-blue-400">INFO</span> Loading assets for ID: {id}</p>
                                    <p>[00:00:04] <span className="text-purple-400">PROCESS</span> Generating vector animations...</p>
                                    <p>[00:00:06] <span className="text-yellow-400">WARN</span> Complexity high, optimization enabled.</p>
                                    <p className="animate-pulse">_</p>
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
