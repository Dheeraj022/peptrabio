'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createTicket } from '@/lib/support-store';
import { useAuth } from '@/context/AuthContext';
import { TicketCategory, TicketAttachment } from '@/types/support';
import {
  LifeBuoy,
  ArrowLeft,
  Send,
  Paperclip,
  X,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  File,
  Image as ImageIcon
} from 'lucide-react';

const CATEGORIES: TicketCategory[] = [
  'Order Issue',
  'Product Issue',
  'Product Verification',
  'Payment Issue',
  'Shipping',
  'Refund',
  'Technical Issue',
  'General Support',
  'Other'
];

function CreateTicketForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading, login } = useAuth();

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<TicketCategory>('General Support');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high'>('normal');
  const [message, setMessage] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [productName, setProductName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [createdTicketNumber, setCreatedTicketNumber] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name);
      if (!customerEmail) setCustomerEmail(user.email);
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="font-orbitron text-xs text-content-muted animate-pulse">
          VERIFYING CREDENTIALS...
        </div>
      </div>
    );
  }

  // If unauthenticated, prompt to login
  if (!user) {
    const currentParams = searchParams.toString();
    const returnUrl = `/support/new${currentParams ? `?${currentParams}` : ''}`;

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-brand-border shadow-xl text-center space-y-6 relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-brand-light text-brand flex items-center justify-center mx-auto shadow-purple-sm">
            <LifeBuoy className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-light text-brand text-[10px] font-orbitron font-bold uppercase tracking-wider">
              <span>RESEARCHER SIGN IN REQUIRED</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-orbitron font-extrabold text-content-primary">
              SUBMIT SUPPORT TICKET
            </h1>
            <p className="text-xs sm:text-sm text-content-secondary font-sans leading-relaxed">
              Please sign in to submit a ticket so our specialized support technicians can link your inquiry to your verified research profile.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href={`/login?redirect=${encodeURIComponent(returnUrl)}`}
              className="w-full sm:w-auto px-8 py-3.5 bg-brand hover:bg-brand-dark text-white rounded-xl font-orbitron text-xs font-bold tracking-wider shadow-purple-sm transition-all"
            >
              SIGN IN TO CONTINUE
            </Link>
            <Link
              href={`/register?redirect=${encodeURIComponent(returnUrl)}`}
              className="w-full sm:w-auto px-8 py-3.5 border border-brand-border bg-surface-soft hover:bg-brand-light text-content-primary hover:text-brand rounded-xl font-orbitron text-xs font-semibold tracking-wider transition-all"
            >
              CREATE RESEARCHER ACCOUNT
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Pre-fill from query params (e.g. from Product Verification or Order support button)
  useEffect(() => {
    const codeParam = searchParams.get('code');
    const categoryParam = searchParams.get('category') as TicketCategory;
    const subjectParam = searchParams.get('subject');
    const orderParam = searchParams.get('order');
    const productParam = searchParams.get('product');

    if (codeParam) {
      setVerificationCode(codeParam);
      setCategory('Product Verification');
      if (!subjectParam) {
        setSubject(`Product Verification Support — Code: ${codeParam}`);
      }
    }
    if (categoryParam && CATEGORIES.includes(categoryParam)) {
      setCategory(categoryParam);
    }
    if (subjectParam) {
      setSubject(subjectParam);
    }
    if (orderParam) {
      setOrderNumber(orderParam);
      if (!subjectParam) {
        setSubject(`Inquiry for Order ${orderParam}`);
      }
    }
    if (productParam) {
      setProductName(productParam);
    }
  }, [searchParams]);

  // Handle local simulated attachment upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: TicketAttachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // File validation: Images or PDF up to 10MB
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is larger than the 10MB limit.`);
        continue;
      }

      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        alert(`File ${file.name} is not a supported file type (JPG, PNG, WEBP, PDF only).`);
        continue;
      }

      const blobUrl = URL.createObjectURL(file);
      newAttachments.push({
        id: `att-${Date.now()}-${i}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: blobUrl,
      });
    }

    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail || !subject || !message) {
      alert('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const ticket = await createTicket({
        customer_name: customerName,
        customer_email: customerEmail,
        subject,
        category,
        priority,
        message,
        order_number: orderNumber || undefined,
        product_name: productName || undefined,
        verification_code: verificationCode || undefined,
        attachments,
      });

      setCreatedTicketNumber(ticket.ticket_number);
    } catch (err) {
      console.error('Error creating ticket:', err);
      alert('Failed to submit ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Success view
  if (createdTicketNumber) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6 animate-in fade-in duration-300">
        <div className="w-20 h-20 rounded-full bg-brand-light text-brand flex items-center justify-center mx-auto shadow-purple-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 bg-purple-100 text-brand font-mono text-xs font-bold rounded-full">
            {createdTicketNumber}
          </span>
          <h1 className="font-orbitron font-extrabold text-2xl sm:text-3xl text-content-primary">
            YOUR SUPPORT TICKET HAS BEEN CREATED
          </h1>
          <p className="text-xs sm:text-sm text-content-secondary max-w-md mx-auto font-sans leading-relaxed">
            Our scientific and customer support team has received your inquiry. You will receive email notifications when a specialist replies.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface-soft border border-brand-border text-left space-y-2 text-xs font-sans max-w-md mx-auto">
          <div className="flex justify-between">
            <span className="text-content-muted">Ticket ID:</span>
            <span className="font-mono font-bold text-brand">{createdTicketNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-content-muted">Subject:</span>
            <span className="font-medium text-content-primary truncate max-w-[200px]">{subject}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-content-muted">Category:</span>
            <span className="font-medium text-content-primary">{category}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href={`/support/ticket/${createdTicketNumber}`}
            className="px-8 py-3.5 bg-brand hover:bg-brand-dark text-white font-orbitron text-xs font-bold rounded-full shadow-purple-glow transition-all"
          >
            VIEW TICKET CONVERSATION
          </Link>
          <Link
            href="/support"
            className="px-6 py-3.5 border border-brand text-brand hover:bg-brand-light font-orbitron text-xs font-bold rounded-full transition-all"
          >
            BACK TO ALL TICKETS
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Back Link */}
      <div>
        <Link
          href="/support"
          className="inline-flex items-center text-xs font-orbitron font-semibold text-brand hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          BACK TO SUPPORT TICKETS
        </Link>
      </div>

      {/* Form Container */}
      <div className="bg-white border-2 border-brand-border rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
        
        {/* Header */}
        <div className="space-y-2 border-b border-brand-border pb-6">
          <div className="inline-flex items-center space-x-2 text-brand font-orbitron text-xs font-bold">
            <LifeBuoy className="w-4 h-4" />
            <span>CUSTOMER SUPPORT REQUISITION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-orbitron font-extrabold text-content-primary">
            CREATE SUPPORT TICKET
          </h1>
          <p className="text-xs text-content-secondary font-sans leading-relaxed">
            Please provide complete details regarding your inquiry, batch verification, or technical research question.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Customer Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-orbitron text-xs font-bold text-content-primary mb-1.5">
                YOUR FULL NAME *
              </label>
              <input
                type="text"
                required
                placeholder="Dr. Jane Doe"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-brand-border bg-surface-soft text-xs font-sans focus:outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="block font-orbitron text-xs font-bold text-content-primary mb-1.5">
                RESEARCH / ACADEMIC EMAIL *
              </label>
              <input
                type="email"
                required
                placeholder="researcher@institution.edu"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-brand-border bg-surface-soft text-xs font-sans focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-orbitron text-xs font-bold text-content-primary mb-1.5">
                INQUIRY CATEGORY *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TicketCategory)}
                className="w-full px-4 py-3 rounded-xl border border-brand-border bg-surface-soft text-xs font-sans focus:outline-none focus:border-brand cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-orbitron text-xs font-bold text-content-primary mb-1.5">
                PRIORITY *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl border border-brand-border bg-surface-soft text-xs font-sans focus:outline-none focus:border-brand cursor-pointer"
              >
                <option value="low">Low — General Inquiry</option>
                <option value="normal">Normal — Standard Question</option>
                <option value="high">High — Time-Sensitive / Order Issue</option>
              </select>
              <p className="text-[10px] text-content-muted font-sans mt-1">
                Note: "Urgent" priority is assigned directly by triage support staff.
              </p>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block font-orbitron text-xs font-bold text-content-primary mb-1.5">
              SUBJECT *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Product Verification Scan Inquiry for Selank"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-brand-border bg-surface-soft text-xs font-sans focus:outline-none focus:border-brand"
            />
          </div>

          {/* Optional Metadata Row (Verification Code, Order #, Product Name) */}
          <div className="p-4 rounded-2xl bg-brand-subtle border border-brand-border/60 space-y-3">
            <div className="font-orbitron text-[11px] font-bold text-brand uppercase tracking-wider">
              OPTIONAL CONTEXT REFERENCES
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-orbitron text-[10px] text-content-muted mb-1">
                  VERIFICATION CODE
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 7K9X2M"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  className="w-full px-3 py-2 rounded-lg border border-brand-border bg-white text-xs font-mono uppercase focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block font-orbitron text-[10px] text-content-muted mb-1">
                  ORDER NUMBER
                </label>
                <input
                  type="text"
                  placeholder="PB-ORD-XXXX"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-brand-border bg-white text-xs font-mono uppercase focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block font-orbitron text-[10px] text-content-muted mb-1">
                  PRODUCT NAME
                </label>
                <input
                  type="text"
                  placeholder="e.g., BPC-157 (5mg)"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-brand-border bg-white text-xs font-sans focus:outline-none focus:border-brand"
                />
              </div>
            </div>
          </div>

          {/* Message Textarea */}
          <div>
            <label className="block font-orbitron text-xs font-bold text-content-primary mb-1.5">
              MESSAGE / DETAILED EXPLANATION *
            </label>
            <textarea
              required
              rows={6}
              placeholder="Describe the issue, physical packaging observations, or technical details..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-brand-border bg-surface-soft text-xs font-sans focus:outline-none focus:border-brand leading-relaxed"
            />
          </div>

          {/* File Attachments */}
          <div className="space-y-3">
            <label className="block font-orbitron text-xs font-bold text-content-primary">
              ATTACHMENTS (IMAGES OR PDF, UP TO 10MB EACH)
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <label className="cursor-pointer inline-flex items-center px-4 py-2.5 rounded-full border border-brand-border hover:border-brand bg-surface-soft hover:bg-brand-light text-brand font-orbitron text-xs font-semibold transition-all">
                <Paperclip className="w-3.5 h-3.5 mr-1.5" />
                <span>+ ATTACH FILE</span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/jpg,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <span className="text-[11px] text-content-muted font-sans">
                Supports packaging photos, chromatogram PDFs, or invoices.
              </span>
            </div>

            {/* Attachments List */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="inline-flex items-center space-x-2 px-3 py-1.5 bg-brand-light border border-brand-border rounded-xl text-xs font-sans text-brand-dark"
                  >
                    {att.type.includes('pdf') ? (
                      <File className="w-3.5 h-3.5 text-red-500" />
                    ) : (
                      <ImageIcon className="w-3.5 h-3.5 text-brand" />
                    )}
                    <span className="truncate max-w-[160px] font-medium">{att.name}</span>
                    <span className="text-[10px] text-content-muted">
                      ({(att.size / 1024).toFixed(0)} KB)
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(att.id)}
                      className="text-content-muted hover:text-accent-danger transition-colors p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-brand-border flex items-center justify-between">
            <span className="text-[11px] text-content-muted font-sans">
              * Required fields. All submissions are encrypted and logged.
            </span>

            <button
              type="submit"
              disabled={submitting}
              className={`px-8 py-4 bg-brand hover:bg-brand-dark text-white font-orbitron text-xs font-bold rounded-full shadow-purple-glow flex items-center space-x-2 transition-all ${
                submitting ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02]'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'SUBMITTING TICKET...' : 'SUBMIT SUPPORT TICKET'}</span>
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}

export default function CreateSupportTicketPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-20 font-orbitron text-xs text-content-muted">
          LOADING TICKET GENERATOR...
        </div>
      }
    >
      <CreateTicketForm />
    </Suspense>
  );
}
