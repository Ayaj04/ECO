export interface Stat {
  value: number;
  label: string;
}

/** Shared by the homepage counter and the site's structured data, so they can't drift apart. */
export const STATS: Stat[] = [
  { value: 1500, label: "CLIENTS" },
  { value: 50, label: "YEARS OF EXPERIENCE" },
  { value: 90, label: "COUNTRY GLOBAL NETWORK" },
];
