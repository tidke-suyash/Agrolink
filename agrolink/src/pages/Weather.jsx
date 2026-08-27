import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import {
  Cloud, Sun, CloudRain, Wind, Droplets, Thermometer,
  AlertTriangle, MapPin, CloudSnow, CloudLightning,
  CloudDrizzle, Cloudy, Eye, Gauge, Leaf, RefreshCw,
  Loader2
} from 'lucide-react';

/* ── Defaults ─────────────────────────────────────────────── */
const DEFAULT_LAT = 19.9975;   // Nashik
const DEFAULT_LNG = 73.7898;
const DEFAULT_CITY = 'Nashik, Maharashtra';

/* Map OpenWeather condition names to Lucide icons */
const CONDITION_ICON_MAP = {
  Clear: Sun,
  Clouds: Cloud,
  Rain: CloudRain,
  Drizzle: CloudDrizzle,
  Thunderstorm: CloudLightning,
  Snow: CloudSnow,
  Mist: Cloudy,
  Haze: Cloudy,
  Fog: Cloudy,
  Smoke: Cloudy,
  Dust: Cloudy,
};

function getConditionIcon(condition) {
  return CONDITION_ICON_MAP[condition] || Cloud;
}

/* Day labels: Today, Tomorrow, then weekday names */
const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
function getDayLabel(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  const diff = Math.round((target - today) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return WEEKDAY_NAMES[target.getDay()];
}

/* Farming advice per condition — used when API returns no activity tip */
function farmAdvice(condition, tempMax, humidity) {
  if (condition === 'Rain' || condition === 'Thunderstorm')
    return 'Scattered showers expected. Delay pesticide spraying.';
  if (condition === 'Drizzle')
    return 'Light drizzle expected. Favorable for transplanting.';
  if (tempMax >= 36)
    return 'High evaporation. Schedule evening drip irrigation.';
  if (humidity >= 80)
    return 'High humidity — watch for fungal diseases in crops.';
  if (condition === 'Clear' && tempMax >= 30)
    return 'Full sun. Perfect for drying harvested grains.';
  if (condition === 'Clear')
    return 'Ideal for foliar spray and fertilizer application.';
  return 'Favorable condition for harvesting and weeding.';
}

/* ── Hard-coded fallback (used when API is unreachable) ──── */
function buildFallbackData() {
  const getForecastDayLabel = (offset) => {
    if (offset === 0) return 'Today';
    if (offset === 1) return 'Tomorrow';
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return WEEKDAY_NAMES[d.getDay()];
  };

  return {
    current: {
      temp: 29, feelsLike: 31, humidity: 64,
      windSpeed: 3.9, condition: 'Clouds',
      description: 'partly cloudy', icon: '02d',
      pressure: 1008, visibility: 10000, clouds: 40,
    },
    location: { name: 'Nashik', country: 'IN' },
    forecast: [
      { date: new Date().toISOString().split('T')[0], tempMax: 31, tempMin: 22, condition: 'Clear', humidity: 55 },
      { date: (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; })(), tempMax: 28, tempMin: 21, condition: 'Rain', humidity: 75 },
      { date: (() => { const d = new Date(); d.setDate(d.getDate() + 2); return d.toISOString().split('T')[0]; })(), tempMax: 29, tempMin: 20, condition: 'Clouds', humidity: 60 },
      { date: (() => { const d = new Date(); d.setDate(d.getDate() + 3); return d.toISOString().split('T')[0]; })(), tempMax: 32, tempMin: 23, condition: 'Clear', humidity: 45 },
      { date: (() => { const d = new Date(); d.setDate(d.getDate() + 4); return d.toISOString().split('T')[0]; })(), tempMax: 33, tempMin: 23, condition: 'Clear', humidity: 40 },
    ],
    farming: [],
    fetchedAt: new Date().toISOString(),
  };
}

