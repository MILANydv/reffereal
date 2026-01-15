'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Zap, BarChart3, Shield, Code, Webhook, Users, 
  TrendingUp, Lock, Globe, Sparkles, ArrowRight,
  CheckCircle2, Database, Cpu, Activity
} from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function ProductPage() {
  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast API',
      description: 'Sub-100ms response times with 99.9% uptime SLA. Built for scale with global CDN distribution.',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Track referrals, conversions, and revenue in real-time with beautiful, customizable dashboards.',
      color: 'from-blue-400 to-cyan-500'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'SOC 2 compliant with end-to-end encryption, role-based access control, and audit logs.',
      color: 'from-green-400 to-emerald-500'
    },
    {
      icon: Code,
      title: 'Developer Experience',
      description: 'RESTful API with comprehensive docs, SDKs for 10+ languages, and interactive API explorer.',
      color: 'from-indigo-400 to-blue-500'
    },
    {
      icon: Webhook,
      title: 'Webhooks & Events',
      description: 'Real-time event notifications for conversions, fraud detection, and custom business logic.',
      color: 'from-purple-400 to-pink-500'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Invite team members, assign roles, and collaborate on campaigns with granular permissions.',
      color: 'from-rose-400 to-pink-500'
    },
    {
      icon: TrendingUp,
      title: 'Advanced Fraud Detection',
      description: 'AI-powered fraud detection to prevent abuse and ensure legitimate referrals only.',
      color: 'from-red-400 to-orange-500'
    },
    {
      icon: Database,
      title: 'Data Export',
      description: 'Export your data anytime in CSV, JSON, or via API. Full data portability guaranteed.',
      color: 'from-teal-400 to-cyan-500'
    }
  ];

  const capabilities = [
    {
      title: 'Multi-Campaign Management',
      items: [
        'Create unlimited campaigns per app',
        'Different reward models per campaign',
        'A/B testing capabilities',
        'Campaign scheduling and automation'
      ]
    },
    {
      title: 'Flexible Reward Models',
      items: [
        'Fixed amount rewards',
        'Percentage-based rewards',
        'Tiered reward structures',
        'Custom reward logic via API'
      ]
    },
    {
      title: 'Comprehensive Tracking',
      items: [
        'Referral code generation',
        'Click tracking and attribution',
        'Conversion tracking',
        'Revenue tracking and reporting'
      ]
    },
    {
      title: 'Integration Ready',
      items: [
        'RESTful API',
        'Webhook support',
        'SDKs for popular languages',
        'Zapier and Make.com integrations'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Referral Engine
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Powerful Features for
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Modern Referral Programs
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to build, manage, and scale referral programs that drive real growth.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Built for Scale
            </h2>
            <p className="text-xl text-gray-600">
              Enterprise-grade features that grow with your business
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={fadeInUp}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive tools for managing referral programs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {capabilities.map((capability, index) => (
              <motion.div
                key={capability.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-100"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6">{capability.title}</h3>
                <ul className="space-y-4">
                  {capability.items.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '99.9%', label: 'Uptime SLA' },
              { value: '<100ms', label: 'API Response' },
              { value: '10+', label: 'SDKs Available' },
              { value: '24/7', label: 'Support' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-blue-100">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 md:p-16 shadow-2xl"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Start building powerful referral programs today. No credit card required.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/signup"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-blue-600 font-semibold text-lg rounded-xl hover:shadow-2xl transition-all duration-300"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}

