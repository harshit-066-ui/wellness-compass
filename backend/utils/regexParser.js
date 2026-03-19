/**
 * Extract JSON object or array from a string that may contain markdown/prose.
 */
export function extractJson(text) {
  if (!text) return null;

  // Try direct parse first
  try { return JSON.parse(text); } catch {}

  // Try to find JSON object
  const objMatch = text.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try { return JSON.parse(objMatch[0]); } catch {}
  }

  // Try to find JSON array
  const arrMatch = text.match(/\[[\s\S]*\]/);
  if (arrMatch) {
    try { return JSON.parse(arrMatch[0]); } catch {}
  }

  return null;
}
