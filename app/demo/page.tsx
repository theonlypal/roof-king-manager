'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AutomationStatus {
  automation: boolean;
  airtable: boolean;
  calendar: boolean;
  email: boolean;
}

export default function DemoPage() {
  const [status, setStatus] = useState<AutomationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/automation')
      .then(res => res.json())
      .then(data => {
        setStatus(data.services);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch status:', err);
        setLoading(false);
      });
  }, []);

  const steps = [
    {
      number: 1,
      title: 'Customer Submits Form',
      description: 'Customer fills out a simple job request form with their details and service needs.',
      icon: '📝',
      color: 'bg-crown-sunset',
    },
    {
      number: 2,
      title: 'Data Saved to Airtable',
      description: 'Customer info and job details are automatically saved to your Airtable database. No manual data entry required.',
      icon: '💾',
      color: 'bg-accent-copper',
      enabled: status?.airtable,
    },
    {
      number: 3,
      title: 'Calendar Event Created',
      description: 'Job is automatically added to your Google Calendar with customer details and location. Team gets notified instantly.',
      icon: '📅',
      color: 'bg-accent-sage',
      enabled: status?.calendar,
    },
    {
      number: 4,
      title: 'Confirmation Email Sent',
      description: 'Professional confirmation email is sent to customer with job details and next steps. Builds trust immediately.',
      icon: '✉️',
      color: 'bg-crown-terracotta',
      enabled: status?.email,
    },
    {
      number: 5,
      title: 'Dashboard Updated',
      description: 'You see the new job on your dashboard with all details. Track progress, add charges, generate invoices.',
      icon: '📊',
      color: 'bg-accent-success',
    },
  ];

  const roiMetrics = [
    { label: 'Hours Saved Per Week', value: '15-20', description: 'No more manual data entry or scheduling' },
    { label: 'Revenue Increase', value: '25%', description: 'Faster response time = more jobs closed' },
    { label: 'ROI', value: '29:1 to 134:1', description: 'Industry average return on automation' },
    { label: 'Payback Period', value: '1-2 weeks', description: 'Immediate impact on your bottom line' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-royal-cream to-royal-beige">
      {/* Hero Section */}
      <div className="bg-crown-terracotta text-royal-cream py-16 shadow-warm-lg">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">The Future of Service Business Management</h1>
          <p className="text-xl mb-6 opacity-90">
            Watch your business run itself while you focus on what matters: delivering great service
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/jobs/new"
              className="px-8 py-4 bg-white text-crown-terracotta rounded-lg font-bold text-lg shadow-warm-lg transition-all duration-200 hover:shadow-warm-xl hover:-translate-y-1"
            >
              Try It Now
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-crown-sunset text-white rounded-lg font-bold text-lg shadow-warm-lg transition-all duration-200 hover:shadow-warm-xl hover:-translate-y-1"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* System Status */}
      {!loading && status && (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-royal-beige rounded-2xl p-6 shadow-warm">
            <h3 className="text-2xl font-bold text-royal-espresso mb-4">System Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className={`p-4 rounded-lg ${status.airtable ? 'bg-accent-sage' : 'bg-royal-stone'}`}>
                <div className="text-sm font-semibold text-royal-espresso">Airtable Database</div>
                <div className="text-2xl font-bold text-white">{status.airtable ? '✓ Connected' : '○ Not Setup'}</div>
              </div>
              <div className={`p-4 rounded-lg ${status.calendar ? 'bg-accent-sage' : 'bg-royal-stone'}`}>
                <div className="text-sm font-semibold text-royal-espresso">Google Calendar</div>
                <div className="text-2xl font-bold text-white">{status.calendar ? '✓ Connected' : '○ Not Setup'}</div>
              </div>
              <div className={`p-4 rounded-lg ${status.email ? 'bg-accent-sage' : 'bg-royal-stone'}`}>
                <div className="text-sm font-semibold text-royal-espresso">Email Service</div>
                <div className="text-2xl font-bold text-white">{status.email ? '✓ Connected' : '○ Not Setup'}</div>
              </div>
              <div className={`p-4 rounded-lg ${status.automation ? 'bg-accent-sage' : 'bg-accent-alert'}`}>
                <div className="text-sm font-semibold text-royal-espresso">Automation</div>
                <div className="text-2xl font-bold text-white">{status.automation ? '✓ Enabled' : '○ Disabled'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center text-royal-espresso mb-4">How It Works</h2>
        <p className="text-xl text-center text-royal-taupe mb-12">
          From customer inquiry to completed job - all automated in seconds
        </p>

        <div className="space-y-8">
          {steps.map((step, index) => (
            <div key={step.number} className="flex gap-6 items-start">
              {/* Step Number Circle */}
              <div className={`${step.color} text-white rounded-full w-16 h-16 flex items-center justify-center text-3xl font-bold shadow-warm flex-shrink-0`}>
                {step.icon}
              </div>

              {/* Step Content */}
              <div className="flex-1 bg-royal-beige rounded-2xl p-6 shadow-warm">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold text-royal-espresso">{step.title}</h3>
                  {step.enabled !== undefined && (
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${step.enabled ? 'bg-accent-sage text-white' : 'bg-royal-stone text-royal-espresso'}`}>
                      {step.enabled ? 'Connected' : 'Setup Required'}
                    </span>
                  )}
                </div>
                <p className="text-lg text-royal-taupe">{step.description}</p>
              </div>

              {/* Arrow (except for last step) */}
              {index < steps.length - 1 && (
                <div className="text-4xl text-royal-taupe">↓</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ROI Section */}
      <div className="bg-crown-terracotta text-royal-cream py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">The Numbers Don't Lie</h2>
          <p className="text-xl text-center opacity-90 mb-12">
            Service businesses using automation see massive ROI
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roiMetrics.map((metric) => (
              <div key={metric.label} className="bg-white/10 backdrop-blur rounded-2xl p-6 shadow-warm-lg">
                <div className="text-5xl font-bold mb-2">{metric.value}</div>
                <div className="text-xl font-semibold mb-2">{metric.label}</div>
                <div className="text-sm opacity-80">{metric.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* What This Means For You */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center text-royal-espresso mb-12">What This Means For You</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-royal-beige rounded-2xl p-8 shadow-warm">
            <div className="text-5xl mb-4">⏰</div>
            <h3 className="text-2xl font-bold text-royal-espresso mb-3">Get Your Time Back</h3>
            <p className="text-royal-taupe">
              Stop spending 15-20 hours per week on admin work. Let AI handle data entry, scheduling, and follow-ups while you focus on growing your business.
            </p>
          </div>

          <div className="bg-royal-beige rounded-2xl p-8 shadow-warm">
            <div className="text-5xl mb-4">💰</div>
            <h3 className="text-2xl font-bold text-royal-espresso mb-3">Increase Revenue</h3>
            <p className="text-royal-taupe">
              Respond to leads instantly (even at 2 AM). Faster response time = higher close rate. Businesses see 25% revenue increase in year 1.
            </p>
          </div>

          <div className="bg-royal-beige rounded-2xl p-8 shadow-warm">
            <div className="text-5xl mb-4">🚀</div>
            <h3 className="text-2xl font-bold text-royal-espresso mb-3">Scale Without Hiring</h3>
            <p className="text-royal-taupe">
              Handle 2x-3x more customers without adding staff. Our AI agents work 24/7, never take breaks, and cost a fraction of a single employee.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-crown-terracotta to-crown-sunset text-royal-cream py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Business?</h2>
          <p className="text-xl mb-8 opacity-90">
            Start your 14-day free trial. No credit card required. Cancel anytime.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/jobs/new"
              className="px-10 py-5 bg-white text-crown-terracotta rounded-lg font-bold text-xl shadow-warm-xl transition-all duration-200 hover:shadow-warm-xl hover:-translate-y-1"
            >
              Create Your First Job
            </Link>
          </div>
          <p className="mt-6 text-sm opacity-75">
            Questions? Contact us at {process.env.NEXT_PUBLIC_APP_COMPANY_EMAIL || 'office@sandiegoroofking.com'}
          </p>
        </div>
      </div>
    </div>
  );
}
