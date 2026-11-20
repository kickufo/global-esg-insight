const FEED_URL = '/api/cases-feed';
const FALLBACK_TRACKING = 'utm_source=game&utm_medium=referral';
let feedPromise;

function severityValue(value) {
  const match = String(value || '').match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

function timestamp(value) {
  const parsed = Date.parse(value || '');
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeContext(input) {
  if (Array.isArray(input)) return { issues: input, countries: [], regions: [], industries: [], sectors: [] };
  const value = input && typeof input === 'object' ? input : {};
  const unique = key => [...new Set(Array.isArray(value[key]) ? value[key].filter(Boolean) : [])];
  return { issues: unique('issues'), countries: unique('countries'), regions: unique('regions'), industries: unique('industries'), sectors: unique('sectors') };
}

function industrySimilarity(caseIndustries, wantedIndustries, wantedSectors) {
  let best = 0;
  for (const rawCase of caseIndustries || []) {
    const current = String(rawCase);
    for (const rawWanted of wantedIndustries || []) {
      const wanted = String(rawWanted);
      if (current === wanted) best = Math.max(best, 140);
      else if (current.startsWith(`${wanted}.`) || wanted.startsWith(`${current}.`)) best = Math.max(best, 95);
      else if (current.split('.')[0] === wanted.split('.')[0]) best = Math.max(best, 28);
    }
    if ((wantedSectors || []).some(sector => current === sector || current.startsWith(`${sector}.`))) best = Math.max(best, 28);
  }
  return best;
}

function scoreCase(item, rawContext) {
  const context = normalizeContext(rawContext);
  const issueSet = new Set(context.issues);
  const issueOverlap = (item.issues || []).filter(issue => issueSet.has(issue)).length;
  const countryMatch = (item.countries || []).some(value => context.countries.includes(value));
  const regionMatch = (item.regions || []).some(value => context.regions.includes(value));
  const industryScore = industrySimilarity(item.industries, context.industries, context.sectors);
  if (!issueOverlap && !countryMatch && !regionMatch && !industryScore) return null;
  const reasons = [];
  if (countryMatch) reasons.push('目的地国家相同');
  if (industryScore >= 140) reasons.push('细分行业相同');
  else if (industryScore >= 95) reasons.push('行业高度相关');
  else if (industryScore) reasons.push('同属产业大类');
  if (issueOverlap) reasons.push(`风险议题相同${issueOverlap > 1 ? ` ×${issueOverlap}` : ''}`);
  if (regionMatch && !countryMatch) reasons.push('同一地区');
  let score = (countryMatch ? 120 : 0) + (regionMatch ? 45 : 0) + industryScore + issueOverlap * 35;
  score += severityValue(item.severity) * 3;
  score += timestamp(item.date) / 1e13;
  return { score, reasons };
}

export async function loadCaseFeed() {
  if (!feedPromise) {
    feedPromise = fetch(FEED_URL, { cache: 'no-store', headers: { accept: 'application/json' } })
      .then(response => {
        if (!response.ok) throw new Error(`case feed ${response.status}`);
        return response.json();
      })
      .then(payload => ({
        cases: Array.isArray(payload.cases) ? payload.cases : [],
        tracking: payload.link_params || FALLBACK_TRACKING,
        generatedOn: payload.generated_on || '',
      }))
      .catch(error => {
        feedPromise = null;
        throw error;
      });
  }
  return feedPromise;
}

export async function similarCases(context, limit = 3) {
  const feed = await loadCaseFeed();
  const ranked = feed.cases
    .map(item => ({ item, match: scoreCase(item, context) }))
    .filter(entry => entry.match)
    .map(entry => ({ item: { ...entry.item, matchReasons: entry.match.reasons }, score: entry.match.score }))
    .sort((a, b) => b.score - a.score || timestamp(b.item.date) - timestamp(a.item.date))
    .slice(0, limit)
    .map(entry => entry.item);
  return { ...feed, cases: ranked };
}

export function trackedCaseUrl(rawUrl, tracking) {
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== 'https:') return '';
    const params = new URLSearchParams(tracking || FALLBACK_TRACKING);
    params.forEach((value, key) => url.searchParams.set(key, value));
    return url.href;
  } catch {
    return '';
  }
}
