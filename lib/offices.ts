export interface Office {
  id: string;
  /** Area name, shown as the short label next to the pin. */
  label: string;
  street: string;
  locality: string;
  region: string;
  postalCode: string;
}

export const OFFICES: Office[] = [
  {
    id: "vikhroli-west",
    label: "Vikhroli West",
    street: "1903, Kailash Business Park, Vikhroli West",
    locality: "Mumbai",
    region: "Maharashtra",
    postalCode: "400081",
  },
];

/** The full postal address as one line, for display and for the maps query. */
export function fullAddress(office: Office): string {
  return `${office.street}, ${office.locality}, ${office.region} ${office.postalCode}`;
}

/** Opens this office's location in Google Maps — no API key needed, works for any text address. */
export function mapsUrl(office: Office): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress(office))}`;
}
