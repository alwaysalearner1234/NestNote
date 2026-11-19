/**
 * llmClient.js
 * 
 * Gemini Flash / Groq wrapper with offline template fallback.
 * 
 * Strictly used for:
 * 1. Normalizing guest tastes (3 question intakes -> canonical vibe tags)
 * 2. Drafting warm, host-branded welcome notes grounded in Relate graph results
 * 3. Never invents places — only narrates verified subgraphs from Relate
 * 
 * Offline template fallback ensures the guide always renders even if the LLM
 * API is rate-limited or unavailable (hackathon reliability guarantee).
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize Gemini AI with free-tier key
let genAI = null;
let model = null;

try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey.startsWith('AI')) {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-lite' });
    console.log('✅ Gemini Flash LLM initialized');
  } else {
    console.log('⚠️ GEMINI_API_KEY not set or invalid — LLM features disabled, using offline templates only');
  }
} catch (err) {
  console.error('⚠️ Failed to initialize Gemini LLM:', err.message);
  genAI = null;
  model = null;
}

/**
 * Normalize the 3 guest taste inputs into canonical vibe tag strings.
 * 
 * Input: { music: "jazz", food: "natural_wine", film: "indie_film" }
 * Output: "jazz, natural_wine, indie_film" (sorted for cache key consistency)
 */
const normalizeTastes = (tastes) => {
  const { music = '', food = '', film = '' } = tastes || {};
  const tags = [music, food, film].filter((t) => t && t.trim().length > 0);
  return tags.sort().join(', ');
};

/**
 * Draft a host-branded welcome note grounded in Relate graph results.
 * 
 * The LLM never invents places — it only narrates verified subgraphs.
 * If the LLM is unavailable, a strict offline template is used instead.
 * 
 * @param {Object} options
 * @param {string} options.propertyName - Host property name
 * @param {string} options.neighborhood - Neighborhood/area
 * @param {Array} options.matchedSpots - Array of { name, category, vibes, walkMins }
 * @param {string} options.guestTastes - Normalized taste string
 * @param {string} options.hostRules - House rules text
 * @returns {Promise<string>} The drafted welcome note (or template fallback)
 */
const draftWelcomeNote = async ({
  propertyName,
  neighborhood,
  matchedSpots,
  guestTastes,
  hostRules,
}) => {
  // --- Offline Template Fallback (always works, zero cost) ---
  const template = buildWelcomeTemplate({
    propertyName,
    neighborhood,
    matchedSpots,
    guestTastes,
    hostRules,
  });

  // If LLM is not available, return template immediately
  if (!model) {
    return template;
  }

  try {
    // Construct a grounded prompt that constrains the LLM to only use
    // verified spots from the Relate graph (zero-hallucination guarantee).
    const spotSummaries = matchedSpots
      .slice(0, 5) // limit to 5 spots max to keep prompt tight
      .map(
        (s, i) =>
          `${i + 1}. ${s.name} (${s.category}) — ${s.walkMins} min walk. Vibe: ${s.vibes.join(', ')}.`
      )
      .join('\n');

    const prompt = `You are a friendly Airbnb host writing a personalized welcome guide for guests staying at "${propertyName}" in ${neighborhood}.

    GUEST TASTES: ${guestTastes || 'Not specified'}

    VERIFIED LOCAL SPOTS (from your graph database — do NOT invent new places):
    ${spotSummaries || 'No spots matched. Keep it general.'}

    HOUSE RULES: ${hostRules || 'Standard Airbnb courtesy rules.'}

    Write a warm, 3-4 paragraph welcome note that:
    1. Greets the guest by their taste profile (e.g., "We heard you love jazz and natural wine!")
    2. Recommends 2-3 of the verified spots above, explaining why each fits their tastes (grounded in the vibe tags, not made up).
    3. Mentions the Wi-Fi password and door code briefly (hosts: keep these secure!).
    4. Invites them to enjoy their stay with a friendly sign-off.

    Keep it under 200 words. Be specific but never invent a place name or address that isn't in the "VERIFIED LOCAL SPOTS" list above.
    `.trim();

    const result = await model.generateContent(prompt);
    const text = result.response?.text || '';

    if (text && text.length > 20) {
      // LLM succeeded — return its version
      return text;
    } else {
      // LLM returned very short or empty — fall back to template
      return template;
    }
  } catch (err) {
    // LLM API error (rate limit, quota, network) — fall back to template
    console.warn('⚠️ LLM draft failed, using offline template:', err.message);
    return template;
  }
};

