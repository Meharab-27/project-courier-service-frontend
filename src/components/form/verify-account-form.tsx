
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useVerifyCustomerEmail } from "@/hooks";
import { toast } from "../ui/toast";

const RESEND_COOLDOWN = 120; // ২ মিনিট (১২০ সেকেন্ড)

export default function VerifyAccountForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [otp, setOtp] = useState("");
  const [isInvalid, setIsInvalid] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);

  const { mutate: verify, isPending: verifyPending } = useVerifyCustomerEmail();

  const email = searchParams.get("email");

  
  useEffect(() => {
    if (!email) {
      router.push("/");
    }
  }, [email, router]);

 
  useEffect(() => {
    if (resendTimer <= 0) return;

    const timer = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [resendTimer]);

 
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

 
  const handleOTP = () => {
    if (!email || otp.length !== 6) {
      setIsInvalid(true);
      return;
    }

    verify(
      { email, otp },
      {
        onSuccess: () => {
          toast.add({
            title: "Verification Successful",
            description: "Welcome Onboard",
            type: "success",
          });
          router.push("/");
        },
        onError: (err: Error) => {
          toast.add({
            title: "Verification Failed",
            description: err?.message || "Something Went Wrong",
            type: "error",
          });
        },
      }
    );
  };

  
  const handleResend = () => {
    if (!email || resendTimer > 0) return;

    
    setOtp("");
    setIsInvalid(false);
    setResendTimer(RESEND_COOLDOWN); 

    toast.add({
      title: "OTP Sent",
      description: "A new OTP has been sent to your email.",
      type: "success",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify Account</CardTitle>
        <CardDescription>
          Provide the OTP we sent you in your email
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          id="otp-form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleOTP();
          }}
        >
          <Field data-invalid={isInvalid || undefined}>
            <FieldLabel htmlFor="otp">OTP</FieldLabel>
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => {
                setOtp(value);
                if (isInvalid) {
                  setIsInvalid(false);
                }
              }}
              autoComplete="one-time-code"
              name="otp"
              id="otp"
              pattern={REGEXP_ONLY_DIGITS}
              disabled={verifyPending}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>

            {isInvalid && (
              <FieldError errors={[{ message: "Invalid Code. Try Again" }]} />
            )}

            <FieldDescription>
              {resendTimer > 0
                ? `Resend available in ${formatTime(resendTimer)}`
                : "Didn't receive the code? You can resend now."}
            </FieldDescription>
          </Field>
        </form>
      </CardContent>

      <CardFooter className="gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleResend}
          disabled={resendTimer > 0 || verifyPending}
        >
          Resend
        </Button>

        <Button
          type="submit"
          form="otp-form"
          disabled={verifyPending || otp.length !== 6}
        >
          {verifyPending ? "Submitting..." : "Submit"}
        </Button>
      </CardFooter>
    </Card>
  );
}

