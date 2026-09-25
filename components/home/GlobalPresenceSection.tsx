"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Globe2, MapPin, X } from "lucide-react";

interface Country {
  name: string;
  code: string;
}

interface Region {
  id: string;
  name: string;
  shortName: string;
  countries: Country[];
}

const REGIONS: Region[] = [
  {
    id: "asia-pacific",
    name: "Asia-Pacific",
    shortName: "Asia-Pacific",
    countries: [
      { name: "Australia", code: "au" },
      { name: "Cambodia", code: "kh" },
      { name: "China", code: "cn" },
      { name: "Hong Kong", code: "hk" },
      { name: "Indonesia", code: "id" },
      { name: "Japan", code: "jp" },
      { name: "Korea (Republic)", code: "kr" },
      { name: "Malaysia", code: "my" },
      { name: "Myanmar", code: "mm" },
      { name: "New Zealand", code: "nz" },
      { name: "Philippines", code: "ph" },
      { name: "Singapore", code: "sg" },
      { name: "Taiwan", code: "tw" },
      { name: "Thailand", code: "th" },
      { name: "Vietnam", code: "vn" },
    ],
  },
  {
    id: "central-south-asia",
    name: "Central and South Asia",
    shortName: "Central & South Asia",
    countries: [
      { name: "Azerbaijan", code: "az" },
      { name: "Bangladesh", code: "bd" },
      { name: "India", code: "in" },
      { name: "Kazakhstan", code: "kz" },
      { name: "Nepal", code: "np" },
      { name: "Pakistan", code: "pk" },
      { name: "Tajikistan", code: "tj" },
      { name: "Uzbekistan", code: "uz" },
    ],
  },
  {
    id: "middle-east-africa",
    name: "Middle East and Africa",
    shortName: "Middle East & Africa",
    countries: [
      { name: "Algeria", code: "dz" },
      { name: "Egypt", code: "eg" },
      { name: "Israel", code: "il" },
      { name: "Jordan", code: "jo" },
      { name: "Kuwait", code: "kw" },
      { name: "Lebanon", code: "lb" },
      { name: "Mauritius", code: "mu" },
      { name: "Morocco", code: "ma" },
      { name: "Nigeria", code: "ng" },
      { name: "Oman", code: "om" },
      { name: "Qatar", code: "qa" },
      { name: "Saudi Arabia", code: "sa" },
      { name: "South Africa", code: "za" },
      { name: "Tunisia", code: "tn" },
      { name: "United Arab Emirates", code: "ae" },
    ],
  },
  {
    id: "americas",
    name: "The Americas",
    shortName: "The Americas",
    countries: [
      { name: "Argentina", code: "ar" },
      { name: "The Bahamas", code: "bs" },
      { name: "Bolivia", code: "bo" },
      { name: "Brazil", code: "br" },
      { name: "Canada", code: "ca" },
      { name: "Chile", code: "cl" },
      { name: "Colombia", code: "co" },
      { name: "Costa Rica", code: "cr" },
      { name: "Dominican Republic", code: "do" },
      { name: "Ecuador", code: "ec" },
      { name: "El Salvador", code: "sv" },
      { name: "Guatemala", code: "gt" },
      { name: "Mexico", code: "mx" },
      { name: "Paraguay", code: "py" },
      { name: "Peru", code: "pe" },
      { name: "Uruguay", code: "uy" },
      { name: "USA", code: "us" },
    ],
  },
  {
    id: "europe",
    name: "Europe",
    shortName: "Europe",
    countries: [
      { name: "Albania", code: "al" },
      { name: "Austria", code: "at" },
      { name: "Belgium", code: "be" },
      { name: "Bosnia and Herzegovina", code: "ba" },
      { name: "Bulgaria", code: "bg" },
      { name: "Croatia", code: "hr" },
      { name: "Cyprus", code: "cy" },
      { name: "Czech Republic", code: "cz" },
      { name: "Denmark", code: "dk" },
      { name: "Estonia", code: "ee" },
      { name: "Finland", code: "fi" },
      { name: "France", code: "fr" },
      { name: "Georgia", code: "ge" },
      { name: "Germany", code: "de" },
      { name: "Greece", code: "gr" },
      { name: "Hungary", code: "hu" },
      { name: "Ireland", code: "ie" },
      { name: "Italy", code: "it" },
      { name: "Kosovo", code: "xk" },
      { name: "Latvia", code: "lv" },
      { name: "Liechtenstein", code: "li" },
      { name: "Lithuania", code: "lt" },
      { name: "Luxembourg", code: "lu" },
      { name: "Malta", code: "mt" },
      { name: "Netherlands", code: "nl" },
      { name: "North Macedonia", code: "mk" },
      { name: "Norway", code: "no" },
      { name: "Poland", code: "pl" },
      { name: "Portugal", code: "pt" },
      { name: "Romania", code: "ro" },
      { name: "Serbia", code: "rs" },
      { name: "Slovak Republic", code: "sk" },
      { name: "Slovenia", code: "si" },
      { name: "Spain", code: "es" },
      { name: "Sweden", code: "se" },
      { name: "Switzerland", code: "ch" },
      { name: "Turkey", code: "tr" },
      { name: "Ukraine", code: "ua" },
      { name: "United Kingdom", code: "gb" },
    ],
  },
];

