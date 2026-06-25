/**
 * PlanSelectorPanel — Shared component replicating the WorldMove
 * plan-picker modal left panel (eSIM / SIM / Top-Up).
 *
 * Props:
 *  plans        : array of plan objects (eSIM or SIM list)
 *  onAdd        : fn(plan) — called when user clicks +
 *  favs         : { [id]: bool }
 *  onToggleFav  : fn(id)
 */
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Heart, Plus } from 'lucide-react';

// ── All known regions (autocomplete source) ──────────────────────────────
export const ALL_REGIONS = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina',
  'Armenia', 'Australia', 'Austria', 'Azerbaijan',
  'Bahrain', 'Bangladesh', 'Belarus', 'Belgium', 'Bolivia', 'Bosnia',
  'Botswana', 'Brazil', 'Brunei', 'Bulgaria',
  'Cambodia', 'Cameroon', 'Canada', 'Chile', 'China', 'China, Hong Kong',
  'China, Hong Kong, Macau', 'China, Macau', 'China, Taiwan', 'China, UK',
  'Colombia', 'Costa Rica', 'Croatia', 'Cyprus', 'Czech Republic',
  'Denmark', 'Dominican Republic',
  'Ecuador', 'Egypt', 'Estonia', 'Ethiopia',
  'Finland', 'France',
  'Georgia', 'Germany', 'Ghana', 'Global', 'Greece', 'Guatemala',
  'Honduras', 'Hong Kong', 'Hungary',
  'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel',
  'Italy',
  'Japan', 'Jordan',
  'Kazakhstan', 'Kenya', 'Korea', 'Kuwait', 'Kyrgyzstan',
  'Laos', 'Latvia', 'Lebanon', 'Lithuania', 'Luxembourg',
  'Macau', 'Macedonia', 'Malaysia', 'Malta', 'Mexico', 'Moldova',
  'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
  'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Nigeria', 'Norway',
  'Oman',
  'Pakistan', 'Panama', 'Paraguay', 'Peru', 'Philippines', 'Poland',
  'Portugal',
  'Qatar',
  'Romania', 'Russia', 'Rwanda',
  'Saudi Arabia', 'Senegal', 'Serbia', 'Singapore', 'Slovakia', 'Slovenia',
  'South Africa', 'Spain', 'Sri Lanka', 'Sweden', 'Switzerland',
  'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Tunisia', 'Turkey',
  'Turkmenistan',
  'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom',
  'United States', 'Uruguay', 'Uzbekistan',
  'Venezuela', 'Vietnam',
  'Yemen',
  'Zambia', 'Zimbabwe',
  // Combined regions
  'Mainland China',
  'Asia', 'Europe', 'Middle East', 'Africa', 'Americas', 'Oceania',
  'Southeast Asia', 'East Asia', 'South Asia',
  'BICS Europe', 'Nordic', 'Balkans',
];

export const APPLICABLE_OPTIONS = [
  'Applicable Region', 'Asia', 'Southeast Asia', 'East Asia', 'South Asia',
  'Europe', 'Middle East', 'Africa', 'Americas', 'Oceania', 'Global',
];

