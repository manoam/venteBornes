import { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || "AIzaSyB54P6gFGfSI6_d9Tm82Ig5t2fJtbKSYOE";

interface AddressResult {
  adresse: string;
  cp: string;
  ville: string;
  pays: string;
}

interface GoogleAddressAutocompleteProps {
  value?: string;
  onChange: (value: string) => void;
  onSelect: (result: AddressResult) => void;
  placeholder?: string;
}

// Load Google Maps script once
let scriptLoaded = false;
let scriptPromise: Promise<void> | null = null;

function loadGoogleMaps(): Promise<void> {
  if (scriptLoaded) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    if ((window as any).google?.maps?.places) {
      scriptLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => {
      scriptLoaded = true;
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export default function GoogleAddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Saisir une adresse...",
}: GoogleAddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  useEffect(() => {
    loadGoogleMaps().then(() => {
      if (!inputRef.current || autocompleteRef.current) return;

      const autocomplete = new (window as any).google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ["address"],
          componentRestrictions: { country: ["fr", "be", "ch", "lu"] },
        }
      );

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place?.address_components) return;

        const components = place.address_components;
        let cp = "";
        let ville = "";
        let pays = "";
        let streetNumber = "";
        let route = "";

        for (const comp of components) {
          const type = comp.types[0];
          if (type === "postal_code") cp = comp.long_name;
          if (type === "locality") ville = comp.long_name;
          if (type === "country") pays = comp.long_name;
          if (type === "street_number") streetNumber = comp.long_name;
          if (type === "route") route = comp.long_name;
        }

        const adresse = [streetNumber, route].filter(Boolean).join(" ");

        onChange(place.formatted_address ?? adresse);
        onSelect({ adresse, cp, ville, pays });
      });

      autocompleteRef.current = autocomplete;
    });
  }, []);

  return (
    <div className="relative">
      <MapPin
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <input
        ref={inputRef}
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      />
    </div>
  );
}
