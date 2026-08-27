import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import {
  Bot, Send, Plus, Trash2, Sparkles, MessageSquare,
  Sprout, Bug, TrendingUp, Droplet, Copy, Check,
  PanelLeftClose, PanelLeft, Stethoscope, X, AlertCircle,
  RefreshCw, Image as ImageIcon,
  Atom, SquarePen, FileText, Activity
} from 'lucide-react';
import './AiAssistant.css';

const QUICK_PROMPTS = [
  {
    icon: Atom,
    title: 'Crop Nutrition',
    desc: 'Optimized plans',
    label: 'Formulated Plan',
    prompt: 'What is the optimal NPK fertilizer dosage and application schedule for Wheat crop in sandy-loam soil during winter season?',
  },
  {
    icon: Bug,
    title: 'Pathogen Guard',
    desc: 'Risk detection',
    label: 'Analysis Complete',
    prompt: 'My tomato plant leaves are turning yellow with brown spots along the edges and curling upward. What disease is this and how can I treat it organically and chemically?',
  },
  {
    icon: TrendingUp,
    title: 'Price Optimizer',
    desc: 'Market intelligence',
    label: 'Mandi Trend Updated',
    prompt: 'What are the current market trends and expected price movements for Onion and Soybean in Maharashtra mandis over the next 4 weeks?',
  },
  {
    icon: Droplet,
    title: 'Smart Water',
    desc: 'Precision scheduling',
    label: 'Irrigation Alert (Dryness Detected)',
    prompt: 'How many liters of water per acre should I provide for Cotton during flowering stage in semi-arid climate with drip irrigation?',
  },
];

function formatMarkdown(content) {
  if (!content) return '';
  const lines = content.split('\n');
  const elements = [];

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('### ')) {
      elements.push(<h3 key={idx}>{trimmed.replace('### ', '')}</h3>);
    } else if (trimmed.startsWith('## ')) {
      elements.push(<h2 key={idx}>{trimmed.replace('## ', '')}</h2>);
    } else if (trimmed.startsWith('# ')) {
      elements.push(<h1 key={idx}>{trimmed.replace('# ', '')}</h1>);
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <li key={idx} dangerouslySetInnerHTML={{ __html: parseBold(trimmed.substring(2)) }} />
      );
    } else if (/^\d+\.\s/.test(trimmed)) {
      elements.push(
        <li key={idx} dangerouslySetInnerHTML={{ __html: parseBold(trimmed.replace(/^\d+\.\s/, '')) }} />
      );
    } else if (trimmed.startsWith('> ')) {
      elements.push(
        <blockquote key={idx}>{trimmed.replace('> ', '')}</blockquote>
      );
    } else if (trimmed.length > 0) {
      elements.push(
        <p key={idx} dangerouslySetInnerHTML={{ __html: parseBold(trimmed) }} />
      );
    }
  });

  return elements;
}

