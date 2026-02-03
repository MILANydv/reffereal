'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Clock, Globe, Shield, Zap } from 'lucide-react';

export default function StatusPage() {
    const systems = [
        { name: 'API Gateway', status: 'operational', uptime: '100%' },
        { name: 'Dashboard UI', status: 'operational', uptime: '99.98%' },
        { name: 'Email Services', status: 'operational', uptime: '100%' },
        { name: 'Fraud Detection engine', status: 'operational', uptime: '100%' },
        { name: 'Database Clusters', status: 'operational', uptime: '100%' },
        { name: 'Webhooks delivery', status: 'operational', uptime: '99.95%' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b py-6">
                <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
                    <Link href="/">
                        <img src="/logos/logo.png" alt="Incenta Logo" className="h-10 w-auto" />
                    </Link>
                    <div className="flex items-center gap-2 text-green-600 font-bold">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>All Systems Operational</span>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-12">
                <div className="bg-white rounded-2xl shadow-sm border p-8 mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">System Status</h1>
                    <div className="space-y-6">
                        {systems.map((system) => (
                            <div key={system.name} className="flex justify-between items-center py-4 border-b last:border-0">
                                <div>
                                    <h3 className="font-semibold text-gray-900">{system.name}</h3>
                                    <p className="text-sm text-gray-500">Uptime: {system.uptime}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                                    <span className="text-sm font-medium text-green-700 capitalize">{system.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    <div className="bg-white rounded-2xl shadow-sm border p-6">
                        <div className="flex items-center gap-3 mb-4 text-blue-600">
                            <Zap className="w-6 h-6" />
                            <h2 className="text-xl font-bold">API Performance</h2>
                        </div>
                        <p className="text-gray-600 mb-4">Average response time across all regions.</p>
                        <div className="text-3xl font-bold text-gray-900">84ms</div>
                        <p className="text-xs text-gray-400 mt-2">Last updated 1 minute ago</p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border p-6">
                        <div className="flex items-center gap-3 mb-4 text-indigo-600">
                            <Shield className="w-6 h-6" />
                            <h2 className="text-xl font-bold">Global Uptime</h2>
                        </div>
                        <p className="text-gray-600 mb-4">Combined platform availability (Trailing 30 days).</p>
                        <div className="text-3xl font-bold text-gray-900">99.992%</div>
                        <p className="text-xs text-gray-400 mt-2">Last updated 1 minute ago</p>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-gray-500 mb-4">Need help? Visit our <Link href="/contact" className="text-blue-600 hover:underline">Support Center</Link></p>
                    <p className="text-xs text-gray-400">© {new Date().getFullYear()} Incenta. Engineered for Nepal's viral velocity.</p>
                </div>
            </main>
        </div>
    );
}
