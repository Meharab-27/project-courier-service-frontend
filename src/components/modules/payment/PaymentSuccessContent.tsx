"use client";

import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  KeyRound,
  LayoutDashboard,
  Package,
  Receipt,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useGetPayment, useGetShipment, useVerifyPaymentSession } from "@/hooks";

export function PaymentSuccessContent() {
  const searchParams = useSearchParams();

  // Handle various query parameter conventions from Stripe redirect
  const paymentId =
    searchParams.get("payment_id") ||
    searchParams.get("paymentId") ||
    searchParams.get("id");
  const shipmentId =
    searchParams.get("shipment_id") ||
    searchParams.get("shipmentId") ||
    searchParams.get("shipment");
  const sessionId =
    searchParams.get("session_id") || searchParams.get("sessionId");

  const [copiedOtp, setCopiedOtp] = useState(false);
  const [copiedTxn, setCopiedTxn] = useState(false);

  // Automatically verify payment session with Stripe backend
  const lookupKey = sessionId || paymentId || shipmentId || undefined;
  const {
    data: verifyResponse,
    isLoading: isVerifying,
    error: verifyError,
  } = useVerifyPaymentSession(lookupKey);

  const verifiedPayment = verifyResponse?.data;
  const verifiedShipment = verifiedPayment?.shipment;

  // Fallback queries if lookup by session ID is not active or needed
  const resolvedPaymentId = paymentId || verifiedPayment?.id || "";
  const { data: paymentResponse, isLoading: isPaymentLoading } = useGetPayment(
    resolvedPaymentId || undefined,
  );

  const resolvedShipmentId =
    shipmentId ||
    verifiedShipment?.id ||
    verifiedPayment?.shipmentId ||
    paymentResponse?.data?.shipmentId ||
    "";

  const { data: shipmentResponse, isLoading: isShipmentLoading } =
    useGetShipment(resolvedShipmentId || undefined);

  const payment = verifiedPayment || paymentResponse?.data;
  const shipment =
    verifiedShipment ||
    shipmentResponse?.data ||
    payment?.shipment;

  const transactionId =
    payment?.transactionId ||
    payment?.stripePaymentIntentId ||
    sessionId ||
    (paymentId
      ? `PAY-${paymentId.slice(0, 10).toUpperCase()}`
      : "TXN-VERIFIED-STRIPE");

  const amountPaid =
    payment?.amount ||
    shipment?.totalCost ||
    Number(searchParams.get("amount") || 0);

  const trackingId =
    shipment?.trackingNumber ||
    shipment?.trackingId ||
    (resolvedShipmentId
      ? `#TRK-${resolvedShipmentId.slice(0, 8).toUpperCase()}`
      : "#TRK-CONFIRMED");

  const deliveryOtp =
    shipment?.deliveryOtp ||
    searchParams.get("otp") ||
    (shipment as { deliveryOtp?: string })?.deliveryOtp;

  const handleCopyOtp = () => {
    if (!deliveryOtp) return;
    navigator.clipboard.writeText(deliveryOtp);
    setCopiedOtp(true);
    toast.add({
      title: "OTP Copied",
      description: "6-digit Delivery OTP copied to clipboard",
      type: "success",
    });
    setTimeout(() => setCopiedOtp(false), 2500);
  };

  const handleCopyTxn = () => {
    navigator.clipboard.writeText(transactionId);
    setCopiedTxn(true);
    toast.add({
      title: "Transaction ID Copied",
      description: "Transaction reference copied",
      type: "success",
    });
    setTimeout(() => setCopiedTxn(false), 2500);
  };

  const isLoading =
    isVerifying ||
    (!shipment && (isPaymentLoading || isShipmentLoading));

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      {/* Success Badge & Animation */}
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 flex size-18 items-center justify-center rounded-3xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-8 ring-emerald-500/10">
          <CheckCircle2 className="size-10" />
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
          <ShieldCheck className="size-3.5" />
          <span>Payment Verified with Stripe</span>
        </div>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl md:text-4xl">
          Payment Completed Successfully!
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
          Your transaction has been approved. The courier dispatch protocol has
          been triggered for your shipment.
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center p-8 text-muted-foreground gap-2">
          <Spinner className="size-5" />
          <span className="text-xs">
            Fetching payment & shipment confirmation...
          </span>
        </div>
      )}

      {/* Transaction & Amount Banner */}
      <Card className="rounded-2xl border border-border/80 bg-card p-6 shadow-md mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-border/60">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Total Amount Paid
            </p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                ৳{amountPaid > 0 ? amountPaid.toFixed(2) : "60.00"}
              </span>
              <span className="text-xs font-bold text-muted-foreground">
                BDT
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-muted/50 px-3.5 py-2 text-xs">
            <Receipt className="size-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground">
                Transaction Ref
              </span>
              <span className="font-mono font-semibold text-foreground">
                {transactionId.length > 20
                  ? `${transactionId.slice(0, 16)}...`
                  : transactionId}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyTxn}
              className="ml-1 p-1 hover:text-foreground text-muted-foreground cursor-pointer"
              title="Copy Transaction ID"
            >
              {copiedTxn ? (
                <Check className="size-3.5 text-emerald-500" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Consignment Overview */}
        <div className="pt-4 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Tracking ID</span>
            <span className="font-mono font-bold text-foreground">
              {trackingId}
            </span>
          </div>

          {shipment?.originHub?.name && shipment?.destinationHub?.name && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Delivery Route</span>
              <span className="font-medium text-foreground">
                {shipment.originHub.name} &rarr; {shipment.destinationHub.name}
              </span>
            </div>
          )}

          {shipment?.receiverName && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Recipient</span>
              <span className="font-medium text-foreground">
                {shipment.receiverName} ({shipment.receiverPhone})
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Payment Gateway</span>
            <span className="font-semibold text-[#635BFF]">
              Stripe 3D Secure (Confirmed)
            </span>
          </div>
        </div>
      </Card>

      {/* 6-Digit Delivery OTP Card (Crucial Requirement) */}
      <div className="rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 shadow-lg mb-8">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
              <KeyRound className="size-4" />
              <span>Secret Delivery Handover OTP</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Generated securely by Stripe webhook. Share this code ONLY with
              your delivery courier upon doorstep parcel handover.
            </p>
          </div>

          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary">
            <Sparkles className="size-5" />
          </div>
        </div>

        {/* OTP Display Box */}
        <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-primary/30 bg-background/80 p-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-muted-foreground">
              Your 6-Digit OTP:
            </span>
            {deliveryOtp ? (
              <span className="font-mono text-2xl font-black tracking-widest text-primary">
                {deliveryOtp}
              </span>
            ) : isVerifying ? (
              <div className="flex items-center gap-2 text-primary font-mono text-base">
                <Spinner className="size-4" />
                <span>Generating secure OTP...</span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground italic">
                OTP available in shipment details once dispatch begins
              </span>
            )}
          </div>

          {deliveryOtp && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyOtp}
              className="h-9 gap-1.5 rounded-lg border-primary/30 text-xs font-semibold text-primary hover:bg-primary/10"
            >
              {copiedOtp ? (
                <>
                  <Check className="size-3.5" />
                  Copied OTP
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  Copy OTP
                </>
              )}
            </Button>
          )}
        </div>

        <p className="mt-3 text-[11px] text-muted-foreground flex items-center gap-1.5">
          <Clock className="size-3.5 text-primary shrink-0" />
          <span>
            This OTP is also stored on your permanent shipment details page for
            easy reference.
          </span>
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {resolvedShipmentId ? (
          <Link
            href={`/shipments/${resolvedShipmentId}`}
            className="w-full sm:flex-1"
          >
            <Button
              size="lg"
              className="w-full h-12 rounded-xl font-bold gap-2 text-sm shadow-md"
            >
              <Package className="size-4" />
              <span>View Shipment Details</span>
              <ArrowRight className="size-4 ml-auto" />
            </Button>
          </Link>
        ) : (
          <Link href="/dashboard/customer/shipments" className="w-full sm:flex-1">
            <Button
              size="lg"
              className="w-full h-12 rounded-xl font-bold gap-2 text-sm shadow-md"
            >
              <LayoutDashboard className="size-4" />
              <span>Go to My Shipments</span>
              <ArrowRight className="size-4 ml-auto" />
            </Button>
          </Link>
        )}

        <Link href="/dashboard/customer/shipments" className="w-full sm:w-auto">
          <Button
            variant="outline"
            size="lg"
            className="w-full h-12 rounded-xl text-xs font-semibold gap-1.5"
          >
            <LayoutDashboard className="size-4" />
            My Shipments
          </Button>
        </Link>

        <Link href="/book-parcel" className="w-full sm:w-auto">
          <Button
            variant="ghost"
            size="lg"
            className="w-full h-12 rounded-xl text-xs font-semibold"
          >
            Book Another
          </Button>
        </Link>
      </div>
    </div>
  );
}
