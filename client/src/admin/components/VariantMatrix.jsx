import { useState } from 'react';
import { colorHex } from '@/lib/product';
import { cn } from '@/lib/utils';

const SIZE_PRESETS = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];
const COLOR_PRESETS = ['Black', 'White', 'Navy', 'Charcoal', 'Olive', 'Maroon', 'Beige', 'Grey'];
const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];

const sortSizes = (list) =>
  [...list].sort((a, b) => {
    const ia = SIZE_ORDER.indexOf(a.toUpperCase());
    const ib = SIZE_ORDER.indexOf(b.toUpperCase());
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b);
  });

const field = 'rounded-md border border-gray-300 bg-brand-white px-3 text-sm text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-accent';

const chip = (on) =>
  cn(
    'min-h-[36px] rounded-full border px-3.5 text-xs font-semibold transition-colors',
    on ? 'border-brand-black bg-brand-black text-brand-white' : 'border-gray-300 bg-brand-white text-gray-700 hover:border-brand-black',
  );

/**
 * Pick sizes and colours with one tap, then fill in stock in a colour × size grid.
 * Emits the flat `variants` array the API expects ([{ sku?, color, size, stock }]).
 * Existing variant SKUs are kept so older orders keep pointing at the right item.
 */
export const VariantMatrix = ({ variants, onChange }) => {
  const [sizes, setSizes] = useState(() => sortSizes([...new Set(variants.map((v) => v.size).filter(Boolean))]));
  const [colors, setColors] = useState(() => [...new Set(variants.map((v) => v.color).filter(Boolean))]);
  const [customSize, setCustomSize] = useState('');
  const [customColor, setCustomColor] = useState('');
  const [defaultStock, setDefaultStock] = useState('10');

  const cell = (color, size) => variants.find((v) => v.color === color && v.size === size);

  const emit = (nextColors, nextSizes, overrides = {}) => {
    const next = [];
    nextColors.forEach((color) => {
      nextSizes.forEach((size) => {
        const key = `${color}|${size}`;
        const existing = cell(color, size);
        const stock = key in overrides ? overrides[key] : existing ? existing.stock : defaultStock;
        next.push({ ...(existing?.sku ? { sku: existing.sku } : {}), color, size, stock: String(stock) });
      });
    });
    onChange(next);
  };

  const toggleSize = (size) => {
    const next = sizes.some((s) => s.toLowerCase() === size.toLowerCase()) ? sizes.filter((s) => s.toLowerCase() !== size.toLowerCase()) : sortSizes([...sizes, size]);
    setSizes(next);
    emit(colors, next);
  };
  const toggleColor = (color) => {
    const next = colors.some((c) => c.toLowerCase() === color.toLowerCase()) ? colors.filter((c) => c.toLowerCase() !== color.toLowerCase()) : [...colors, color];
    setColors(next);
    emit(next, sizes);
  };
  const addCustomSize = () => {
    const value = customSize.trim().toUpperCase();
    if (value && !sizes.includes(value)) {
      const next = sortSizes([...sizes, value]);
      setSizes(next);
      emit(colors, next);
    }
    setCustomSize('');
  };
  const addCustomColor = () => {
    const value = customColor.trim().replace(/\b\w/g, (c) => c.toUpperCase());
    if (value && !colors.some((c) => c.toLowerCase() === value.toLowerCase())) {
      const next = [...colors, value];
      setColors(next);
      emit(next, sizes);
    }
    setCustomColor('');
  };
  const setStock = (color, size, value) => emit(colors, sizes, { [`${color}|${size}`]: value });
  const fillAll = () => emit(colors, sizes, Object.fromEntries(colors.flatMap((c) => sizes.map((s) => [`${c}|${s}`, defaultStock]))));

  const allSizes = sortSizes([...new Set([...SIZE_PRESETS, ...sizes])]);
  const allColors = [...new Set([...COLOR_PRESETS, ...colors])];
  const total = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">1. Sizes available</p>
        <div className="flex flex-wrap items-center gap-2">
          {allSizes.map((s) => (
            <button key={s} type="button" aria-pressed={sizes.includes(s)} onClick={() => toggleSize(s)} className={chip(sizes.includes(s))}>{s}</button>
          ))}
          <span className="flex items-center gap-1">
            <input value={customSize} onChange={(e) => setCustomSize(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomSize(); } }} placeholder="Other size" className={`${field} h-9 w-28`} aria-label="Add another size" />
            <button type="button" onClick={addCustomSize} className={chip(false)}>Add</button>
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">2. Colours available</p>
        <div className="flex flex-wrap items-center gap-2">
          {allColors.map((c) => (
            <button key={c} type="button" aria-pressed={colors.includes(c)} onClick={() => toggleColor(c)} className={cn(chip(colors.includes(c)), 'inline-flex items-center gap-2')}>
              <span className="h-3 w-3 rounded-full border border-gray-400/60" style={{ backgroundColor: colorHex(c) }} />
              {c}
            </button>
          ))}
          <span className="flex items-center gap-1">
            <input value={customColor} onChange={(e) => setCustomColor(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomColor(); } }} placeholder="Other colour" className={`${field} h-9 w-32`} aria-label="Add another colour" />
            <button type="button" onClick={addCustomColor} className={chip(false)}>Add</button>
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-gray-700">3. Stock for each combination</p>
          {colors.length > 0 && sizes.length > 0 && (
            <span className="flex items-center gap-2 text-xs text-gray-600">
              Set all to
              <input type="number" min="0" value={defaultStock} onChange={(e) => setDefaultStock(e.target.value)} className={`${field} h-8 w-16`} aria-label="Stock for all" />
              <button type="button" onClick={fillAll} className={chip(false)}>Apply</button>
            </span>
          )}
        </div>
        {colors.length === 0 || sizes.length === 0 ? (
          <p className="rounded-md border border-dashed border-gray-300 px-4 py-5 text-center text-sm text-gray-500">Choose at least one size and one colour above and the stock grid appears here.</p>
        ) : (
          <div className="overflow-x-auto rounded-md border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Colour</th>
                  {sizes.map((s) => <th key={s} className="px-2 py-2 text-center font-semibold">{s}</th>)}
                </tr>
              </thead>
              <tbody>
                {colors.map((c) => (
                  <tr key={c} className="border-t border-gray-100">
                    <td className="whitespace-nowrap px-3 py-2 font-medium text-brand-black">
                      <span className="mr-2 inline-block h-3 w-3 rounded-full border border-gray-400/60 align-middle" style={{ backgroundColor: colorHex(c) }} />{c}
                    </td>
                    {sizes.map((s) => (
                      <td key={s} className="px-1.5 py-1.5">
                        <input
                          type="number"
                          min="0"
                          value={cell(c, s)?.stock ?? ''}
                          onChange={(e) => setStock(c, s, e.target.value)}
                          aria-label={`Stock for ${c} ${s}`}
                          className="h-9 w-16 rounded-md border border-gray-300 bg-brand-white px-2 text-center text-sm text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-accent"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {colors.length > 0 && sizes.length > 0 && <p className="text-xs text-gray-500">{variants.length} variants · {total} pieces in stock. Enter 0 for a combination you don’t have.</p>}
      </div>
    </div>
  );
};
