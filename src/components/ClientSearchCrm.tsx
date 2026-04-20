import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { clientsApi } from "../lib/api";

interface CrmClientResult {
  id: number;
  text: string;
}

interface ClientSearchCrmProps {
  onSelect: (crmId: number, label: string) => void;
  onClear: () => void;
  selectedLabel?: string;
}

export default function ClientSearchCrm({
  onSelect,
  onClear,
  selectedLabel,
}: ClientSearchCrmProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CrmClientResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const search = (q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setQuery(q);

    if (q.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await clientsApi.searchCrm(q.trim());
        setResults(data);
        setIsOpen(true);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  if (selectedLabel) {
    return (
      <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-primary-50">
        <span className="flex-1 text-sm font-medium text-primary-800 truncate">
          {selectedLabel}
        </span>
        <button
          onClick={() => {
            onClear();
            setQuery("");
            setResults([]);
          }}
          className="p-1 hover:bg-primary-100 rounded"
        >
          <X size={16} className="text-primary-600" />
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => search(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Rechercher un client dans le CRM..."
          className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
        />
        {isLoading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
            ...
          </span>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                onSelect(r.id, r.text);
                setIsOpen(false);
                setQuery("");
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-primary-50 border-b last:border-0 transition-colors"
            >
              {r.text}
            </button>
          ))}
        </div>
      )}

      {isOpen && results.length === 0 && query.length >= 2 && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg p-4 text-sm text-gray-500 text-center">
          Aucun client trouvé
        </div>
      )}
    </div>
  );
}
