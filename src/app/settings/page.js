import { Suspense } from "react";
import SettingsPanel from "@/components/SettingsPanel";
export const metadata = { title: "Settings — Impromptu" };
export default function Settings() { return <Suspense fallback={null}><SettingsPanel /></Suspense>; }