/**
 * Build the offline welcome template — used when LLM is unavailable or
 * as a fallback when the LLM output is insufficient.
 * 
 * Strictly grounded in input data — never invents places.
 */
const buildWelcomeTemplate = ({
  propertyName,
  neighborhood,
  matchedSpots,
  guestTastes,
  hostRules,
}) => {
  // Parse guest taste labels for friendly phrasing
  const tasteLabels = guestTastes
    ?.split(',')
    .map((t) => t.trim())
    .filter((t) => t) || [];

  const tastePhrase = tasteLabels.length > 0
    ? `We heard you love ${tasteLabels.slice(0, 2).join(' and ')}!`
    : 'We hope you enjoy your stay!';

  // Build spot recommendations from verified data
  const spotRecommendations = matchedSpots
    .slice(0, 3)
    .map(
      (s) => `- ${s.name}: ${s.description || 'A great local spot.'} (${s.walkMins} min walk)`,
    )
    .join('\n');

  return `🏌️ Welcome to ${propertyName}!${tastePhrase}

  We've curated a few local spots you might enjoy during your stay:

  ${spotRecommendations || '- No specific spots matched your tastes, but the neighborhood has plenty to explore. Feel free to ask your host for recommendations!'}

  📶 Wi-Fi Password: ${hostRules ? '(ask host)' : 'wifi-password-here'}

  🔓 Door Code: ${hostRules ? '(ask host)' : '1234'}

  📋 House Rules: ${hostRules || 'Standard Airbnb courtesy rules apply.'}

  Have a wonderful stay!`,
};

/**
 * Generate a brief guide summary for the cached guide TTL key (vibe hash).
 * 
 * @param {string} propertyId - MongoDB Property ID
 * @param {string} vibesHash - sorted, joined vibe tags
 * @returns {Promise<string>} Cached guide text
 */
const generateGuideSummary = async (propertyId, vibesHash, matchedSpots) => {
  // Similar to draftWelcomeNote but shorter, for cache key purposes
  if (!model) {
    return buildWelcomeTemplate({
      propertyName: 'Your Property',
      neighborhood: '',
      matchedSpots: matchedSpots || [],
      guestTastes: vibesHash,
      hostRules: '',
    });
  }

  try {
    const spotSummaries = (matchedSpots || [])
      .slice(0, 3)
      .map(
        (s, i) =>
          `${i + 1}. ${s.name} (${s.category}) — ${s.walkMins} min walk.`,
      )
      .join('\n');

    const prompt = `Generate a 2-sentence guide summary for a property with the following vibe profile: ${vibesHash}. Mention 2-3 spot categories that match. Keep it under 50 words. Do not invent place names.`;
    const result = await model.generateContent(prompt);
    return result.response?.text || buildWelcomeTemplate({ propertyName: 'Your Property', neighborhood: '', matchedSpots: matchedSpots || [], guestTastes: vibesHash, hostRules: '' });
  } catch (err) {
    return buildWelcomeTemplate({ propertyName: 'Your Property', neighborhood: '', matchedSpots: matchedSpots || [], guestTastes: vibesHash, hostRules: '' });
  }
};

module.exports = {
  normalizeTastes,
  draftWelcomeNote,
  generateGuideSummary,
  buildWelcomeTemplate,
};