const TOTAL_COUNTRIES = REGIONS.reduce((sum, r) => sum + r.countries.length, 0);

export default function GlobalPresenceSection() {
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredRegions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return REGIONS.map((region) => {
      // If a specific region is filtered, skip others
      if (selectedRegion !== "all" && region.id !== selectedRegion) {
        return null;
      }

      // Filter countries by search query
      const matchingCountries = q
        ? region.countries.filter((c) =>
            c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
          )
        : region.countries;

      if (matchingCountries.length === 0) return null;

      return {
        ...region,
        countries: matchingCountries,
      };
    }).filter(Boolean) as Region[];
  }, [selectedRegion, searchQuery]);

  const totalMatchingCountries = useMemo(() => {
    return filteredRegions.reduce((sum, r) => sum + r.countries.length, 0);
  }, [filteredRegions]);

  return (
    <section
      id="countries-network"
      className="w-full bg-[#FCFCFA] text-ecovis-black py-20 sm:py-28 px-6 sm:px-10 md:px-16 lg:px-20 border-t border-gray-200 relative overflow-hidden"
    >
      <div className="max-w-[1600px] mx-auto">
        {/* Section Header */}
        <div className="mb-14 sm:mb-20">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-2 w-2 rounded-full bg-ecovis-red animate-pulse" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.28em] text-ecovis-red">
              Global Presence
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-ecovis-black tracking-tight leading-[1.1] uppercase">
                Headquarters{" "}
                <span className="text-ecovis-red">All Over The World</span>
              </h2>
              <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-2xl font-sans font-normal leading-relaxed">
                Seamless cross-border advisory, tax, legal, and financial intelligence delivered across {TOTAL_COUNTRIES}+ sovereign jurisdictions by certified local specialists.
              </p>
            </div>

            {/* Live Search and Metric Pill */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="relative min-w-[260px] sm:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search any country..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 bg-white border border-gray-300 rounded-full text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-ecovis-red focus:ring-2 focus:ring-ecovis-red/15 transition-all shadow-xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-full text-xs sm:text-sm font-bold tracking-wider text-gray-800 shadow-xs shrink-0">
                <Globe2 className="w-4 h-4 text-ecovis-red" />
                <span>
                  <strong className="text-ecovis-red">{totalMatchingCountries}</strong>{" "}
                  COUNTRIES ACTIVE
                </span>
              </div>
            </div>
          </div>

          {/* Region Filter Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-2 pt-4 border-t border-gray-200/70">
            <button
              onClick={() => setSelectedRegion("all")}
              className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all ${
                selectedRegion === "all"
                  ? "bg-ecovis-black text-white shadow-sm"
                  : "bg-white text-gray-600 hover:text-ecovis-black border border-gray-200 hover:border-gray-300"
              }`}
            >
              All Regions ({TOTAL_COUNTRIES})
            </button>
            {REGIONS.map((r) => {
              const active = selectedRegion === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedRegion(r.id)}
                  className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all ${
                    active
                      ? "bg-ecovis-red text-white shadow-sm"
                      : "bg-white text-gray-600 hover:text-ecovis-black border border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {r.shortName} ({r.countries.length})
                </button>
              );
            })}
          </div>
        </div>

        {/* Regions Listing */}
        {filteredRegions.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-xl border border-dashed border-gray-300">
            <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-700">No countries match your search</h3>
            <p className="text-sm text-gray-500 mt-1">
              Try searching for a different keyword or reset the filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedRegion("all");
              }}
              className="mt-4 px-4 py-2 text-xs font-bold uppercase tracking-wider text-ecovis-red hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-16 sm:space-y-20">
            <AnimatePresence mode="popLayout">
              {filteredRegions.map((region) => (
                <motion.div
                  key={region.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="relative"
                >
                  {/* Region Title with signature red underline bar matching reference image */}
                  <div className="mb-8">
                    <h3 className="text-2xl sm:text-3xl md:text-[2rem] font-heading font-medium text-gray-900 tracking-tight">
                      {region.name}
                    </h3>
                    {/* The iconic red underline matching the reference screenshot */}
                    <div className="w-12 sm:w-14 h-[3px] bg-ecovis-red mt-2.5 rounded-full" />
                  </div>

                  {/* 4-Column Grid matching reference images */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 sm:gap-x-8 md:gap-x-10 gap-y-4 sm:gap-y-5">
                    {region.countries.map((country) => (
                      <div
                        key={country.name}
                        className="group flex items-center gap-3.5 py-1.5 px-2 rounded-md hover:bg-white hover:shadow-xs transition-all duration-200"
                      >
                        {/* Standardized Flag Badge Container */}
                        <div className="relative w-8 h-[22px] sm:w-[34px] sm:h-[23px] shrink-0 overflow-hidden rounded-[2px] shadow-xs border border-black/10 bg-white flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                          <img
                            src={`/images/flags/${country.code}.svg`}
                            alt={`${country.name} flag`}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Country Label */}
                        <span className="text-[14px] sm:text-[15px] font-sans text-gray-800 font-normal tracking-tight group-hover:text-ecovis-red group-hover:translate-x-0.5 transition-all duration-200">
                          {country.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}
