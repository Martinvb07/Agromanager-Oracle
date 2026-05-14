import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { enviarMensajeChat, fetchAlertas } from '../services/api.js';

/** Separa las sugerencias (• ...) del cuerpo principal de la respuesta del bot. */
function parseBotMessage(content) {
  const idx = content.lastIndexOf('\n\n💡');
  if (idx === -1) return { answer: content, suggestions: [] };
  const answer = content.slice(0, idx);
  const rest = content.slice(idx);
  const suggestions = rest
    .split('\n')
    .filter(l => l.trim().startsWith('•'))
    .map(l => l.replace(/^[•\s]+/, '').trim())
    .filter(Boolean);
  return { answer, suggestions };
}

/** Renderiza una línea con soporte de **negrita** e *cursiva*. */
function renderLine(line) {
  const boldParts = line.split(/\*\*(.*?)\*\*/g);
  return boldParts.map((part, i) => {
    if (i % 2 === 1) return <strong key={i}>{part}</strong>;
    const italicParts = part.split(/\*(.*?)\*/g);
    return italicParts.map((ip, j) =>
      j % 2 === 1 ? <em key={j}>{ip}</em> : ip
    );
  });
}

/** Renderiza contenido multilínea con markdown básico. */
function renderContent(content) {
  return content.split('\n').map((line, i, arr) => (
    <span key={i}>
      {renderLine(line)}
      {i < arr.length - 1 && <br />}
    </span>
  ));
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        '¡Hola! Soy AgroBot, tu asistente en AgroManager. Puedo ayudarte con plagas, riego, fertilización, maquinaria, campañas, finanzas y más. ¿En qué te puedo ayudar?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Cargar badge de alertas al montar
  useEffect(() => {
    fetchAlertas()
      .then(data => setAlertCount(Array.isArray(data) ? data.length : 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg = { role: 'user', content: trimmed };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setSuggestions([]);
    setLoading(true);

    try {
      const chatHistory = updated
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .slice(-20);

      const data = await enviarMensajeChat({ messages: chatHistory });
      const raw = data?.answer || 'No se recibió respuesta.';
      const { answer, suggestions: newSuggestions } = parseBotMessage(raw);

      setMessages(prev => [...prev, { role: 'assistant', content: answer }]);
      setSuggestions(newSuggestions);

      // Actualizar badge tras cada mensaje
      fetchAlertas()
        .then(d => setAlertCount(Array.isArray(d) ? d.length : 0))
        .catch(() => {});
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Lo siento, hubo un error al procesar tu mensaje. Intenta de nuevo.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => sendMessage(input);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Botón flotante con badge de alertas */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="chatbot-fab"
          aria-label="Abrir chat"
        >
          <MessageCircle size={26} />
          {alertCount > 0 && (
            <span className="chatbot-badge">{alertCount > 9 ? '9+' : alertCount}</span>
          )}
        </button>
      )}

      {/* Ventana de chat */}
      {open && (
        <div className="chatbot-window">
          {/* Cabecera */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <Bot size={22} />
              <div>
                <p className="chatbot-header-title">AgroBot</p>
                <p className="chatbot-header-sub">Asistente agrícola</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="chatbot-close"
              aria-label="Cerrar chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Mensajes */}
          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chatbot-msg ${msg.role === 'user' ? 'chatbot-msg-user' : 'chatbot-msg-bot'}`}
              >
                <div className="chatbot-msg-icon">
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className="chatbot-msg-bubble">
                  {renderContent(msg.content)}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chatbot-msg chatbot-msg-bot">
                <div className="chatbot-msg-icon">
                  <Bot size={16} />
                </div>
                <div className="chatbot-msg-bubble chatbot-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chips de sugerencias clicables */}
          {suggestions.length > 0 && !loading && (
            <div className="chatbot-chips">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  className="chatbot-chip"
                  onClick={() => sendMessage(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="chatbot-input-area">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu pregunta..."
              className="chatbot-input"
              disabled={loading}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="chatbot-send"
              aria-label="Enviar mensaje"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
