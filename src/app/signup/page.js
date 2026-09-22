import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";
export const metadata = { title: "Sign up — Impromptu" };
export default function Signup() { return <Suspense fallback={null}><AuthForm mode="signup" /></Suspense>; }
