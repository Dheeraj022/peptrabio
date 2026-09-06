'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Mail,
  Clock,
  MapPin,
  Send,
  CheckCircle2,
  FileCheck2,
  ShieldAlert,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';

function ContactFormContent() {
  const searchParams = useSearchParams();
  const querySubject = searchParams.get('subject');
  const queryCode = searchParams.get('code');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institution: '',
    subject: querySubject === 'Product Verification' ? 'Product Verification Inquiry' : 'COA / Batch Documentation Request',
    verificationCode: queryCode || '',
    message: queryCode ? `Inquiry regarding verification scan for code: ${queryCode}` : '',
  });

  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (querySubject) {
      setFormData((prev) => ({
        ...prev,
        subject: querySubject === 'Product Verification' ? 'Product Verification Inquiry' : querySubject,
        verificationCode: queryCode || prev.verificationCode,
        message: queryCode ? `Inquiry regarding verification scan for code: ${queryCode}` : prev.message,
      }));
    }
  }, [querySubject, queryCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-light text-brand text-xs font-orbitron font-semibold tracking-wider">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>SCIENTIFIC & CATALOG SUPPORT</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-orbitron font-extrabold text-content-primary">
          CONTACT RESEARCH DESK
        </h1>
        <p className="text-xs sm:text-sm text-content-secondary font-sans leading-relaxed">
          Questions regarding product specifications, authenticity verification, batch Certificates of Analysis (COA), bulk institutional quotes, or order fulfillment? Reach out to our technical support team.
        </p>

        {/* Tracked Ticket Callout Banner */}
        <div className="pt-2">
          <div className="inline-flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-purple-50 border border-brand-border text-left w-full max-w-xl mx-auto shadow-xs">
            <div className="space-y-0.5">
              <div className="font-orbitron font-bold text-xs text-brand">
                Need Tracked Support or Verification Resolution?
              </div>
              <div className="text-[11px] text-content-secondary font-sans">
                Open a dedicated support ticket to track replies, attach photos, and receive priority resolution.
              </div>
            </div>
            <Link
              href="/support/new"
              className="px-4 py-2 bg-brand text-white font-orbitron text-xs font-bold rounded-full shadow-purple-sm hover:bg-brand-dark transition-all shrink-0"
            >
              CREATE TICKET
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Contact Form */}
        <div className="lg:col-span-7 bg-white border border-brand-border rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
          
          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-accent-success/10 text-accent-success flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="font-orbitron font-bold text-xl text-content-primary">
                INQUIRY DISPATCHED
              </h3>
              <p className="text-xs text-content-secondary max-w-sm mx-auto font-sans leading-relaxed">
                Thank you. Your inquiry has been routed to our scientific desk. A technical representative will respond to <strong className="text-content-primary">{formData.email}</strong> within 1 business day.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-2.5 bg-brand text-white font-orbitron text-xs font-semibold rounded-full hover:bg-brand-dark transition-all"
              >
                SUBMIT ANOTHER INQUIRY
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-orbitron text-[10px] text-content-muted mb-1">
                    FULL NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Dr. Jordan Lee"
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-sans"
                  />
                </div>

                <div>
                  <label className="block font-orbitron text-[10px] text-content-muted mb-1">
                    BUSINESS / ACADEMIC EMAIL *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="j.lee@university.edu"
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block font-orbitron text-[10px] text-content-muted mb-1">
                  ORGANIZATION / INSTITUTION
                </label>
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  placeholder="Bio-Analytical Laboratory Corp."
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-sans"
                />
              </div>

              <div>
                <label className="block font-orbitron text-[10px] text-content-muted mb-1">
                  SUBJECT / INQUIRY CATEGORY *
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-sans bg-white"
                >
                  <option value="Product Verification Inquiry">Product Verification & Authenticity Inquiry</option>
                  <option value="COA / Batch Documentation Request">COA / Batch Documentation Request</option>
                  <option value="Order & Shipping Status Inquiry">Order & Shipping Status Inquiry</option>
                  <option value="Custom Chemical Synthesis Inquiry">Custom Chemical Synthesis Inquiry</option>
                  <option value="Catalog & Specification Question">Catalog & Specification Question</option>
                  <option value="General In Vitro Research Inquiry">General In Vitro Research Inquiry</option>
                </select>
              </div>

              {formData.verificationCode && (
                <div className="p-3 bg-brand-subtle rounded-xl border border-brand-border flex items-center justify-between">
                  <div>
                    <span className="font-orbitron text-[10px] text-content-muted block">VERIFICATION CODE ATTACHED:</span>
                    <span className="font-mono font-bold text-brand text-xs">{formData.verificationCode}</span>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-brand" />
                </div>
              )}

              <div>
                <label className="block font-orbitron text-[10px] text-content-muted mb-1">
                  DETAILED MESSAGE *
                </label>
                <textarea
                  rows={5}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Please specify catalog numbers, lot codes, verification inquiries, or custom research requirements..."
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-sans"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 bg-brand hover:bg-brand-dark text-white font-orbitron text-xs font-semibold rounded-full shadow-purple-sm flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
                >
                  <Send className="w-4 h-4" />
                  <span>TRANSMIT INQUIRY</span>
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Right Column: Information & Compliance notice */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="font-orbitron font-bold text-base text-content-primary">
              OPERATIONAL CONTACT DETAILS
            </h3>

            <div className="space-y-4 text-xs font-sans text-content-secondary">
              <div className="flex items-start space-x-3">
                <Mail className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <div>
                  <div className="font-orbitron font-semibold text-content-primary">ELECTRONIC MAIL</div>
                  <a href="mailto:support@peptrabio.com" className="hover:text-brand transition-colors">
                    support@peptrabio.com
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <div>
                  <div className="font-orbitron font-semibold text-content-primary">OPERATIONAL HOURS</div>
                  <div>Monday – Friday: 9:00 AM – 5:00 PM EST</div>
                  <div className="text-[11px] text-content-muted">Technical desk active on business days</div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <div>
                  <div className="font-orbitron font-semibold text-content-primary">LABORATORY LOGISTICS HUB</div>
                  <div>Peptra Bio Inc., Bio-Research Park</div>
                  <div>Cambridge, MA 02139, United States</div>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Note */}
          <div className="p-6 rounded-3xl bg-purple-50 border border-purple-200 text-xs text-purple-950 font-sans space-y-2">
            <div className="font-orbitron font-bold text-brand flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4" />
              <span>COMPLIANCE POLICY</span>
            </div>
            <p className="leading-relaxed">
              Peptra Bio strictly provides technical and chemical information related to in vitro laboratory research. Our staff will decline to answer questions or provide advice regarding human clinical usage, in vivo dosing protocols, self-administration, or therapeutic treatment.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-orbitron">Loading Contact Desk...</div>}>
      <ContactFormContent />
    </Suspense>
  );
}
