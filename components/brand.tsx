export function Brand({ compact = false, light = false }: { compact?: boolean; light?: boolean }) {
  return (
    <div className={`brand ${compact ? "brand--compact" : ""} ${light ? "brand--light" : ""}`} aria-label="CarbonProfile">
      <svg className="brand__mark" viewBox="0 0 48 48" role="img" aria-hidden="true">
        <path d="M25.2 4.5c8.8 4.8 15.1 12.4 17.1 21.3-4.4-2.2-9.5-2.7-14.4-1.2-7.6 2.3-12.7 8.3-14.2 15.5C7.4 36.9 3.5 30.4 3.5 23.5c0-7.9 4.9-14.6 11.8-17.4-.8 6 .8 11.6 4.4 15.4.8-7 2.5-12.7 5.5-17Z" />
        <path d="M41.9 30.3c-5.2-1.8-10.9-1.3-15.2 1.8-3.8 2.8-6 7-6.3 11.4 8.7 1.8 17.7-3.2 21.5-13.2Z" />
      </svg>
      {!compact && <span>CarbonProfile</span>}
    </div>
  );
}
