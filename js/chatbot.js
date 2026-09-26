/**
 * MIKASA AI - Minimal Fast Chatbot
 */
(function () {
  'use strict';

  let apiKey = localStorage.getItem('MIKASA_GEMINI_KEY') || '';
  let chatHistory = JSON.parse(localStorage.getItem('MIKASA_HISTORY') || '[]');

  const systemPrompt = `You are an AI assistant embedded in Sanchit Goyal's portfolio website.
You can answer ANY question the user has, whether it is about Sanchit's portfolio, general programming, math, science, or casual conversation.
Be helpful, concise, and format your answers using markdown.`;

  function getPortfolioContext() {
    let context = '';
    if (window.PORTFOLIO_DATA) {
      context = "\n\nPortfolio Data Context:\n" + JSON.stringify(window.PORTFOLIO_DATA, null, 2);
    }
    return context;
  }

  function renderMarkdown(text) {
    if (!text) return '';
    let t = text;
    t = t.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    t = t.replace(/`([^`\n]+)`/g, '<code>$1</code>');
    t = t.replace(/\*\*([^\*\n]+)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/\*([^\*\n]+)\*/g, '<em>$1</em>');
    t = t.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    t = t.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    t = t.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    t = t.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    t = t.replace(/\n/g, '<br>');
    return t;
  }

  function buildUI() {
    const container = document.createElement('div');
    container.id = 'mikasa-chatbot-container';
    
    container.innerHTML = `
      <div id="mikasa-fab" title="Chat with AI">
        <i class="fa-solid fa-robot"></i>
      </div>
      <div id="mikasa-panel" style="display: none;">
        <div class="mikasa-header">
          <span>MIKASA AI</span>
          <button id="mikasa-close"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="mikasa-messages" id="mikasa-messages"></div>
        <div class="mikasa-input-area">
          <textarea id="mikasa-input" placeholder="Ask anything... (/key to set API key)"></textarea>
          <button id="mikasa-send"><i class="fa-solid fa-paper-plane"></i></button>
        </div>
      </div>
    `;
    document.body.appendChild(container);

    const fab = document.getElementById('mikasa-fab');
    const panel = document.getElementById('mikasa-panel');
    const closeBtn = document.getElementById('mikasa-close');
    const sendBtn = document.getElementById('mikasa-send');
    const inputEl = document.getElementById('mikasa-input');
    const messagesEl = document.getElementById('mikasa-messages');

    fab.addEventListener('click', () => {
      panel.style.display = 'flex';
      fab.style.display = 'none';
      scrollToBottom();
    });

    closeBtn.addEventListener('click', () => {
      panel.style.display = 'none';
      fab.style.display = 'flex';
    });

    const appendMessage = (role, text) => {
      const msgEl = document.createElement('div');
      msgEl.className = `mikasa-msg mikasa-msg-${role}`;
      msgEl.innerHTML = `<div class="mikasa-msg-content">${renderMarkdown(text)}</div>`;
      messagesEl.appendChild(msgEl);
      scrollToBottom();
    };

    const scrollToBottom = () => {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    };

    // Load history
    chatHistory.forEach(m => appendMessage(m.role, m.parts[0].text));
    if (chatHistory.length === 0) {
      appendMessage('model', "Hello! I am MIKASA, your AI assistant. I can answer any question about Sanchit's portfolio or anything else! If I don't have an API key, use `/key YOUR_API_KEY` to set it.");
    }

    const sendMessage = async () => {
      const text = inputEl.value.trim();
      if (!text) return;
      inputEl.value = '';

      if (text.startsWith('/key ')) {
        apiKey = text.substring(5).trim();
        localStorage.setItem('MIKASA_GEMINI_KEY', apiKey);
        appendMessage('user', text);
        appendMessage('model', "API key saved! How can I help you?");
        return;
      }

      appendMessage('user', text);
      chatHistory.push({ role: 'user', parts: [{ text }] });

      const typingEl = document.createElement('div');
      typingEl.className = 'mikasa-msg mikasa-msg-model';
      typingEl.innerHTML = '<div class="mikasa-msg-content">Thinking...</div>';
      messagesEl.appendChild(typingEl);
      scrollToBottom();

      try {
        const body = {
          contents: chatHistory,
          systemInstruction: { parts: [{ text: systemPrompt + getPortfolioContext() }] }
        };

        let res;
        try {
          res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: 'gemini-2.5-flash', ...body })
          });
        } catch (e) {
          res = null;
        }

        if (!res || !res.ok) {
          if (!apiKey) {
            typingEl.innerHTML = '<div class="mikasa-msg-content">I need a Gemini API key to answer questions. Please type `/key YOUR_GEMINI_API_KEY` to set it.</div>';
            chatHistory.pop(); // remove user message so they can retry
            return;
          }
          const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`;
          res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
        }

        if (!res.ok) {
          throw new Error('API Error ' + res.status);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';
        typingEl.innerHTML = '<div class="mikasa-msg-content"></div>';
        const contentEl = typingEl.querySelector('.mikasa-msg-content');

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              if (dataStr && dataStr !== '[DONE]') {
                try {
                  const parsed = JSON.parse(dataStr);
                  const textChunk = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || '';
                  fullText += textChunk;
                  contentEl.innerHTML = renderMarkdown(fullText);
                  scrollToBottom();
                } catch (e) {}
              }
            }
          }
        }
        
        chatHistory.push({ role: 'model', parts: [{ text: fullText }] });
        if (chatHistory.length > 20) chatHistory = chatHistory.slice(chatHistory.length - 20);
        localStorage.setItem('MIKASA_HISTORY', JSON.stringify(chatHistory));
        
      } catch (err) {
        typingEl.innerHTML = `<div class="mikasa-msg-content">Error: ${err.message}. Check your API key.</div>`;
        chatHistory.pop();
      }
    };

    sendBtn.addEventListener('click', sendMessage);
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    window.addEventListener("pankrix-ai:open", () => {
      panel.style.display = 'flex';
      fab.style.display = 'none';
      scrollToBottom();
    });
  }

  document.addEventListener('DOMContentLoaded', buildUI);
})();
