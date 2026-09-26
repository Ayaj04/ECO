import Link from "next/link";
import { MapPin } from "lucide-react";
import { OFFICES, fullAddress, mapsUrl } from "@/lib/offices";

export default function Footer() {
  return (
    <footer className="w-full bg-ecovis-black text-ecovis-white pt-24 pb-12 px-6 md:px-12 border-t border-gray-800">
      <div className="max-w-[1920px] mx-auto flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex flex-col leading-none mb-6 inline-block" data-cursor="HOME">
              <span className="font-heading font-bold text-3xl tracking-tighter text-ecovis-white flex items-center">
                ECOVIS
                <span className="w-2 h-2 bg-ecovis-red ml-1 rounded-sm"></span>
              </span>
              <span className="font-sans font-medium text-xs tracking-[0.2em] text-gray-400 mt-1">
                RKCA
              </span>
            </Link>

            {OFFICES.map((office) => (
              <a
                key={office.id}
                href={mapsUrl(office)}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="MAP"
                aria-label={`Open ${office.label} office in Google Maps: ${fullAddress(office)}`}
                className="group flex max-w-sm items-start gap-3 rounded-xl p-2 -m-2 transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ecovis-red/70"
              >
                <MapPin
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-ecovis-red transition-transform duration-300 group-hover:scale-110"
                />
                <span className="text-sm leading-relaxed text-gray-400 transition-colors group-hover:text-gray-300">
                  {office.street}, {office.locality}, {office.region} {office.postalCode}
                </span>
              </a>
            ))}
          </div>

          <div className="col-span-1 flex flex-col gap-4">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-ecovis-red mb-4">Core</span>
            <Link href="/#expertise" className="text-sm font-medium text-gray-400 hover:text-ecovis-white transition-colors uppercase tracking-widest">Finance</Link>
            <Link href="/#expertise" className="text-sm font-medium text-gray-400 hover:text-ecovis-white transition-colors uppercase tracking-widest">Technology</Link>
            <Link href="/#expertise" className="text-sm font-medium text-gray-400 hover:text-ecovis-white transition-colors uppercase tracking-widest">Compliance</Link>
            <Link href="/#expertise" className="text-sm font-medium text-gray-400 hover:text-ecovis-white transition-colors uppercase tracking-widest">Legal</Link>
          </div>

          <div className="col-span-1 flex flex-col gap-4">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-ecovis-red mb-4">Company</span>
            <Link href="/#about" className="text-sm font-medium text-gray-400 hover:text-ecovis-white transition-colors uppercase tracking-widest">About</Link>
            <Link href="/privacy-policy" className="text-sm font-medium text-gray-400 hover:text-ecovis-white transition-colors uppercase tracking-widest">Privacy Policy</Link>
            <Link href="#" className="text-sm font-medium text-gray-400 hover:text-ecovis-white transition-colors uppercase tracking-widest">LinkedIn</Link>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-800 text-xs text-gray-500 font-medium tracking-widest">
          <p>&copy; 2026 ECOVIS RKCA. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="/privacy-policy" className="hover:text-ecovis-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-ecovis-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
