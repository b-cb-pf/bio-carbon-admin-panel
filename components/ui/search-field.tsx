import { Search } from "lucide-react";

export function SearchField({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return <label className="search-control"><Search size={15} /><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></label>;
}