/* ════════════════════════════════════════════════════════════ */
export default function Weather() {
  const { token } = useAuth();

  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [city, setCity] = useState(DEFAULT_CITY);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  /* Fetch weather from backend */
  const fetchWeather = useCallback(async (lat, lng) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get(`/weather?lat=${lat}&lng=${lng}`, token);
      if (data?.weather) {
        setWeather(data.weather);
        setIsLive(true);
        const loc = data.weather.location;
        if (loc?.name) {
          setCity(`${loc.name}${loc.country ? ', ' + loc.country : ''}`);
        }
        if (data.weather.fetchedAt) {
          setLastUpdated(
            new Date(data.weather.fetchedAt).toLocaleString('en-IN', {
              day: '2-digit', month: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit', hour12: true,
            })
          );
        }
      } else {
        throw new Error('Empty response');
      }
    } catch (err) {
      console.warn('Weather API unavailable, using fallback data:', err?.message);
      const fallback = buildFallbackData();
      setWeather(fallback);
      setIsLive(false);
      setLastUpdated(
        new Date().toLocaleString('en-IN', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit', hour12: true,
        })
      );
      setError('Weather API unavailable — showing cached demo data');
    } finally {
      setLoading(false);
    }
  }, [token]);

  /* On mount: try geolocation, fallback to Nashik coords */
  useEffect(() => {
    if (!token) return;

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(DEFAULT_LAT, DEFAULT_LNG),
        { timeout: 5000 }
      );
    } else {
      fetchWeather(DEFAULT_LAT, DEFAULT_LNG);
    }
  }, [token, fetchWeather]);

  /* ── Derived values ───────────────────────────────────────── */
  const cur = weather?.current || {};
  const forecast = weather?.forecast || [];
  const alerts = weather?.farming || [];
  const ConditionIcon = getConditionIcon(cur.condition);

  /* Generate an advisory note from alerts or a sensible default */
  const advisoryNote = alerts.length > 0
    ? alerts[0].message
    : 'Light showers anticipated tomorrow evening. Ensure active drainage channels in low-lying vegetable plots to prevent waterlogging.';

  /* ── Render ───────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 animate-fade-in">
        <Loader2 size={36} className="text-[#7c9b85] animate-spin" />
        <p className="text-sm text-gray-500">Loading weather intelligence…</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex flex-col items-center text-center gap-6 max-w-5xl mx-auto w-full pb-10">
      {/* ── Page Header ──────────────────────────────────── */}
      <div className="flex flex-col items-center text-center gap-2">
        <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#4f6b58]/15 text-[#2c4033] border border-[#4f6b58]/30 mx-auto">
          <Leaf size={28} />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-950 font-heading">
          Detailed Weather Intelligence
        </h1>

        <div>
          <h2 className="text-base font-bold text-gray-900 font-heading">
            Agricultural Weather Intelligence
          </h2>
          <p className="text-sm font-medium text-gray-800">
            Localized hyper-local microclimate alerts for farming operations.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mt-1 text-sm font-bold text-gray-900">
          <MapPin size={16} className="text-[#2c4033]" />
          <span className="font-bold text-gray-950">{city}</span>
          <button
            onClick={() => fetchWeather(DEFAULT_LAT, DEFAULT_LNG)}
            className="p-1 text-gray-700 hover:text-black transition"
            title="Refresh weather"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* ── API status warning ───────────────────────────── */}
      {error && (
        <div className="p-3 bg-[#faf3e4] border border-[#efd9a8] text-gray-950 text-xs font-semibold flex items-center justify-center gap-2 max-w-2xl mx-auto w-full">
          <AlertTriangle size={16} className="shrink-0 text-amber-700" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Main Weather Card ────────────────────────────── */}
      <div className="max-w-2xl mx-auto w-full flex flex-col items-center text-center gap-4">
        {/* Big temperature display */}
        <div className="flex items-center justify-center gap-5">
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 shrink-0">
            <ConditionIcon size={54} className="text-amber-600" />
          </div>
          <div className="text-left">
            <div className="text-5xl font-black font-heading tracking-tight text-gray-950">
              {cur.temp ?? '--'}°C
            </div>
            <div className="text-lg font-bold text-gray-900 capitalize">
              {cur.description || cur.condition || 'N/A'}
            </div>
            <div className="text-xs font-semibold text-gray-700 mt-0.5">
              Updated at: {lastUpdated || 'N/A'}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full mt-2">
          <div className="flex flex-col items-center justify-center text-center gap-1 p-3 bg-white border border-gray-300 rounded-xl shadow-xs">
            <Thermometer size={20} className="text-amber-700" />
            <span className="text-xs font-bold text-gray-800">Feels Like</span>
            <span className="font-extrabold text-base font-mono text-gray-950">
              {cur.feelsLike ?? cur.temp ?? '--'}°C
            </span>
          </div>
          <div className="flex flex-col items-center justify-center text-center gap-1 p-3 bg-white border border-gray-300 rounded-xl shadow-xs">
            <Wind size={20} className="text-[#2c4033]" />
            <span className="text-xs font-bold text-gray-800">Wind Speed</span>
            <span className="font-extrabold text-base font-mono text-gray-950">
              {cur.windSpeed != null ? `${(cur.windSpeed * 3.6).toFixed(1)} km/h` : '--'}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center text-center gap-1 p-3 bg-white border border-gray-300 rounded-xl shadow-xs">
            <Droplets size={20} className="text-blue-700" />
            <span className="text-xs font-bold text-gray-800">Humidity</span>
            <span className="font-extrabold text-base font-mono text-gray-950">
              {cur.humidity ?? '--'} %
            </span>
          </div>
          <div className="flex flex-col items-center justify-center text-center gap-1 p-3 bg-white border border-gray-300 rounded-xl shadow-xs">
            <Eye size={20} className="text-purple-700" />
            <span className="text-xs font-bold text-gray-800">Visibility</span>
            <span className="font-extrabold text-base font-mono text-gray-950">
              {cur.visibility != null ? `${(cur.visibility / 1000).toFixed(1)} km` : '--'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Advisory Alert Banner (Centered) ─────────────── */}
      <div className="p-4 bg-[#fef9c3] border-2 border-amber-400 rounded-xl flex items-center justify-center gap-3 text-gray-950 shadow-sm max-w-4xl w-full mx-auto text-center">
        <AlertTriangle size={22} className="shrink-0 text-amber-700" />
        <div className="text-sm leading-relaxed text-gray-950">
          <strong className="font-extrabold text-black">Agricultural Advisory Note:</strong>{' '}
          <span className="font-semibold text-gray-900">{advisoryNote}</span>
        </div>
      </div>

      {/* ── 5-Day Farming Forecast (Centered) ────────────── */}
      <div className="glass p-6 rounded-2xl flex flex-col gap-4 border border-gray-300 max-w-5xl w-full mx-auto">
        <h3 className="text-lg font-bold text-gray-950 font-heading mb-1 text-center">
          5-Day Agro Forecast &amp; Activity Planner
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 w-full">
          {forecast.slice(0, 5).map((f, i) => {
            const FIcon = getConditionIcon(f.condition);
            const dayLabel = getDayLabel(f.date);
            const advice = farmAdvice(f.condition, f.tempMax, f.humidity);

            return (
              <div
                key={i}
                className="p-4 bg-white border-2 border-gray-200 rounded-xl flex flex-col items-center text-center gap-2 shadow-sm hover:shadow-md transition hover:border-gray-400"
              >
                <span className="font-bold text-sm text-gray-950">{dayLabel}</span>
                <FIcon size={30} className="text-[#2c4033] my-1" />
                <span className="font-mono font-extrabold text-sm text-gray-950">
                  {f.tempMax}° / {f.tempMin}°
                </span>
                <span className="text-xs text-blue-900 font-bold">
                  🌧 {f.humidity}%
                </span>
                <p className="text-xs font-medium text-gray-900 mt-2 leading-relaxed border-t border-gray-200 pt-2" style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                  {advice}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Live / Offline badge ─────────────────────────── */}
      <div className="flex justify-center">
        <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${isLive ? 'bg-[#2c4033] text-white' : 'bg-gray-300 text-gray-800'}`}>
          {isLive ? '● Live Weather Intelligence Active' : '○ Demo / Cached Microclimate'}
        </span>
      </div>
    </div>
  );
}
