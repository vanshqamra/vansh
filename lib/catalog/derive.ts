import { firstNonEmpty, getField, codeKeys, nameKeys, packKeys, casKeys, hsnKeys } from "./fields";

export function brandFrom(p: any, g?: any) {
  const s = JSON.stringify(p || {});
  return (
    p?.brand || g?.brand || p?.vendor || p?.mfg ||
    (/borosil/i.test(s) ? "Borosil" : "") ||
    ""
  );
}

export function nameFrom(p: any, g?: any) {
  return firstNonEmpty(p, nameKeys()) || g?.title || g?.product || p?.product || "";
}

export function packFrom(p: any) {
  return firstNonEmpty(p, packKeys());
}

export function codeFrom(p: any) {
  const direct = getField(p, codeKeys());
  if (direct) return direct;

  // Fallback: extract code-like token from name/title
  const nameLike = nameFrom(p);
  if (nameLike) {
    const tokens = String(nameLike).split(/[\s,/()_-]+/).filter(Boolean);
    const bad = /^(mm|ml|l|pk|pcs?|um|µm|gm|kg|g|x|mmf)$/i;
    const candidates = tokens.filter(t => {
      const T = t.toLowerCase();
      if (bad.test(T)) return false;
      if (!/^[a-z0-9-]+$/i.test(t)) return false;
      if (!/\d/.test(t)) return false;
      if (/(mm|ml|l|µm|um)$/i.test(T)) return false;
      return t.length >= 3 && t.length <= 12;
    });
    const alnum = candidates.filter(t => /[a-z]/i.test(t) && /\d/.test(t)).sort((a,b)=>a.length-b.length);
    return alnum[0] || candidates.find(t => /^\d{3,8}$/.test(t)) || "";
  }
  return "";
}

export function hsnFrom(p: any) { return firstNonEmpty(p, hsnKeys()); }
export function casFrom(p: any) { return firstNonEmpty(p, casKeys()); }
