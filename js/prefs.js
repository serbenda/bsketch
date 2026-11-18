// The site's preferences, kept in this browser: for now only the appearance (light, dark or the system's).
// What is stored is never trusted: anything unknown falls back to the default.

export const PREFS_KEY = 'sketch.prefs';
export const APPEARANCES = ['system', 'light', 'dark'];
export const DEFAULT_PREFS = Object.freeze({ appearance: 'system' });

// Canvas colours offered in the menu (light ones: in the dark appearance the canvas is shown inverted).
export const BACKGROUNDS = [
  ['#ffffff', 'White'],
  ['#fdf8ec', 'Paper'],
  ['#f1f3f5', 'Light grey'],
  ['#e7f5ff', 'Light blue'],
  ['#fff9db', 'Light yellow'],
  ['#ebfbee', 'Light green'],
];

export function cleanPrefs(raw) {
  const out = { ...DEFAULT_PREFS };
  if (raw && typeof raw === 'object' && APPEARANCES.includes(raw.appearance)) out.appearance = raw.appearance;
  return out;
}

export function loadPrefs(storage) {
  try {
    return cleanPrefs(JSON.parse(storage.getItem(PREFS_KEY) || 'null'));
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function savePrefs(storage, prefs) {
  try {
    storage.setItem(PREFS_KEY, JSON.stringify(cleanPrefs(prefs)));
    return true;
  } catch {
    return false;
  }
}