// ── RegionAutocomplete ───────────────────────────────────────────────────
export function RegionAutocomplete({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const suggestions = useMemo(() =>
    value.length === 0
      ? []
      : ALL_REGIONS.filter(r =>
          r.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 8),
    [value]
  );

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ flex: 1, position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '4px', background: 'white', padding: '2px 6px' }}>
        <Heart size={12} color="#e74c3c" fill="#e74c3c" style={{ marginRight: '4px', flexShrink: 0 }} />
        <input
          type="text"
          value={value}
          placeholder=""
          onChange={e => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => value && setOpen(true)}
          style={{ border: 'none', outline: 'none', fontSize: '12px', width: '100%', background: 'transparent' }}
        />
      </div>
      {open && suggestions.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 9999,
          background: 'white', border: '1px solid #ccc', borderRadius: '4px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', maxHeight: '200px', overflowY: 'auto'
        }}>
          {suggestions.map(s => (
            <div key={s}
              onMouseDown={() => { onChange(s); setOpen(false); }}
              style={{ padding: '7px 12px', fontSize: '12px', cursor: 'pointer', borderBottom: '1px solid #f5f5f5' }}
              onMouseEnter={e => e.currentTarget.style.background = '#e8f7f5'}
              onMouseLeave={e => e.currentTarget.style.background = 'white'}>
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── PlanAutocomplete ─────────────────────────────────────────────────────
export function PlanAutocomplete({ value, onChange, plans }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const suggestions = useMemo(() =>
    value.length === 0
      ? []
      : plans.filter(p =>
          p.productName.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 8),
    [value, plans]
  );

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ flex: 1, position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '4px', background: 'white', padding: '2px 6px' }}>
        <Heart size={12} color="#e74c3c" fill="#e74c3c" style={{ marginRight: '4px', flexShrink: 0 }} />
        <input
          type="text"
          value={value}
          placeholder="Plan"
          onChange={e => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => value && setOpen(true)}
          style={{ border: 'none', outline: 'none', fontSize: '12px', width: '100%', background: 'transparent' }}
        />
      </div>
      {open && suggestions.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 9999,
          background: 'white', border: '1px solid #ccc', borderRadius: '4px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', maxHeight: '200px', overflowY: 'auto'
        }}>
          {suggestions.map(p => (
            <div key={p.wmproductId || p.productId}
              onMouseDown={() => { onChange(p.productName); setOpen(false); }}
              style={{ padding: '7px 12px', fontSize: '12px', cursor: 'pointer', borderBottom: '1px solid #f5f5f5' }}
              onMouseEnter={e => e.currentTarget.style.background = '#e8f7f5'}
              onMouseLeave={e => e.currentTarget.style.background = 'white'}>
              {p.productName}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main PlanSelectorPanel ────────────────────────────────────────────────
export default function PlanSelectorPanel({ plans, onAdd, favs, onToggleFav }) {
  const [applicable, setApplicable] = useState('Applicable Region');
  const [regionVal, setRegionVal] = useState('');
  const [planVal, setPlanVal] = useState('');
  const [favOnly, setFavOnly] = useState(false);
  const [applied, setApplied] = useState({ applicable: 'Applicable Region', region: '', plan: '', favOnly: false });

  const filtered = useMemo(() => plans.filter(p => {
    const mApp = applied.applicable === 'Applicable Region' || (p.applicable || '').toLowerCase().includes(applied.applicable.toLowerCase()) || (p.region || '').toLowerCase().includes(applied.applicable.toLowerCase());
    const mReg = !applied.region || (p.region || '').toLowerCase().includes(applied.region.toLowerCase());
    const mPlan = !applied.plan || (p.productName || '').toLowerCase().includes(applied.plan.toLowerCase());
    const mFav = !applied.favOnly || favs[p.wmproductId || p.productId];
    return mApp && mReg && mPlan && mFav;
  }), [plans, applied, favs]);

  const handleFilter = () => setApplied({ applicable, region: regionVal, plan: planVal, favOnly });
  const handleClear = () => {
    setApplicable('Applicable Region'); setRegionVal(''); setPlanVal(''); setFavOnly(false);
    setApplied({ applicable: 'Applicable Region', region: '', plan: '', favOnly: false });
  };

  return (
    <div style={{ width: '360px', minWidth: '300px', borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', background: '#fafafa' }}>

      {/* Filter area */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #e8e8e8' }}>

        {/* Applicable */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <label style={{ fontSize: '12px', color: '#555', width: '70px', flexShrink: 0 }}>Applicable</label>
          <select value={applicable} onChange={e => setApplicable(e.target.value)}
            style={{ flex: 1, padding: '4px 8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px', background: 'white' }}>
            {APPLICABLE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        {/* Region — autocomplete */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <label style={{ fontSize: '12px', color: '#555', width: '70px', flexShrink: 0 }}>Region</label>
          <RegionAutocomplete value={regionVal} onChange={setRegionVal} />
        </div>

        {/* Plan — autocomplete */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <label style={{ fontSize: '12px', color: '#555', width: '70px', flexShrink: 0 }}>Plan</label>
          <PlanAutocomplete value={planVal} onChange={setPlanVal} plans={plans} />
        </div>

        {/* Favorites only */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <input type="checkbox" id="favOnlyChk" checked={favOnly} onChange={e => setFavOnly(e.target.checked)}
            style={{ width: '14px', height: '14px', cursor: 'pointer' }} />
          <label htmlFor="favOnlyChk" style={{ fontSize: '12px', color: '#555', cursor: 'pointer' }}>Favorites only</label>
        </div>

        {/* Filter / Clear buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleFilter}
            style={{ flex: 1, padding: '6px', background: '#1a9e8e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
            Filter
          </button>
          <button onClick={handleClear}
            style={{ flex: 1, padding: '6px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
            Clear
          </button>
        </div>
      </div>

      {/* Plan count */}
      <div style={{ padding: '8px 16px', borderBottom: '1px solid #e8e8e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: '#666' }}>Eligible</span>
        <span style={{ fontSize: '12px', color: '#1a9e8e', fontWeight: 'bold' }}>are {filtered.length} Plans</span>
      </div>

      {/* Scrollable plan list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '12px' }}>No plans match your filter</div>
        ) : filtered.map(plan => {
          const id = plan.wmproductId || plan.productId;
          const isFav = favs[id];
          return (
            <div key={id} style={{ display: 'flex', alignItems: 'center', padding: '9px 14px', borderBottom: '1px solid #f0f0f0', gap: '8px' }}>
              <Heart
                size={14}
                color={isFav ? '#e74c3c' : '#ccc'}
                fill={isFav ? '#e74c3c' : 'none'}
                style={{ cursor: 'pointer', flexShrink: 0 }}
                onClick={() => onToggleFav(id)}
              />
              <span style={{ flex: 1, fontSize: '12px', color: '#333', lineHeight: '1.4' }}>{plan.productName}</span>
              <button
                onClick={() => onAdd(plan)}
                style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  border: '1px solid #1a9e8e', background: 'white', color: '#1a9e8e',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                <Plus size={12} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
