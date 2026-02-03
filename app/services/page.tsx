'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Settings, HeadphonesIcon, Rocket, Code2, BarChart3,
  Shield, Users, Zap, CheckCircle2, ArrowRight, Sparkles,
  Globe, Lock, TrendingUp, Database
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

export default function ServicesPage() {
  const services = [
    {
      icon: Code2,
      title: 'API Integration Support',
      description: 'Get help integrating our API into your application. Our team will guide you through the process and ensure a smooth implementation.',
      features: ['Custom integration assistance', 'Code review', 'Best practices guidance', 'Performance optimization'],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Settings,
      title: "Custom Configuration",
      description: "Need a custom setup? We'll configure your referral program to match your exact business requirements and workflows.",
      features: ['Custom reward models', 'Workflow automation', 'Integration setup', 'Custom reporting'],
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: HeadphonesIcon,
      title: 'Priority Support',
      description: 'Get dedicated support with faster response times, priority ticket handling, and direct access to our engineering team.',
      features: ['24/7 support', 'Dedicated account manager', 'Priority ticket handling', 'Direct engineering access'],
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Rocket,
      title: 'Onboarding & Training',
      description: 'Comprehensive onboarding program to get your team up and running quickly with hands-on training and documentation.',
      features: ['Team training sessions', 'Custom documentation', 'Best practices workshop', 'Ongoing support'],
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: BarChart3,
      title: 'Analytics Consulting',
      description: 'Work with our data experts to set up advanced analytics, custom dashboards, and reporting that drives business decisions.',
      features: ['Custom dashboard design', 'Advanced analytics setup', 'Data insights', 'Performance optimization'],
      color: 'from-indigo-500 to-blue-500'
    },
    {
      icon: Shield,
      title: 'Security & Compliance',
      description: 'Ensure your referral program meets security and compliance requirements with our expert guidance and audits.',
      features: ['Security audit', 'Compliance review', 'Data protection setup', 'Access control configuration'],
      color: 'from-teal-500 to-cyan-500'
    }
  ];

  const process = [
    {
      step: '01',
      title: 'Discovery',
      description: 'We understand your business needs and requirements'
    },
    {
      step: '02',
      title: 'Planning',
      description: 'We create a customized plan tailored to your goals'
    },
    {
      step: '03',
      title: 'Implementation',
      description: 'Our team implements the solution with your team'
    },
    {
      step: '04',
      title: 'Optimization',
      description: 'We continuously optimize and improve your setup'
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
              <img src="/logos/logo.png" alt="Incenta Logo" className="h-10 w-auto" />
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
              Expert Services to
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Accelerate Your Success
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get the most out of Incenta with our professional services. From setup to optimization, we're here to help.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
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
              Our Services
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive support for every stage of your journey
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.title}
                  variants={fadeInUp}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Process Section */}
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
              Our Process
            </h2>
            <p className="text-xl text-gray-600">
              A proven methodology to ensure your success
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="relative"
              >
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-100 h-full">
                  <div className="text-6xl font-bold text-blue-600/20 mb-4">{item.step}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
                {index < process.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
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
              Why Choose Our Services?
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'Expert Team',
                description: 'Work with experienced engineers and consultants who understand referral programs inside and out.'
              },
              {
                icon: Zap,
                title: 'Fast Implementation',
                description: 'Get up and running quickly with our streamlined processes and proven methodologies.'
              },
              {
                icon: TrendingUp,
                title: 'Proven Results',
                description: 'Our clients see measurable improvements in referral program performance and ROI.'
              }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </motion.div>
              );
            })}
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
            Contact us to learn more about our services and how we can help accelerate your referral program.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/contact"
                className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-blue-600 font-semibold text-lg rounded-xl hover:shadow-2xl transition-all duration-300"
              >
                <span>Contact Us</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/signup"
                className="inline-flex items-center space-x-2 px-8 py-4 bg-transparent border-2 border-white text-white font-semibold text-lg rounded-xl hover:bg-white/10 transition-all duration-300"
              >
                <span>Start Free Trial</span>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}




