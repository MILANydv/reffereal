'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Link2, BarChart3, Gift, Shield, Code, 
  CheckCircle2, Zap, Users, ShoppingBag, GraduationCap, 
  Building2, TrendingUp, Lock, FileText, BookOpen,
  Calendar, Play
} from 'lucide-react';
import { useEffect, useState } from 'react';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    setMounted(true);
  }, []);

  const problems = [
    {
      icon: FileText,
      title: 'Manually Tracked',
      description: 'Spreadsheets and manual tracking lead to errors and missed referrals'
    },
    {
      icon: Shield,
      title: 'Easy to Exploit',
      description: 'Lack of fraud detection allows abuse and misattribution'
    },
    {
      icon: Gift,
      title: 'Reward Delays',
      description: 'Manual reward processing causes delays and customer frustration'
    },
    {
      icon: BarChart3,
      title: 'No ROI Visibility',
      description: 'Impossible to measure referral program performance and impact'
    }
  ];

  const features = [
    {
      icon: Link2,
      title: 'Smart Referral Links',
      items: [
        'Unique referral links & codes per user',
        'Web, mobile, and app-ready',
        'Auto-attribution without cookies'
      ],
      image: '📱'
    },
    {
      icon: BarChart3,
      title: 'Real-Time Tracking Dashboard',
      items: [
        'Track clicks, signups, conversions',
        'See top referrers instantly',
        'Conversion funnel analytics'
      ],
      image: '📊'
    },
    {
      icon: Gift,
      title: 'Flexible Rewards Engine',
      items: [
        'Cash, wallet credit, discounts, points',
        'Single-sided or double-sided rewards',
        'Automated reward approval & release'
      ],
      image: '🎁'
    },
    {
      icon: Shield,
      title: 'Fraud Prevention',
      items: [
        'Duplicate detection',
        'Self-referral blocking',
        'IP, device & behavior checks'
      ],
      image: '🛡️'
    },
    {
      icon: Code,
      title: 'Easy Integration',
      items: [
        'REST API & Webhooks',
        'Works with Stripe, Razorpay, PayPal',
        'Embed in existing apps or websites'
      ],
      image: '⚙️'
    }
  ];

  const steps = [
    {
      number: '1',
      title: 'Create a Referral Campaign',
      description: 'Define rewards, rules, and eligibility'
    },
    {
      number: '2',
      title: 'Users Share Their Link',
      description: 'Via WhatsApp, email, social media, or SMS'
    },
    {
      number: '3',
      title: 'Friends Sign Up or Purchase',
      description: 'Automatically tracked and attributed'
    },
    {
      number: '4',
      title: 'Rewards Are Issued',
      description: 'Instantly or after verification'
    }
  ];

  const useCases = [
    { icon: Code, name: 'SaaS & Subscription', benefit: 'Reduce churn with referral incentives' },
    { icon: ShoppingBag, name: 'E-commerce Stores', benefit: 'Drive organic growth' },
    { icon: Building2, name: 'Fintech & Wallet Apps', benefit: 'Increase user acquisition' },
    { icon: GraduationCap, name: 'EdTech & Courses', benefit: 'Scale student referrals' },
    { icon: Users, name: 'Marketplaces', benefit: 'Grow both sides of the platform' },
    { icon: Building2, name: 'Local MSMEs', benefit: 'Affordable referral automation' }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: 'Free',
      period: '',
      description: 'For early-stage teams',
      features: [
        'Up to 1,000 referrals/month',
        'Basic tracking',
        'Email support',
        'Standard fraud detection'
      ],
      cta: 'Get Started',
      popular: false
    },
    {
      name: 'Growth',
      price: '$29',
      period: '/month',
      description: 'Advanced analytics & automation',
      features: [
        'Unlimited referrals',
        'Advanced analytics',
        'Automated rewards',
        'Priority support',
        'Custom integrations'
      ],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'White-label, SLA, dedicated support',
      features: [
        'Everything in Growth',
        'White-label solution',
        'SLA guarantee',
        'Dedicated account manager',
        'Custom contracts'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  const screens = [
    { id: 'dashboard', name: 'Admin Dashboard', icon: BarChart3 },
    { id: 'analytics', name: 'Referral Analytics', icon: TrendingUp },
    { id: 'rewards', name: 'Reward Configuration', icon: Gift },
    { id: 'user', name: 'User Referral Page', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="sticky top-0 z-50 bg-white border-b border-gray-200 h-18"
      >
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Referral Engine
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/product" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
              Product
            </Link>
            <Link href="/#features" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
              Pricing
            </Link>
            <Link href="/docs" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
              Docs
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </motion.header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 px-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30 -z-10" />
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
              {/* Left Column (60%) */}
              <div className="lg:col-span-3">
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={mounted ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8 }}
                  className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight"
                >
                  Automate Your Referral Program in Minutes
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={mounted ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="text-xl text-gray-600 mb-8 max-w-2xl"
                >
                  Track referrals, attribute conversions, and reward customers automatically. 
                  Focus on growth while we handle the complexity.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={mounted ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="flex flex-col sm:flex-row gap-4 mb-6"
                >
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Link
                      href="/signup"
                      className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                    >
                      Get Started Free
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center px-8 py-4 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all"
                    >
                      <Calendar className="mr-2 w-5 h-5" />
                      Book a Demo
                    </Link>
                  </motion.div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={mounted ? { opacity: 1 } : {}}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="flex items-center space-x-6 text-sm text-gray-500"
                >
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span>14-day free trial</span>
                  </div>
                </motion.div>
              </div>

              {/* Right Column (40%) - Dashboard Mockup */}
              <div className="lg:col-span-2 relative">
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={mounted ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Referral Dashboard</h3>
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-600">1,234</div>
                        <div className="text-sm text-gray-600">Total Referrals</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-600">$45K</div>
                        <div className="text-sm text-gray-600">Revenue</div>
                      </div>
                    </div>
                    <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-12 h-12 text-gray-400" />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Statement */}
        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Most Referral Programs Fail Because They Are:
              </h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {problems.map((problem, index) => {
                const Icon = problem.icon;
                return (
                  <motion.div
                    key={problem.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    className="bg-white p-6 rounded-xl border border-gray-200"
                  >
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{problem.title}</h3>
                    <p className="text-gray-600">{problem.description}</p>
                  </motion.div>
                );
              })}
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-center mt-12"
            >
              <p className="text-xl text-gray-700">
                As a result, businesses lose potential growth from their most trusted channel: <strong>word-of-mouth</strong>.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Solution Overview */}
        <section className="py-20 px-6 bg-blue-50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Our Referral Management System
              </h2>
              <p className="text-xl text-gray-700 mb-8">
                Automates the entire referral lifecycle — from link generation to reward payouts — in one simple platform.
              </p>
              <p className="text-lg text-gray-600">
                <strong>You focus on growth.</strong> We handle the tracking, attribution, and incentives.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Key Features */}
        <section id="features" className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Key Features</h2>
            </motion.div>
            <div className="space-y-24">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                const isEven = index % 2 === 0;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${!isEven ? 'lg:grid-flow-dense' : ''}`}
                  >
                    <div className={!isEven ? 'lg:col-start-2' : ''}>
                      <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                        <Icon className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                      <ul className="space-y-3">
                        {feature.items.map((item, idx) => (
                          <li key={idx} className="flex items-start space-x-3">
                            <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className={`bg-gray-100 rounded-2xl p-12 flex items-center justify-center min-h-[300px] ${!isEven ? 'lg:col-start-1' : ''}`}>
                      <div className="text-8xl">{feature.image}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="relative"
                >
                  <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl mb-4">
                      {step.number}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ArrowRight className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Who Is It For */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Who Is It For</h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {useCases.map((useCase, index) => {
                const Icon = useCase.icon;
                return (
                  <motion.div
                    key={useCase.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all"
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{useCase.name}</h3>
                    <p className="text-gray-600 text-sm">{useCase.benefit}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 px-6 bg-blue-50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-8">Benefits</h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                'Lower customer acquisition cost',
                'Higher trust-based conversions',
                'Fully automated referral operations',
                'Clear ROI and performance metrics'
              ].map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className="bg-white p-6 rounded-xl border border-gray-200"
                >
                  <CheckCircle2 className="w-8 h-8 text-green-500 mb-3" />
                  <p className="text-gray-700 font-medium">{benefit}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Screens Preview */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Screens Preview</h2>
            </motion.div>
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {screens.map((screen) => {
                  const Icon = screen.icon;
                  return (
                    <button
                      key={screen.id}
                      onClick={() => setActiveTab(screen.id)}
                      className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                        activeTab === screen.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{screen.name}</span>
                    </button>
                  );
                })}
              </div>
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl p-12 border border-gray-200 min-h-[400px] flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">
                    {activeTab === 'dashboard' && '📊'}
                    {activeTab === 'analytics' && '📈'}
                    {activeTab === 'rewards' && '🎁'}
                    {activeTab === 'user' && '👤'}
                  </div>
                  <p className="text-gray-600">{screens.find(s => s.id === activeTab)?.name}</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Pricing</h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricingPlans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className={`bg-white rounded-2xl p-8 border-2 ${
                    plan.popular ? 'border-blue-600 shadow-xl scale-105' : 'border-gray-200'
                  }`}
                >
                  {plan.popular && (
                    <div className="bg-blue-600 text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start space-x-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.name === 'Enterprise' ? '/contact' : '/signup'}
                    className={`block w-full text-center px-6 py-3 rounded-lg font-semibold transition-all ${
                      plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Security & Compliance */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Security & Compliance</h2>
                <ul className="space-y-4">
                  {[
                    'Secure authentication',
                    'Role-based access',
                    'Encrypted data storage',
                    'Audit logs'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <Lock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-2 gap-6"
              >
                {['SOC 2', 'GDPR', 'ISO 27001', 'PCI DSS'].map((cert, index) => (
                  <div key={cert} className="bg-gray-100 rounded-xl p-8 text-center">
                    <div className="text-2xl font-bold text-gray-400">{cert}</div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Launch Your Referral Program in Minutes
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold text-lg rounded-lg hover:shadow-2xl transition-all"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold text-lg rounded-lg hover:bg-white/10 transition-all"
                  >
                    <Calendar className="mr-2 w-5 h-5" />
                    Book a Demo
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="/product" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">Docs</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Features</h3>
              <ul className="space-y-2">
                <li><Link href="/#features" className="hover:text-white transition-colors">Overview</Link></li>
                <li><Link href="/services" className="hover:text-white transition-colors">Services</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">API</h3>
              <ul className="space-y-2">
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
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
