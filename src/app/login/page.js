import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";
export const metadata = { title: "Log in — Impromptu" };
export default function Login() { return <Suspense fallback={null}><AuthForm mode="login" /></Suspense>; }
