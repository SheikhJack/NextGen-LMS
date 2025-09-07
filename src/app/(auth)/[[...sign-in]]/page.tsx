"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import Image from "next/image";
import Loader from "@/components/Loader";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const LoginPage = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [hasAttemptedRedirect, setHasAttemptedRedirect] = useState(false);

  useEffect(() => {
    if (isSignedIn && user && !hasAttemptedRedirect) {
      const role = user.publicMetadata?.role as string;
      console.log("User role from metadata:", role);

      if (role && role.trim() !== "") {
        setHasAttemptedRedirect(true);
        setIsRedirecting(true);

        setTimeout(() => {
          window.location.href = `/${role}`;
        }, 1000);
      }
    }
  }, [isSignedIn, user, hasAttemptedRedirect]);

  if (isRedirecting) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader />
          <p className="mt-4 text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader />
      </div>
    );
  }

  if (isSignedIn && user) {
    const role = user.publicMetadata?.role as string;
    if (role && role.trim() !== "") {
      return (
        <div className="h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <Loader />
            <p className="mt-4 text-gray-600">Preparing your dashboard...</p>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-white">
      <SignIn.Root>
        {/* Show loading overlay if user is signed in but redirect is pending */}
        {isSignedIn && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg text-center">
              <Loader />
              <p className="mt-4 text-gray-600">Sign in successful! Redirecting...</p>
            </div>
          </div>
        )}

        <SignIn.Step
          name="start"
          className="bg-white p-12 rounded-md shadow-2xl flex flex-col gap-2"
        >
          <header className="flex flex-col items-center justify-center text-center gap-5">
            <Image src="/favi.png" alt="Logo" width={93} height={131} />
            <h1 className="text-xl text-grey-500 font-bold flex items-center gap-2">
              Nachi LMS Portal
            </h1>
          </header>
          <h2 className="text-gray-400">Sign in to your account</h2>
          
          <Clerk.GlobalError className="text-sm text-red-400" />
          
          <Clerk.Field name="identifier" className="flex flex-col gap-2">
            <Clerk.Label className="text-xs text-gray-500">
              Username
            </Clerk.Label>
            <Clerk.Input
              type="text"
              required
              className="p-2 rounded-md ring-1 ring-gray-300"
            />
            <Clerk.FieldError className="text-xs text-red-400" />
          </Clerk.Field>
          
          <Clerk.Field name="password" className="flex flex-col gap-2">
            <Clerk.Label className="text-xs text-gray-500">
              Password
            </Clerk.Label>
            <Clerk.Input
              type="password"
              required
              className="p-2 rounded-md ring-1 ring-gray-300"
            />
            <Clerk.FieldError className="text-xs text-red-400" />
          </Clerk.Field>
          
          <SignIn.Action
            submit
            className="bg-gradient-to-b from-emerald-400 to-emerald-500 text-white my-1 rounded-md text-sm p-[10px] hover:from-emerald-500 hover:to-emerald-600 transition-colors"
          >
            Sign In
          </SignIn.Action>
        </SignIn.Step>

        {/* Other valid steps */}
        <SignIn.Step name="verifications">
          <div className="text-center">
            <Loader />
            <p className="mt-4 text-gray-600">Verifying your account...</p>
          </div>
        </SignIn.Step>

        <SignIn.Step name="forgot-password">
          <div className="text-center">
            <p className="text-gray-600">Password reset flow</p>
          </div>
        </SignIn.Step>
      </SignIn.Root>
    </div>
  );
};

export default LoginPage;