function parseBold(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

export default function AiAssistant() {
  const { token, user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [history, setHistory] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [error, setError] = useState('');
  const [activityLog, setActivityLog] = useState([]);

  const pushActivity = (text) => {
    setActivityLog((prev) => [{ text, time: new Date().toISOString() }, ...prev].slice(0, 12));
  };

  // Crop Doctor Modal State
  const [doctorModal, setDoctorModal] = useState(false);
  const [doctorForm, setDoctorForm] = useState({
    crop: '',
    location: 'Maharashtra, India',
    season: 'Monsoon Season (June - Oct)',
    soilType: 'Black Soil (Regur)',
    issue: '',
  });

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, [token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadHistory = async () => {
    if (!token) return;
    try {
      const data = await api.get('/ai/history', token);
      setHistory(data.chats || []);
    } catch (err) {
      console.warn('Could not load chat history:', err);
    }
  };

  const handleSelectChat = async (id) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get(`/ai/chat/${id}`, token);
      if (data.chat) {
        setChatId(data.chat.id);
        setMessages(data.chat.messages || []);
      }
    } catch (err) {
      setError('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setChatId(null);
    setMessages([]);
    setSelectedImage(null);
    setImagePreview(null);
    setError('');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleDeleteChat = async (e, id) => {
    e.stopPropagation();
    try {
      await api.delete(`/ai/chat/${id}`, token);
      setHistory((prev) => prev.filter((c) => c.id !== id));
      if (chatId === id) {
        handleNewChat();
      }
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  };

  // Image Upload Handler
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, JPEG, WEBP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result);
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async (textToSend, imgToSend) => {
    const messageText = textToSend !== undefined ? textToSend : input.trim();
    const currentImg = imgToSend !== undefined ? imgToSend : selectedImage;

    if (!messageText && !currentImg) return;
    if (loading) return;

    setInput('');
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setError('');

    // User Message
    const userMsg = {
      role: 'user',
      content: messageText || 'Attached Crop Photo for Diagnosis',
      image: currentImg,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const matchedQuickPrompt = QUICK_PROMPTS.find((q) => q.prompt === messageText);
    pushActivity(
      matchedQuickPrompt ? `Checking ${matchedQuickPrompt.title}` : (currentImg ? 'Analyzing Crop Photo' : 'Processing Objective')
    );

    try {
      const data = await api.post(
        '/ai/chat',
        { message: messageText, chat_id: chatId, image: currentImg },
        token
      );

      const assistantMsg = {
        role: 'assistant',
        content: data.response || 'No response received.',
        live: data.live !== false,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      pushActivity(matchedQuickPrompt ? matchedQuickPrompt.label : 'Analysis Complete');
      if (data.chat_id) {
        setChatId(data.chat_id);
        loadHistory();
      }
    } catch (err) {
      console.error('AI chat error:', err);
      setError('Connection interrupted. Please try again.');
      pushActivity('Task Failed — Connection Error');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopy = (content, index) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCropDoctorSubmit = async (e) => {
    e.preventDefault();
    setDoctorModal(false);

    const structuredQuery = `[CROP DOCTOR DIAGNOSIS REQUEST]
Crop: ${doctorForm.crop}
Location: ${doctorForm.location}
Season: ${doctorForm.season}
Soil: ${doctorForm.soilType}
Symptoms/Issue: ${doctorForm.issue}`;

    await handleSendMessage(structuredQuery, selectedImage);
  };

  return (
    <div className="ai-container">
      {/* ─── Sidebar: Agent Activity ───────────────────── */}
      <aside className={`ai-sidebar ${!sidebarOpen ? 'collapsed' : ''}`}>
        <div className="ai-sidebar-header ai-sidebar-header--console">
          <h2 className="ai-sidebar-title">Agent Activity</h2>
          <button className="ai-new-chat-icon" onClick={handleNewChat} title="New consultation">
            <Plus size={16} />
          </button>
        </div>

        <div className="ai-history-list">
          {activityLog.length === 0 && history.length === 0 ? (
            <div className="ai-activity-empty">
              Agent is idle. Execute a goal below or run a quick action to see live activity here.
            </div>
          ) : (
            <>
              {activityLog.map((a, idx) => (
                <div key={`live-${idx}`} className="ai-activity-item">
                  {a.text}
                </div>
              ))}
              {history.map((chat) => (
                <div
                  key={chat.id}
                  className={`ai-history-item ${chatId === chat.id ? 'active' : ''}`}
                  onClick={() => handleSelectChat(chat.id)}
                >
                  <MessageSquare size={14} className="shrink-0 opacity-70" />
                  <span className="ai-history-title">{chat.title || 'Crop Consultation'}</span>
                  <button
                    className="ai-history-delete"
                    title="Delete chat"
                    onClick={(e) => handleDeleteChat(e, chat.id)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="ai-sidebar-footer">
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles size={13} className="text-[#94b09c]" />
            <span>Gemini 1.5</span>
          </span>
          <span className="text-[10px] bg-[#4f6b58] text-[#c4d9c8] px-2 py-0.5 rounded-full font-bold">
            Live
          </span>
        </div>
      </aside>

      {/* ─── Main Console ──────────────────────────────── */}
      <section className="ai-main">
        {/* Top bar */}
        <div className="ai-topbar ai-topbar--console">
          <div className="ai-topbar-left">
            <button
              className="ai-toggle-sidebar-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
            </button>
            <h1 className="ai-console-title">AgroLink Agent Console</h1>
          </div>

          <div className="ai-topbar-actions">
            <button
              className="btn-crop-doctor"
              onClick={() => setDoctorModal(true)}
            >
              <SquarePen size={15} />
              <span>Manage Goals</span>
            </button>

            {messages.length > 0 && (
              <button
                className="ai-toggle-sidebar-btn"
                onClick={handleNewChat}
                title="Clear current conversation"
              >
                <RefreshCw size={15} />
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-3 p-3 bg-[#faeae8] border border-[#e8c2ba] text-[#c97b71] rounded-lg text-xs flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* Messages Stream */}
        <div className="ai-messages-wrapper">
          {messages.length === 0 ? (
            <div className="ai-empty-state ai-empty-state--console">
              <div className="ai-hexgrid">
                <div className="ai-hexgrid-lines" aria-hidden="true">
                  <span className="ai-hex-dot ai-hex-dot--top" />
                  <span className="ai-hex-dot ai-hex-dot--center" />
                  <span className="ai-hex-dot ai-hex-dot--bottom" />
                  <span className="ai-hex-line ai-hex-line--v" />
                  <span className="ai-hex-line ai-hex-line--h" />
                </div>

                {QUICK_PROMPTS.map((item, idx) => (
                  <div
                    key={idx}
                    className="ai-hex-card"
                    onClick={() => handleSendMessage(item.prompt)}
                  >
                    <div className="ai-hex-card-icon">
                      <item.icon size={22} />
                    </div>
                    <div>
                      <div className="ai-hex-card-title">{item.title}</div>
                      <div className="ai-hex-card-desc">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`ai-message ${msg.role}`}>
                <div className="ai-message-avatar">
                  {msg.role === 'assistant' ? <Bot size={20} /> : user?.name?.[0] || 'U'}
                </div>

                <div className="ai-message-body">
                  {msg.image && (
                    <div className="mb-2 max-w-xs rounded-lg overflow-hidden border border-[#c4d9c8] shadow-sm">
                      <img src={msg.image} alt="Crop Photo" className="w-full h-auto object-cover" />
                    </div>
                  )}

                  {msg.role === 'assistant' && msg.live === false && (
                    <div className="ai-offline-badge">
                      <AlertCircle size={12} />
                      <span>Offline guidance — live AI unavailable, check backend terminal logs</span>
                    </div>
                  )}

                  <div className="ai-message-bubble">
                    {msg.role === 'assistant'
                      ? formatMarkdown(msg.content)
                      : msg.content}
                  </div>

                  <div className="ai-message-meta">
                    <span>
                      {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {msg.role === 'assistant' && (
                      <button
                        className="ai-action-btn"
                        onClick={() => handleCopy(msg.content, idx)}
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check size={12} className="text-[#7c9b85]" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="ai-message assistant">
              <div className="ai-message-avatar">
                <Bot size={20} />
              </div>
              <div className="ai-typing-indicator">
                <div className="ai-typing-dot" />
                <div className="ai-typing-dot" />
                <div className="ai-typing-dot" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Floating Prompt Input */}
        <div className="ai-input-wrapper">
          {/* Image Thumbnail Preview */}
          {imagePreview && (
            <div className="max-w-[860px] mx-auto mb-2 flex items-center gap-3 p-2 bg-[#f6faf7] border border-[#c4d9c8] rounded-xl">
              <img
                src={imagePreview}
                alt="Selected preview"
                className="w-12 h-12 object-cover rounded-lg border border-[#c4d9c8]"
              />
              <div className="flex-1 text-xs text-[#4f6b58]">
                <span className="font-bold">Leaf / Crop Photo Attached</span>
                <p className="text-[11px] text-[#7c9b85]">AI will analyze this image for disease and pest diagnosis.</p>
              </div>
              <button
                type="button"
                onClick={removeSelectedImage}
                className="p-1 rounded-full text-[#4f6b58] hover:bg-[#c4d9c8] transition"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="ai-input-box">
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />

            {/* Photo upload trigger */}
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-[#4f6b58] hover:bg-[#f6faf7] rounded-lg transition"
              onClick={() => fileInputRef.current?.click()}
              title="Upload plant or leaf photo for visual diagnosis"
            >
              <ImageIcon size={18} />
            </button>

            <button
              type="button"
              className="p-2 text-gray-500 hover:text-[#4f6b58] hover:bg-[#f6faf7] rounded-lg transition"
              onClick={() => setDoctorModal(true)}
              title="Attach structured objective / report"
            >
              <FileText size={18} />
            </button>

            <textarea
              ref={textareaRef}
              className="ai-textarea"
              placeholder="State objective, query context, or describe an issue..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />

            <button
              className="ai-execute-btn"
              disabled={loading || (!input.trim() && !selectedImage)}
              onClick={() => handleSendMessage()}
              title="Send to AI"
            >
              <span>Execute Goal</span>
              <Send size={14} />
            </button>
          </div>
          <p className="ai-disclaimer">
            AgroLink AI provides actionable crop advisories. Always verify chemical dosages with local agriculture experts.
          </p>
        </div>

        {/* Status Bar */}
        <div className="ai-status-bar">
          <span className="ai-status-item">
            <span className="ai-status-dot" />
            System Health: <strong>Nominal</strong>
          </span>
          <span className="ai-status-item">
            <Activity size={12} />
            Tasks in Progress: <strong>{loading ? 1 : 0}</strong>
          </span>
        </div>
      </section>

      {/* ─── Crop Doctor Diagnostic Modal ──────────────── */}
      {doctorModal && (
        <div className="crop-doctor-overlay" onClick={() => setDoctorModal(false)}>
          <div className="crop-doctor-modal" onClick={(e) => e.stopPropagation()}>
            <div className="crop-doctor-header">
              <div className="flex items-center gap-2">
                <Stethoscope size={20} />
                <h3 className="font-bold text-lg">Crop Doctor Diagnostic Tool</h3>
              </div>
              <button
                className="text-white/80 hover:text-white"
                onClick={() => setDoctorModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCropDoctorSubmit} className="crop-doctor-body">
              <div className="input-group">
                <label className="input-label">Crop Name *</label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="e.g. Cotton, Tomato, Wheat, Sugarcane, Onion"
                  value={doctorForm.crop}
                  onChange={(e) =>
                    setDoctorForm({ ...doctorForm, crop: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="input-group">
                  <label className="input-label">Location / State</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={doctorForm.location}
                    onChange={(e) =>
                      setDoctorForm({ ...doctorForm, location: e.target.value })
                    }
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Farming Season</label>
                  <select
                    className="input w-full"
                    value={doctorForm.season}
                    onChange={(e) =>
                      setDoctorForm({ ...doctorForm, season: e.target.value })
                    }
                  >
                    <option value="Monsoon Season (June - October)">Monsoon Season (June - Oct)</option>
                    <option value="Winter Season (November - March)">Winter Season (Nov - Mar)</option>
                    <option value="Summer Season (April - June)">Summer Season (Apr - Jun)</option>
                    <option value="Year-Round / Perennial">Year-Round / Perennial</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Observed Symptoms / Problem *</label>
                <textarea
                  className="input w-full"
                  rows={3}
                  placeholder="Describe leaf yellowing, brown spots, leaf curl, insects, wilting, or stunted growth..."
                  value={doctorForm.issue}
                  onChange={(e) =>
                    setDoctorForm({ ...doctorForm, issue: e.target.value })
                  }
                  required
                />
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setDoctorModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Sparkles size={16} />
                  <span>Generate Full Diagnosis</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
