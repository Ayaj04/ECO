import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import SmoothScroll from "@/components/layout/SmoothScroll";
import CustomCursor from "@/components/ui/CustomCursor";
import Navbar from "@/components/layout/Navbar";
import ScrollLine from "@/components/layout/ScrollLine";
import { OFFICES } from "@/lib/offices";
import { STATS } from "@/lib/stats";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const SITE_URL = "https://ecovisrkca.netlify.app";

/**
 * Both left unset until there's a real Search Console / GA4 property to point at.
 * Set GOOGLE_SITE_VERIFICATION to the code from Search Console's "HTML tag" verification
 * method (works on a Netlify subdomain — the DNS method doesn't, since that needs domain
 * ownership). Set NEXT_PUBLIC_GA_MEASUREMENT_ID to the "G-XXXXXXXXXX" id from a GA4 property.
 * Neither renders anything until it's set, so this is a no-op until then.
 */
const GOOGLE_SITE_VERIFICATION = process.env.GOOGLE_SITE_VERIFICATION;
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "ECOVIS RKCA | Finance, Technology, Compliance & Legal | Mumbai",
  description:
    "ECOVIS RKCA is a Mumbai-based advisory firm offering finance, technology, compliance and legal services across 94 countries. Trusted by 1,500+ clients globally.",
  ...(GOOGLE_SITE_VERIFICATION && { verification: { google: GOOGLE_SITE_VERIFICATION } }),
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "ECOVIS RKCA",
  description:
    "ECOVIS RKCA is a Mumbai-based advisory firm offering finance, technology, compliance and legal services across 94 countries. Trusted by 1,500+ clients globally.",
  url: SITE_URL,
  logo: `${SITE_URL}/images/ecovis-logo.png`,
  areaServed: {
    "@type": "Place",
    name: "Global",
  },
  sameAs: ["https://www.linkedin.com/company/ecovis-rkca/"],
  additionalProperty: STATS.map((stat) => ({
    "@type": "PropertyValue",
    name: stat.label,
    value: `${stat.value}+`,
  })),
  department: OFFICES.map((office) => ({
    "@type": "ProfessionalService",
    name: `ECOVIS RKCA — ${office.label}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: office.street,
      addressLocality: office.locality,
      addressRegion: office.region,
      postalCode: office.postalCode,
      addressCountry: "IN",
    },
  })),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="antialiased font-sans bg-ecovis-gray text-ecovis-black selection:bg-ecovis-red selection:text-white flex flex-col min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
        <CustomCursor />
        <Navbar />
        <ScrollLine />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
