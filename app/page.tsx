'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, BarChart3, Users, Shield, Code, Sparkles, TrendingUp, Star, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

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

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast API',
      description: 'Integrate referral tracking with just a few API calls. Generate codes, track clicks, and record conversions in milliseconds.',
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Track referrals, clicks, conversions, and rewards with accurate real-time analytics and comprehensive KPIs.',
    },
    {
      icon: Users,
      title: 'Multi-Campaign',
      description: 'Create multiple campaigns per app with different reward models and configurations. Scale effortlessly.',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Built-in API usage tracking and soft limits with enterprise-grade authentication and compliance.',
    },
    {
      icon: Code,
      title: 'Developer First',
      description: 'RESTful API with comprehensive documentation. SDKs for popular languages. Built for developers.',
    },
    {
      icon: Sparkles,
      title: 'Smart Automation',
      description: 'Automated fraud detection, webhook delivery, and reward distribution. Set it and forget it.',
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <span className="text-2xl font-bold text-blue-600">@ReferralEngine</span>
            </motion.div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-blue-600 font-medium text-sm">
                Home
              </Link>
              <Link href="/services" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                Service List
              </Link>
              <Link href="/docs" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                Docs
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                Blog
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="px-4 py-2 border border-blue-600 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors"
              >
                Signin
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Signup
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Announcement Banner */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full mb-8"
          >
            <span className="text-sm font-medium text-blue-600">Major Update! Referral Engine v2.0 is now online!</span>
          </motion.div>

          {/* Main Hero Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-7">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={mounted ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold text-blue-600 mb-6 leading-tight"
              >
                Best Referral Tool <Sparkles className="inline w-10 h-10 text-blue-600" /> for Genuine Business Growth
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={mounted ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-xl text-gray-600 mb-8 max-w-2xl"
              >
                A perfect fit for SaaS Companies, E-commerce Stores, Mobile Apps, NFT Projects & Crypto companies.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={mounted ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="mb-8"
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/signup"
                    className="inline-flex items-center space-x-2 px-8 py-4 bg-blue-600 text-white font-semibold text-lg rounded-lg hover:bg-blue-700 transition-all shadow-lg"
                  >
                    <span>Signup for free today!</span>
                    <Sparkles className="w-5 h-5" />
                  </Link>
                </motion.div>
              </motion.div>

              {/* Social Proof */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={mounted ? { opacity: 1 } : {}}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="flex items-center space-x-4"
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white"
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold text-gray-900">4.8 / 5</span>
                  </div>
                  <p className="text-sm text-gray-600">Rating over 500 Reviews</p>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Floating Cards */}
            <div className="lg:col-span-5 relative">
              {/* Top Right Card - Notification */}
              <motion.div
                initial={{ opacity: 0, x: 50, y: -50 }}
                animate={mounted ? { opacity: 1, x: 0, y: 0 } : {}}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="absolute top-0 right-0 bg-white rounded-xl shadow-lg p-4 border border-gray-200 max-w-xs"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">You got New referrals! 🎉</p>
                    <p className="text-sm text-gray-500">Just now</p>
                  </div>
                </div>
              </motion.div>

              {/* Middle Right Card - Stats */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={mounted ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="absolute top-32 right-8 bg-white rounded-xl shadow-lg p-6 border border-gray-200 max-w-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Net Referral Gain</h3>
                  <div className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium flex items-center space-x-1">
                    <Zap className="w-3 h-3" />
                    <span>Boost Activated</span>
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">$550,000</div>
                <div className="text-sm text-gray-600 mb-4">Referrals 250,000</div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={mounted ? { width: '75%' } : {}}
                    transition={{ delay: 0.8, duration: 1 }}
                    className="h-full bg-blue-600 rounded-full"
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                  <span>Jul</span>
                  <span>Aug</span>
                </div>
              </motion.div>

              {/* Bottom Right Card - Order Progress */}
              <motion.div
                initial={{ opacity: 0, x: 50, y: 50 }}
                animate={mounted ? { opacity: 1, x: 0, y: 0 } : {}}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="absolute bottom-0 right-0 bg-white rounded-xl shadow-lg p-6 border border-gray-200 max-w-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Campaign #1345</h3>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">In Progress</span>
                </div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">@campaign_user</p>
                    <p className="text-sm text-gray-500">Active Campaign</p>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">1000/10,000</span>
                    <span className="text-gray-600">10%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={mounted ? { width: '10%' } : {}}
                      transition={{ delay: 1, duration: 1 }}
                      className="h-full bg-blue-600 rounded-full"
                    />
                  </div>
                </div>
                <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  Boost Active
                </button>
              </motion.div>

              {/* Bottom Left Card - Sales */}
              <motion.div
                initial={{ opacity: 0, x: -50, y: 50 }}
                animate={mounted ? { opacity: 1, x: 0, y: 0 } : {}}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="absolute bottom-0 left-0 bg-white rounded-xl shadow-lg p-6 border border-gray-200 max-w-xs"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">My Business</h3>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">Net Revenue</div>
                <div className="text-3xl font-bold text-gray-900 mb-2">$500,000</div>
                <div className="flex items-center space-x-2 text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-semibold">+110%</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pills */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap justify-center gap-4"
          >
            {[
              { icon: Zap, text: 'Starting at Just $0.001/K' },
              { icon: Shield, text: 'Non-drop services' },
              { icon: CheckCircle2, text: 'Lifetime Refills' },
              { icon: Users, text: '24/7 Support' }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className="flex items-center space-x-2 px-6 py-3 bg-white rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <Icon className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">{item.text}</span>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
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
              Everything You Need to Scale
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed for modern referral programs
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={fadeInUp}
                  whileHover={{ y: -4 }}
                  className="bg-white p-8 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Supported Platforms */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Providing solutions for best platforms
            </h2>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap justify-center items-center gap-8 opacity-40"
          >
            {['YouTube', 'Twitter', 'Instagram', 'TikTok', 'Facebook', 'LinkedIn'].map((platform, index) => (
              <motion.div
                key={platform}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 0.4, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="text-2xl font-bold text-gray-400"
              >
                {platform}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center bg-blue-600 rounded-2xl p-12 md:p-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of companies using Referral Engine to grow their business
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/signup"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-blue-600 font-semibold text-lg rounded-lg hover:shadow-2xl transition-all duration-300"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="/product" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/services" className="hover:text-white transition-colors">Services</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link href="/docs" className="hover:text-white transition-colors">API Docs</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Account</h3>
              <ul className="space-y-2">
                <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p>&copy; 2024 Referral Engine. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
