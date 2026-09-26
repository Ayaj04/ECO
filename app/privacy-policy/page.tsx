import type { Metadata } from "next";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy | ECOVIS RKCA",
  description:
    "How Ecovis RKCA Advisors Ltd collects, uses, shares, and protects your personal information.",
  alternates: { canonical: "/privacy-policy" },
};

const h2Class = "font-heading text-2xl md:text-3xl font-bold text-ecovis-black uppercase tracking-tight mt-14 mb-5";
const pClass = "text-base leading-relaxed text-gray-600 font-sans mb-4";
const ulClass = "flex flex-col gap-2.5 text-base leading-relaxed text-gray-600 font-sans mb-4 pl-1";
const liClass = "flex gap-3 before:content-['●'] before:text-ecovis-red before:text-[6px] before:mt-2.5 before:shrink-0";

export default function PrivacyPolicyPage() {
  return (
    <main className="w-full min-h-screen bg-ecovis-white">
      <article className="max-w-3xl mx-auto px-6 md:px-12 pt-32 pb-24 md:pt-40">
        <span className="text-sm font-bold tracking-[0.2em] uppercase text-ecovis-red block mb-4">
          Legal
        </span>
        <h1 className="font-heading text-4xl md:text-6xl font-bold text-ecovis-black uppercase tracking-tight leading-[1.05] mb-10">
          Privacy Policy
        </h1>

        <p className={pClass}>
          At Ecovis RKCA Advisors Ltd, a company registered in India with its registered office at
          1903, Kailash Business Park, Vikhroli West, Mumbai, Maharashtra 400081, we value your
          privacy. This policy outlines how we collect, use, and protect your personal
          information.
        </p>
        <p className={pClass}>
          When you use our website, apps, or engage with our services, including the purchase or
          use of our products, you trust us with your personal information. This information
          enables us to provide you with a better experience, such as remembering your
          preferences to streamline future interactions. We understand the importance of your
          privacy and the trust you place in us. Therefore, this privacy policy details how we
          collect, use, share, and protect your personal information when you interact with us.
        </p>
        <p className={pClass}>
          We strive to keep this document clear and transparent. However, if you have any
          questions, contact details are provided at the end of this policy.
        </p>
        <p className={pClass}>This policy also applies to our subsidiary companies.</p>

        <h2 className={h2Class}>Collection and Storage of Your Information</h2>
        <p className={pClass}>We collect and use your personal information, including:</p>
        <ul className={ulClass}>
          <li className={liClass}>Full name</li>
          <li className={liClass}>Phone number</li>
          <li className={liClass}>Email address</li>
          <li className={liClass}>Company</li>
          <li className={liClass}>Title</li>
          <li className={liClass}>
            Engagement with our services and products, including webinar and training
            enrollments, course access, and completion data
          </li>
        </ul>
        <p className={pClass}>
          We gather this information when you register for or use our services, purchase our
          products, or interact with our website or apps. Additionally, we collect aggregate user
          data regarding usage and activity on our platforms.
        </p>
        <p className={pClass}>
          We may also receive your information from third-party partners or subcontractors. In
          such cases, you will be informed at the time of collection that the data is being shared
          with us. Any information provided by these partners will be handled in accordance with
          this Privacy Policy.
        </p>
        <p className={pClass}>
          We store your personal information securely in our database and retain it for a
          reasonable period. If you maintain a subscription with us, your data will be stored for
          the duration of your subscription and for up to eight years thereafter.
        </p>

        <h2 className={h2Class}>Use of Information</h2>
        <p className={pClass}>The personal information we collect is used to:</p>
        <ul className={ulClass}>
          <li className={liClass}>Provide personalized advice and services</li>
          <li className={liClass}>
            Offer information about related products and services based on your preferences
          </li>
          <li className={liClass}>Improve our website and develop new products and services</li>
          <li className={liClass}>Administer systems and troubleshoot issues</li>
        </ul>
        <p className={pClass}>
          Your information may be shared with members of our organization and select third
          parties.
        </p>
        <p className={pClass}>
          <strong className="text-ecovis-black">Please note:</strong>
          <br />
          We do not share your credit card information with any third party outside of our company
          or our payment processors.
          <br />
          Basic demographic data, such as name, address, phone number, email, and company, may be
          shared with marketing partners (e.g., Google Ads, Facebook Ads, LinkedIn Insights). If
          you wish to opt out, you may do so by contacting us via the information provided in the
          &lsquo;How to Contact Us&rsquo; section.
        </p>
        <p className={pClass}>
          Any third parties with whom we share your information are required to adhere to strict
          processing and security standards. Your data will only be shared with these parties for
          the purpose of fulfilling their function.
        </p>
        <p className={pClass}>
          Your personal information may also be transferred to third-party organizations in
          specific scenarios, such as:
        </p>
        <ul className={ulClass}>
          <li className={liClass}>
            If we discuss selling or transferring part or all of our business, your data may be
            shared with prospective buyers under confidentiality agreements.
          </li>
          <li className={liClass}>
            If our company undergoes reorganization or is sold, your information may be
            transferred to the buyer.
          </li>
          <li className={liClass}>
            If we are legally required to disclose information, such as to regulatory authorities
            or law enforcement agencies.
          </li>
          <li className={liClass}>If we need to defend a legal claim, your information may be shared as required.</li>
        </ul>

        <h2 className={h2Class}>Why We Use Your Information</h2>
        <p className={pClass}>We use your information to:</p>
        <ul className={ulClass}>
          <li className={liClass}>
            Fulfill our contractual obligations to you by delivering the products or services you
            have ordered.
          </li>
          <li className={liClass}>
            Pursue our legitimate business interests, such as improving our services, understanding
            user behavior, and maintaining communication with you.
          </li>
          <li className={liClass}>Build and maintain strong relationships with our partners and suppliers.</li>
        </ul>

        <h2 className={h2Class}>Your Rights</h2>
        <p className={pClass}>
          You may have rights concerning your personal information, including the right to access
          or correct the data we hold about you. Depending on your circumstances, you may also
          have the right to:
        </p>
        <ul className={ulClass}>
          <li className={liClass}>Withdraw consent at any time where applicable.</li>
          <li className={liClass}>Confirm if we are processing your information.</li>
          <li className={liClass}>Access your personal information.</li>
          <li className={liClass}>Correct or amend inaccurate data.</li>
          <li className={liClass}>Request the deletion of your information.</li>
          <li className={liClass}>Be forgotten by requesting that we stop using your information.</li>
          <li className={liClass}>Restrict how we process your information.</li>
          <li className={liClass}>Object to the use of your personal information, but only in certain cases.</li>
        </ul>

        <h2 className={h2Class}>How to Contact Us</h2>
        <p className={pClass}>
          If you have any questions regarding this policy or wish to exercise any of your rights,
          please contact us at{" "}
          <a href="mailto:info@ecovisrkca.com" className="text-ecovis-red underline underline-offset-2 hover:no-underline">
            info@ecovisrkca.com
          </a>
          .
        </p>

        <h2 className={h2Class}>Changes to This Policy</h2>
        <p className={pClass}>
          This privacy policy may be updated from time to time. If we make significant changes to
          this policy, we will highlight the updates at the top of the policy and provide a
          prominent link on our website for a reasonable period following the change.
        </p>
        <p className={pClass}>For access to previous versions of this policy, please contact us.</p>

        <h2 className={h2Class}>Sources of Personal Information</h2>
        <p className={pClass}>We collect personal information from the following sources:</p>
        <ul className={ulClass}>
          <li className={liClass}>Directly from you or your agents, including documents related to the services we provide.</li>
          <li className={liClass}>
            Indirectly from you or your agents, through information gathered during our service
            delivery.
          </li>
          <li className={liClass}>
            From activity on our website (
            <a href="https://ecovisrkca.com" target="_blank" rel="noopener noreferrer" className="text-ecovis-red underline underline-offset-2 hover:no-underline">
              https://ecovisrkca.com
            </a>
            ), such as submissions or website usage data.
          </li>
          <li className={liClass}>From third parties that interact with us in connection with the services we perform.</li>
        </ul>

        <h2 className={h2Class}>Use of Personal Information</h2>
        <p className={pClass}>
          We may use or disclose your personal information for the following business purposes:
        </p>
        <ul className={ulClass}>
          <li className={liClass}>To provide the products or services you have requested.</li>
          <li className={liClass}>To send you alerts, event registrations, and other updates that may be of interest to you.</li>
          <li className={liClass}>To enforce contractual rights, including for billing and collections.</li>
          <li className={liClass}>To improve and present our website&rsquo;s content to you.</li>
          <li className={liClass}>For testing, research, and product development.</li>
          <li className={liClass}>To protect the rights, property, or safety of our clients, ourselves, or others.</li>
          <li className={liClass}>To respond to legal or regulatory requests.</li>
          <li className={liClass}>
            To evaluate or conduct mergers, restructurings, or sales, in which your personal
            information may be transferred as part of the process.
          </li>
        </ul>

        <h2 className={h2Class}>Your Rights and Choices</h2>
        <p className={pClass}>You have the right to:</p>
        <ul className={ulClass}>
          <li className={liClass}>
            Request access to the personal information we&rsquo;ve collected about you over the
            past 12 months.
          </li>
          <li className={liClass}>
            Request the deletion of your personal information, subject to exceptions such as legal
            obligations or ongoing contracts.
          </li>
        </ul>
        <p className={pClass}>To exercise these rights, please contact us at:</p>
        <ul className={ulClass}>
          <li className={liClass}>
            Phone:{" "}
            <a href="tel:+919137522708" className="text-ecovis-red underline underline-offset-2 hover:no-underline">
              +91 9137522708
            </a>
          </li>
          <li className={liClass}>
            Website:{" "}
            <a href="https://ecovisrkca.com/contact_us" target="_blank" rel="noopener noreferrer" className="text-ecovis-red underline underline-offset-2 hover:no-underline">
              https://ecovisrkca.com/contact_us
            </a>
          </li>
          <li className={liClass}>
            Email:{" "}
            <a href="mailto:info@ecovisrkca.com" className="text-ecovis-red underline underline-offset-2 hover:no-underline">
              info@ecovisrkca.com
            </a>
          </li>
        </ul>
        <p className={pClass}>We will verify your identity before fulfilling your request.</p>

        <h2 className={h2Class}>Response Timing and Format</h2>
        <p className={pClass}>
          We aim to respond to verifiable requests within 30 days. If more time is required (up to
          90 days), we will inform you of the extension.
        </p>

        <h2 className={h2Class}>Changes to Our Privacy Notice</h2>
        <p className={pClass}>
          We reserve the right to modify this privacy notice at any time. If significant changes
          are made, we will notify you through a prominent notice on our homepage.
        </p>
      </article>

      <Footer />
    </main>
  );
}
