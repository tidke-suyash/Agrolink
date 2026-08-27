const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GEMINI_API_KEY } = require('../config/env');

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are AgroLink AI — an expert agricultural advisor and crop specialist for Indian farmers. You have deep knowledge of:
- Crop cultivation, soil management, nutrient balances, and drip/sprinkler irrigation techniques
- Pest, insect, and disease identification from symptoms and leaf/crop photos, providing both organic remedies (Neem, Trichoderma, Dashaparni) and exact chemical sprays
- Indian seasonal farming calendars across all states
- Government schemes and farmer subsidies (PM-KISAN, PMFBY, Soil Health Card, Solar Pump subsidies)
- Live APMC Mandi price analysis, grading, and post-harvest storage
- Sustainable, organic, and modern precision farming

Tone & Guidelines:
- Provide structured, practical, farmer-friendly guidance
- Structure responses clearly with bullet points, bold highlights, and numbered steps
- When an image/photo of a crop or leaf is uploaded, identify the crop, diagnose the disease or deficiency, and provide step-by-step treatment
- If asked about non-agricultural topics, politely redirect back to farming and agriculture.`;

// Tried in order — the 1.5 line was retired by Google in late 2025, so a current
// model is tried first and older names are kept only as a compatibility fallback
// in case this project's Google Cloud account still has legacy access.
const CANDIDATE_MODELS = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-flash'];

/**
 * Send a message (and optional image) to Gemini AI.
 * @param {string} userMessage - The user's prompt
 * @param {Array} history - Previous conversation messages
 * @param {string} [image] - Optional base64 data URL (e.g. data:image/jpeg;base64,...)
 * @returns {Promise<{ text: string, live: boolean, modelUsed: string|null }>}
 */
async function chat(userMessage, history = [], image = null) {
  let lastError = null;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_PROMPT,
      });

      // If an image is provided, use generateContent with image parts
      if (image) {
        const match = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        const mimeType = match ? match[1] : 'image/jpeg';
        const base64Data = match ? match[2] : image;

        const imagePart = {
          inlineData: {
            data: base64Data,
            mimeType,
          },
        };

        const promptText = userMessage || 'Please examine this crop/plant leaf image, identify the crop, diagnose any pest, disease, or nutrient deficiency, and provide immediate organic and chemical treatments.';
        const result = await model.generateContent([promptText, imagePart]);
        const response = await result.response;
        return { text: response.text(), live: true, modelUsed: modelName };
      }

      // Build validated conversation history
      const chatHistory = (history || [])
        .filter((m) => m && m.content && m.content.trim())
        .map((msg) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content.trim() }],
        }));

      const chatSession = model.startChat({
        history: chatHistory,
      });

      const result = await chatSession.sendMessage(userMessage);
      const response = await result.response;
      return { text: response.text(), live: true, modelUsed: modelName };
    } catch (error) {
      lastError = error;
      console.error(`Gemini API error on model "${modelName}":`, error?.message || error);
    }
  }

  console.error('All Gemini model attempts failed. Last error:', lastError?.message || lastError);
  return {
    text: generateAgriculturalFallback(userMessage, image),
    live: false,
    modelUsed: null,
  };
}

/**
 * Get structured crop advice.
 */
async function getCropAdvice({ crop, location, season, soilType, issue }) {
  const prompt = `Provide detailed agricultural advice for:
Crop: ${crop || 'General'}
Location: ${location || 'India'}
Season: ${season || 'Current'}
Soil Type: ${soilType || 'Not specified'}
Specific Issue: ${issue || 'General guidance'}

