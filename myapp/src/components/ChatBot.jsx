import React, { useState, useRef, useEffect } from "react";

// ── OpenRouter config ─────────────────────────────────────────
const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

// System prompt (unchanged)
const SYSTEM_PROMPT = `You are SoulSpace Companion, a warm and empathetic mental health support chatbot.

Your core principles:
- Non-judgemental: Accept all feelings without criticism or evaluation
- Empathetic: Reflect the user's feelings back with genuine care and understanding
- Unconditional Positive Regard (UCPR): Value and respect the person no matter what they share
- Gentle and Warm: Use soft, kind, encouraging language at all times
- You are NOT a therapist or doctor. You provide emotional support, coping strategies, and a safe space to talk.
- Keep responses concise — 2 to 4 sentences. Never lecture or over-explain.
- If someone expresses suicidal thoughts or a crisis, gently encourage them to use the Emergency Support feature in the app or contact a crisis helpline immediately.
- Remember everything said in this conversation and refer back to it naturally when relevant.`;

// Primary and fallback model names
const PRIMARY_MODEL = "openai/gpt-4o-mini";
const FALLBACK_MODEL = "openai/gpt-5.2";

// Default timeout (ms)
const DEFAULT_TIMEOUT_MS = 40000; // 40s

// Helper: perform a single fetch call to OpenRouter with timeout and AbortController
async function fetchOpenRouterReplySingle({ messages, model, timeoutMs = DEFAULT_TIMEOUT_MS }) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers = {
      Authorization: "Bearer " + OPENROUTER_KEY,
      // Optional ranking/meta headers per docs:
      "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "",
      "X-OpenRouter-Title":
        typeof document !== "undefined" ? document.title || "SoulSpace Companion" : "SoulSpace Companion",
      "Content-Type": "application/json",
    };

    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify({ model, messages }),
      signal: controller.signal,
    });

    if (!resp.ok) {
      // Try to parse body for a clearer error message
      let errText = `HTTP ${resp.status}`;
      try {
        const payload = await resp.json();
        if (payload?.error?.message) errText += `: ${payload.error.message}`;
      } catch {
        // ignore parse errors
      }
      const err = new Error(errText);
      err.code = resp.status;
      throw err;
    }

    const data = await resp.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();

    return reply || null;
  } catch (err) {
    // Normalize AbortError to a TIMEOUT error
    if (err.name === "AbortError") {
      const timeoutErr = new Error("TIMEOUT");
      timeoutErr.name = "TIMEOUT";
      throw timeoutErr;
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Helper: try primary model, if it times out or errors, try fallback model once
async function fetchOpenRouterReplyWithFallback({ messages, primary = PRIMARY_MODEL, fallback = FALLBACK_MODEL, timeoutMs = DEFAULT_TIMEOUT_MS }) {
  // Try primary model first
  try {
    const primaryResp = await fetchOpenRouterReplySingle({ messages, model: primary, timeoutMs });
    if (primaryResp) return { text: primaryResp, usedModel: primary, fallbackUsed: false };
    // primary returned empty -> try fallback
    const fallbackResp = await fetchOpenRouterReplySingle({ messages, model: fallback, timeoutMs });
    return { text: fallbackResp, usedModel: fallback, fallbackUsed: true };
  } catch (err) {
    // If primary failed, attempt fallback once (unless fallback was primary)
    if (err?.name === "TIMEOUT" || err?.message?.startsWith("HTTP") || !err?.usedModel) {
      try {
        const fallbackResp = await fetchOpenRouterReplySingle({ messages, model: fallback, timeoutMs });
        return { text: fallbackResp, usedModel: fallback, fallbackUsed: true };
      } catch (fallbackErr) {
        // Both failed
        const combinedErr = new Error(`Primary error: ${err.message}; Fallback error: ${fallbackErr.message}`);
        combinedErr.original = { primary: err, fallback: fallbackErr };
        throw combinedErr;
      }
    }
    // Unknown / non-retryable error -> bubble up
    throw err;
  }
}

// UI constants
const WELCOME_MSG = {
  id: 0,
  role: "assistant",
  text: "Hi there 🌸 I'm here for you. This is a safe, judgement-free space. You can share anything that's on your mind — I'm listening with care and warmth. How are you feeling today?",
};

const SUGGESTIONS = [
  "I'm feeling anxious",
  "I can't sleep well",
  "I'm stressed about work",
  "I feel low and unmotivated",
  "I just need to vent",
];

const ChatBot = ({ user }) => {
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [apiError, setApiError] = useState("");
  // store last user message text for retry
  const [lastUserText, setLastUserText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Main send function (accepts optional text - used for suggestions/retry)
  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText) return;

    // Save last user text for retry
    setLastUserText(userText);

    setShowSuggestions(false);
    setInput("");
    setLoading(true);
    setApiError("");

    const userMsg = { id: Date.now(), role: "user", text: userText };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

    try {
      // Build chat history (skip welcome message with id === 0)
      const chatHistory = updatedMessages
        .filter((m) => m.id !== 0)
        .map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.text,
        }));

      const messagesForApi = [{ role: "system", content: SYSTEM_PROMPT }, ...chatHistory];

      // Primary: GPT-5.2; Fallback: gpt-4o-mini
      const { text: assistantText, usedModel, fallbackUsed } = await fetchOpenRouterReplyWithFallback({
        messages: messagesForApi,
        primary: PRIMARY_MODEL,
        fallback: FALLBACK_MODEL,
        timeoutMs: DEFAULT_TIMEOUT_MS,
      });

      if (!assistantText) {
        throw new Error("Empty response from model");
      }

      // Optionally you can add a subtle note in console that fallback was used
      if (fallbackUsed) {
        console.warn(`Primary model failed; used fallback model: ${usedModel}`);
      }

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", text: assistantText },
      ]);
    } catch (err) {
      console.error("ChatBot error:", err);

      // Detect timeout specifically
      const isTimeout = String(err?.message || "").toUpperCase().includes("TIMEOUT");

      setApiError(
        isTimeout
          ? "Server not reachable (timeout). Please try again."
          : "Couldn't reach the server. Please check your connection."
      );

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: isTimeout
            ? "I’m still here with you 🌸 It looks like the connection took too long. Would you like to try again?"
            : "I'm here with you. Sometimes just putting our feelings into words helps. Is there anything specific you'd like to share?",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Retry the most recent user message
  const retryLast = () => {
    if (!lastUserText) return;
    // Remove any pending assistant placeholder messages we added in previous failure if you want;
    // for simplicity we just call sendMessage again
    sendMessage(lastUserText);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([WELCOME_MSG]);
    setShowSuggestions(true);
    setApiError("");
    setLastUserText("");
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="chat-avatar">🌸</div>
          <div>
            <h3>SoulSpace Companion</h3>
            <span className="chat-status">● Online · Non-judgemental · Empathetic</span>
          </div>
        </div>
        <button className="btn-muted chat-clear-btn" onClick={clearChat}>
          🔄 New Chat
        </button>
      </div>

      {/* Feature Badges */}
      <div className="chat-feature-badges">
        {["Non-judgemental", "Empathetic", "UCPR", "Gentle & Warm"].map((f) => (
          <span key={f} className="chat-badge">✓ {f}</span>
        ))}
      </div>

      {/* API error banner with Retry */}
      {apiError && (
        <div style={{
            background: "#fff3f2",
            color: "#b71c1c",
            fontSize: 13,
            padding: "8px 16px",
            borderBottom: "1px solid #ffd5d5",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
          <div>⚠️ {apiError}</div>
          <div>
            <button
              onClick={retryLast}
              style={{
                marginLeft: 12,
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid #e0b4b4",
                background: "#fff",
                cursor: "pointer",
              }}
              disabled={!lastUserText || loading}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-msg ${msg.role === "user" ? "chat-msg-user" : "chat-msg-bot"}`}
          >
            {msg.role === "assistant" && (
              <span className="chat-msg-avatar">🌸</span>
            )}
            <div className="chat-msg-bubble">
              <p>{msg.text}</p>
            </div>
            {msg.role === "user" && (
              <span className="chat-msg-avatar chat-user-avatar">👤</span>
            )}
          </div>
        ))}

        {loading && (
          <div className="chat-msg chat-msg-bot">
            <span className="chat-msg-avatar">🌸</span>
            <div className="chat-msg-bubble chat-typing" aria-hidden>
              <span /><span /><span />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {showSuggestions && (
        <div className="chat-suggestions">
          <p className="chat-suggestions-label">You might want to say:</p>
          <div className="chat-suggestions-row">
            {SUGGESTIONS.map((s) => (
              <button key={s} className="chat-suggestion-chip" onClick={() => sendMessage(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="chat-input-row">
        <textarea
          className="chat-input"
          rows={2}
          placeholder="Share what's on your mind…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
        />
        <button
          className="btn-primary chat-send-btn"
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
        >
          Send →
        </button>
      </div>

      <p className="chat-disclaimer">
        This chatbot provides emotional support only and is not a substitute for
        professional mental health care. If you are in crisis, please use the
        Emergency Support feature.
      </p>
    </div>
  );
};

export default ChatBot;