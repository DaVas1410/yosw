export function breakdown(ms) {
  const clamped = Math.max(0, ms);
  const s = Math.floor(clamped / 1000);
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

const DAY_MS = 86400000;
// Ecuador (UTC-5, no DST): event days roll over at local midnight.
const ECUADOR_OFFSET_MS = -5 * 3600000;

// 'before' until start, 'live' while start <= now < end, 'after' from end on.
export function eventPhase(now, start, end) {
  if (now < start) return 'before';
  if (now < end) return 'live';
  return 'after';
}

// 1-based event day in Ecuador local time (day 1 = the start's calendar date).
export function eventDay(now, start) {
  const localDay = (ms) => Math.floor((ms + ECUADOR_OFFSET_MS) / DAY_MS);
  return localDay(now) - localDay(start) + 1;
}

// Video id from a YouTube watch / live / youtu.be / embed URL, or null.
export function youtubeId(url) {
  if (!url) return null;
  const m = String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:live\/|embed\/|watch\?(?:.*&)?v=))([\w-]{11})/);
  return m ? m[1] : null;
}