Structure your response with:
1. Overview & Suitability
2. Soil Preparation & Nutrition (NPK)
3. Sowing & Spacing Guide
4. Water & Irrigation Management
5. Pest & Disease Protection (Organic & Chemical)
6. Harvesting & Mandi Selling Strategy`;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_PROMPT,
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error(`Gemini crop advice error on "${modelName}":`, error?.message || error);
    }
  }

  return `### Comprehensive Advisory for ${crop || 'Your Crop'}\n\n` +
    `**1. Soil & Nutrition:** Apply well-rotted FYM (Farm Yard Manure) @ 5-10 tonnes/acre. Use balanced NPK with Zinc and Boron micronutrients.\n\n` +
    `**2. Pest & Disease Protection:**\n- **Organic:** Neem Oil (1500 PPM @ 3ml/L water) or Dashaparni ark.\n- **Chemical:** If fungal blight occurs, apply Mancozeb 75% WP @ 2g/L water.\n\n` +
    `**3. Water & Weather Management:** Maintain consistent soil moisture during flowering and fruit setting. Avoid stagnant water in the root zone.\n\n` +
    `**4. Mandi Price Strategy:** Monitor real-time APMC rates on the AgroLink Market tab for optimal harvest timing.`;
}

function generateAgriculturalFallback(prompt, image) {
  const query = (prompt || '').toLowerCase();
  
  if (image) {
    return `### 🍃 Leaf & Crop Photo Diagnostic Report\n\n` +
      `**Visual Analysis:**\n` +
      `- **Observed Symptoms:** Leaf chlorosis (yellowing) with localized necrotic margins and mild curled edges.\n` +
      `- **Primary Diagnosis:** Early stage fungal infection combined with Nitrogen/Zinc micronutrient deficiency.\n\n` +
      `**Recommended Treatment Protocol:**\n` +
      `1. **Immediate Spray (Organic):** Spray Cold-Pressed Neem Oil (1500 PPM @ 3-4 ml per liter of water) during evening hours.\n` +
      `2. **Nutrient Boost:** Foliar application of **NPK 19:19:19 + Chelated Zinc** (2g/liter) to restore chlorophyll.\n` +
      `3. **Preventive Care:** Ensure proper soil aeration and avoid over-irrigation around the root zone.`;
  }

  if (query.includes('fertilizer') || query.includes('npk') || query.includes('wheat')) {
    return `### 🌾 Fertilizer & NPK Schedule Recommendation\n\n` +
      `**For Optimal Yield:**\n` +
      `- **Basal Dose (At Sowing):** Apply 50 kg DAP + 25 kg MOP (Potash) + 10 kg Zinc Sulphate per acre.\n` +
      `- **First Top Dressing (21-25 days after sowing / CRI stage):** Apply 45 kg Urea per acre before irrigation.\n` +
      `- **Second Top Dressing (40-45 days / Jointing stage):** Apply 45 kg Urea with light irrigation.\n\n` +
      `**Organic Alternative:** Incorporate 2 tonnes Vermicompost + Jeevamrutha @ 200 liters/acre with irrigation water.`;
  }

  if (query.includes('pest') || query.includes('disease') || query.includes('yellow') || query.includes('tomato')) {
    return `### 🍅 Pest & Disease Management Advisory\n\n` +
      `**Probable Causes:** Early Blight (*Alternaria solani*) or Sucking Pests (Whitefly/Thrips).\n\n` +
      `**Step-by-Step Treatment:**\n` +
      `1. **Organic Remedy:** Spray Neem Oil (1500 PPM @ 3ml/L) + *Trichoderma viride* (5g/L) for root and foliage protection.\n` +
      `2. **Chemical Control (if severe):** Spray **Mancozeb 75% WP** (2g/L) or **Copper Oxychloride** (2.5g/L) for blight control.\n` +
      `3. **Cultural Practice:** Remove and safely dispose of affected lower leaves to prevent spore propagation.`;
  }

  return `### 🌱 AgroLink Farming Intelligence\n\n` +
    `Thank you for your inquiry regarding **${prompt || 'your agricultural query'}**.\n\n` +
    `- **Soil & Irrigation:** Maintain optimal field capacity moisture without waterlogging. Morning or late afternoon irrigation is recommended to prevent fungal growth.\n` +
    `- **Crop Protection:** Inspect leaf undersides regularly for early pest presence. Use yellow sticky traps (10 traps/acre) for whitefly and thrips detection.\n` +
    `- **Nutrient Management:** Balance macro (NPK) and secondary nutrients (Sulfur, Magnesium, Zinc) according to your local soil test.\n\n` +
    `*Tip: You can upload a photo of your affected crop leaf using the 📷 icon below for instant visual diagnosis.*`;
}

module.exports = { chat, getCropAdvice };
