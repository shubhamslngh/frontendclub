"use client";

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import Image from "next/image";
import { Bebas_Neue, Space_Grotesk } from "next/font/google";
import { clubService } from '@/services/clubService';
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const displayFont = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const bodyFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
});

function PaymentStatusContent() {
  const [status, setStatus] = useState('loading'); // loading, success, failure
  const [message, setMessage] = useState('Verifying payment status...');
  const [returnHref] = useState(() => {
    if (typeof window === "undefined") return "/player/dashboard";
    const role = window.localStorage.getItem("club_user_role");
    return role && role !== "player" ? "/dashboard" : "/player/dashboard";
  });

  useEffect(() => {
    const checkStatus = async () => {
      const merchantTransactionId = sessionStorage.getItem('current_transaction_id');
      if (!merchantTransactionId) {
        setStatus('failure');
        setMessage('Invalid transaction ID.');
        return;
      }

      try {
        const response = await clubService.checkPaymentStatus(merchantTransactionId);
        const apiStatus = (response.data?.status || '').toString().toLowerCase();

        if (apiStatus === 'success' || response.data?.success === true) {
          setStatus('success');
          setMessage('Your payment was successful!');
          sessionStorage.removeItem('current_transaction_id'); // Clear on success
        } else if (apiStatus === 'pending') {
          setStatus('pending');
          setMessage('Payment is currently pending. Please check back later.');
        } else {
          setStatus('failure');
          setMessage('Payment failed or declined.');
        }
      } catch (error) {
        console.error("Payment verification failed:", error);
        setStatus('failure');
        setMessage('Could not verify payment status. Please contact support.');
      }
    };

    checkStatus();
  }, []);

  return (
    status === 'loading' ? (
      <div className="flex min-h-[320px] flex-col items-center justify-center text-center text-white">
        <div className="rounded-full border border-white/10 bg-white/5 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <Loader2 className="h-14 w-14 animate-spin text-orange-400" />
        </div>
        <p className="mt-6 text-sm uppercase tracking-[0.3em] text-white/55">Verifying payment status...</p>
      </div>
    ) : (
      <Card className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/6 text-center text-white shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <CardHeader className="relative px-6 pb-6 pt-10 sm:px-10">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          <div className="mb-6 flex justify-center">
            <div className="rounded-full border border-white/10 bg-white/5 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
              {status === 'success' && <CheckCircle className="h-16 w-16 text-[#62e09c]" />}
              {status === 'failure' && <XCircle className="h-16 w-16 text-[#ff6b6b]" />}
              {status === 'pending' && <Loader2 className="h-16 w-16 animate-spin text-[#ffb347]" />}
            </div>
          </div>
          <p className="text-xs uppercase tracking-[0.4em] text-orange-400">Payment Center</p>
          <CardTitle className={`mt-4 text-5xl uppercase tracking-[0.08em] ${displayFont.className}`}>
            {status === 'success' && 'Payment Successful'}
            {status === 'failure' && 'Payment Failed'}
            {status === 'pending' && 'Payment Pending'}
          </CardTitle>
          <CardDescription className="mx-auto mt-4 max-w-xl text-base text-white/70">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-8 sm:px-10">
          <div className="rounded-3xl border border-white/10 bg-black/20 p-5 text-left">
            <p className="text-xs uppercase tracking-[0.35em] text-white/45">Next Step</p>
            <p className="mt-3 text-sm leading-7 text-white/70">
              {status === 'success' && 'Your payment is recorded. Return to your dashboard to see the updated membership and transaction details.'}
              {status === 'failure' && 'The payment was not completed. You can return to the dashboard and try again or contact the club if the issue persists.'}
              {status === 'pending' && 'The payment gateway has not finalized this transaction yet. Return to the dashboard and check again shortly.'}
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild className="w-full bg-orange-500 text-black hover:bg-orange-400 sm:w-auto">
              <Link href={returnHref} className="inline-flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Return to Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white sm:w-auto">
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  );
}

export default function PaymentStatusPage() {
  return (
    <div
      className={`${displayFont.variable} ${bodyFont.variable} min-h-screen bg-[#0B0F1A] text-white`}
      style={{
        "--kk-ember": "#ff7a1a",
        "--kk-field": "#62e09c",
        "--kk-line": "rgba(255, 255, 255, 0.15)",
        "--kk-ink": "#f8fafc",
      }}
    >
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,107,0,0.22),transparent_60%)]" />
        <div className="absolute -left-24 top-24 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.12),transparent_65%)] blur-2xl" />
        <div className="absolute left-1/3 top-12 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle_at_center,rgba(46,204,113,0.16),transparent_65%)] blur-2xl" />
        <div className="absolute right-[-120px] top-0 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_top,rgba(0,180,216,0.10),transparent_65%)] blur-2xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.0),rgba(0,0,0,0.72))]" />
      </div>

      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0B0F1A]/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-black ring-2 ring-orange-500/40 shadow-lg">
              <Image
                src="/KK11.png"
                alt="KK Cricket Club"
                width={80}
                height={60}
                className="object-cover"
                priority
              />
            </span>
            <div>
              <p className={`text-2xl uppercase tracking-[0.2em] ${displayFont.className}`}>
                KK11 Cricket Club
              </p>
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-orange-400">
                Payment Status
              </p>
            </div>
          </Link>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-113px)] w-full max-w-6xl items-center justify-center px-6 py-12">
        <Suspense fallback={<div className="text-center text-white"><Loader2 className="mx-auto h-8 w-8 animate-spin text-orange-400" /></div>}>
          <PaymentStatusContent />
        </Suspense>
      </main>
    </div>
  );
}
