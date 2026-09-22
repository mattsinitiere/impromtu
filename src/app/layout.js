import "./globals.css";
import { StoreProvider } from "@/lib/store";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Toast from "@/components/Toast";

export const metadata = {
  title: "Impromptu — Learn anything. Speak about everything.",
  description:
    "Impromptu draws a random educational topic. Research it, write it in your own words, then present it for one minute — and get an AI grade on how you did.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Impromptu — Learn anything. Speak about everything.",
    description: "Draw a topic. Research it. Present it in one minute.",
    type: "website",
  },
};

export const viewport = { themeColor: "#FBFBFD", viewportFit: "cover" };

/* Inline script so a dark-mode reader never sees a light flash before hydration. */
const themeScript = `try{var s=JSON.parse(localStorage.getItem("impromptu:v2")||"{}");if(s.theme==="dark")document.documentElement.setAttribute("data-theme","dark")}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <StoreProvider>
          <div className="ambient" aria-hidden="true"><span></span><span></span></div>
          <Header />
          <main>{children}</main>
          <Footer />
          <Toast />
        </StoreProvider>
      </body>
    </html>
  );
}
