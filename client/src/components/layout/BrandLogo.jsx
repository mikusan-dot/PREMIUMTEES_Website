import { useBrand } from '@/hooks/useStoreSettings';

// Wordmark (or uploaded logo image). "UNHINGED CO." splits into a bold name and a lighter "CO."
// so the full mark stays compact enough for a 320px mobile header.
export const BrandLogo = ({ className = '', imgClassName = 'h-7 sm:h-9 w-auto max-w-[11rem]' }) => {
  const brand = useBrand();
  if (brand.logoUrl) {
    return <img src={brand.logoUrl} alt={brand.name} className={imgClassName} decoding="async" />;
  }
  const upper = brand.name.toUpperCase();
  const m = upper.match(/^(.*?)(\s+(?:CO\.?|COMPANY|INC\.?|LTD\.?))$/);
  return (
    <span className={`font-sans font-extrabold uppercase leading-none tracking-[-0.04em] ${className}`}>
      {m ? (<>{m[1]}{" "}<span className="font-light tracking-normal">{m[2].trim()}</span></>) : upper}
    </span>
  );
};
