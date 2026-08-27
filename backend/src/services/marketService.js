const supabase = require('../config/supabase');

/**
 * Fetch market prices from database, with optional filters.
 * @param {Object} filters - { state, crop, market, limit }
 * @returns {Promise<Array>} - Market price records
 */
async function getPrices({ state, crop, market, limit = 50 } = {}) {
  let query = supabase
    .from('market_prices')
    .select('*')
    .order('date', { ascending: false })
    .limit(limit);

  if (state) {
    query = query.ilike('state', `%${state}%`);
  }
  if (crop) {
    query = query.ilike('crop_name', `%${crop}%`);
  }
  if (market) {
    query = query.ilike('market_name', `%${market}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Market price fetch error:', error);
    throw new Error('Failed to fetch market prices');
  }

  return data || [];
}

/**
 * Refresh market prices from data.gov.in Agmarknet API.
 * Falls back to generating seed-like data if API is unavailable.
 */
async function refreshPrices() {
  try {
    // Attempt to fetch from data.gov.in (Agmarknet)
    // API: https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070
    const apiUrl = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b&format=json&limit=100';

    const res = await fetch(apiUrl);

    if (res.ok) {
      const json = await res.json();
      const records = json.records || [];

      if (records.length > 0) {
        const rows = records.map((r) => ({
          crop_name: r.commodity || r.Commodity,
          market_name: r.market || r.Market,
          state: r.state || r.State,
          district: r.district || r.District,
          min_price: parseFloat(r.min_price || r.Min_x0020_Price) || null,
          max_price: parseFloat(r.max_price || r.Max_x0020_Price) || null,
          modal_price: parseFloat(r.modal_price || r.Modal_x0020_Price) || null,
          date: r.arrival_date || r.Arrival_Date || new Date().toISOString().split('T')[0],
          source: 'agmarknet',
        }));

        // Upsert into database
        const { error } = await supabase
          .from('market_prices')
          .upsert(rows, {
            onConflict: 'crop_name,market_name,date',
            ignoreDuplicates: false,
          });

        if (error) {
          console.error('Market price upsert error:', error);
        }

        return { success: true, count: rows.length, source: 'agmarknet' };
      }
    }

    // If API fails, generate updated seed data with slight price variations
    return await refreshWithSeedData();
  } catch (error) {
    console.error('Market price refresh error:', error);
    // Fallback to seed data
    return await refreshWithSeedData();
  }
}

/**
 * Fallback: refresh with randomized seed data variations.
 */
async function refreshWithSeedData() {
  const crops = [
    { crop: 'Wheat', market: 'Azadpur Mandi', state: 'Delhi', district: 'New Delhi', base: 2350 },
    { crop: 'Rice (Basmati)', market: 'Azadpur Mandi', state: 'Delhi', district: 'New Delhi', base: 4000 },
    { crop: 'Tomato', market: 'Vashi Market', state: 'Maharashtra', district: 'Mumbai', base: 1800 },
    { crop: 'Onion', market: 'Lasalgaon', state: 'Maharashtra', district: 'Nashik', base: 1100 },
    { crop: 'Potato', market: 'Azadpur Mandi', state: 'Delhi', district: 'New Delhi', base: 1200 },
    { crop: 'Rice', market: 'Koyambedu', state: 'Tamil Nadu', district: 'Chennai', base: 3000 },
    { crop: 'Turmeric', market: 'Erode Market', state: 'Tamil Nadu', district: 'Erode', base: 10000 },
    { crop: 'Soybean', market: 'Indore Mandi', state: 'Madhya Pradesh', district: 'Indore', base: 4500 },
    { crop: 'Cotton', market: 'Rajkot Market', state: 'Gujarat', district: 'Rajkot', base: 6600 },
    { crop: 'Mustard', market: 'Jaipur Mandi', state: 'Rajasthan', district: 'Jaipur', base: 5100 },
    { crop: 'Chilli (Red)', market: 'Guntur Market', state: 'Andhra Pradesh', district: 'Guntur', base: 16000 },
    { crop: 'Maize', market: 'Davangere', state: 'Karnataka', district: 'Davangere', base: 2000 },
  ];

  const today = new Date().toISOString().split('T')[0];
  const rows = crops.map((c) => {
    const variation = 0.95 + Math.random() * 0.10; // ±5%
    const modal = Math.round(c.base * variation);
    return {
      crop_name: c.crop,
      market_name: c.market,
      state: c.state,
      district: c.district,
      min_price: Math.round(modal * 0.9),
      max_price: Math.round(modal * 1.1),
      modal_price: modal,
      date: today,
      source: 'seed',
    };
  });

  const { error } = await supabase
    .from('market_prices')
    .upsert(rows, {
      onConflict: 'crop_name,market_name,date',
      ignoreDuplicates: false,
    });

  if (error) {
    console.error('Seed data upsert error:', error);
  }

  return { success: true, count: rows.length, source: 'seed' };
}

/**
 * Get distinct states from market data.
 */
async function getStates() {
  const { data, error } = await supabase
    .from('market_prices')
    .select('state')
    .order('state');

  if (error) throw new Error('Failed to fetch states');
  return [...new Set((data || []).map((d) => d.state))];
}

/**
 * Get distinct crop names.
 */
async function getCrops() {
  const { data, error } = await supabase
    .from('market_prices')
    .select('crop_name')
    .order('crop_name');

  if (error) throw new Error('Failed to fetch crops');
  return [...new Set((data || []).map((d) => d.crop_name))];
}

module.exports = { getPrices, refreshPrices, getStates, getCrops };
