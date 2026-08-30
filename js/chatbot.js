/**
 * MIKASA v7.0  Premium Portfolio Intelligence Assistant
 * Google Gemini-powered | Streaming | Multimodal | Sidebar | AI Modes
 * ===================================================================
 * Author  : Built for Sanchit Goyal's Portfolio
 * Engine  : Google Gemini 2.5 Flash (with auto-fallback)
 * Features: Streaming  Sidebar  11 AI Modes  File Upload  Voice
 *           Follow-up Chips  Conversation History  Dark/Light Mode
 * ===================================================================
 */

(function () {
  'use strict';

  /* ============================================================
     CONFIGURATION
     ============================================================ */
  function getGeminiApiKey() {
    return window.GEMINI_API_KEY || localStorage.getItem('MIKASA_GEMINI_KEY') || sessionStorage.getItem('GEMINI_API_KEY') || '';
  }

  const CFG = {
    name: 'MIKASA AI',
    subtitle: 'AI Assistant · Portfolio & Beyond',
    logoPath: 'assets/images/mikasa-ai-logo.png',
    defaultModel: 'gemini-2.5-flash',
    apiBase: 'https://generativelanguage.googleapis.com/v1beta/models',
    maxOutputTokens: 4096,
    temperature: 0.7,
    topP: 0.9,
    topK: 40,
    HIST_KEY: 'mikasa-ai:convs:v8',
    UI_STORE: 'mikasa-ai:ui:v8',
    MAX_HIST: 40,
    MAX_CONVS: 30,
    FALLBACK_MODELS: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'],
    SUGGESTIONS: [
      { icon: 'AI', label: "Who is Sanchit?", desc: "Meet the portfolio owner", q: "Give me an impressive introduction to Sanchit Goyal and what makes him stand out as an aspiring data scientist." },
      { icon: '</>', label: "Show his projects", desc: "Explore real-world work", q: "Tell me about all of Sanchit's projects in detail - what they do, the tech stack, and the skills they demonstrate." },
      { icon: 'DS', label: "Explain neural networks", desc: "Deep learning concepts", q: "Explain how neural networks work from scratch, including forward propagation, backpropagation, and gradient descent with examples." },
      { icon: 'HR', label: "Can I hire him?", desc: "For recruiters & collaborators", q: "I'm a recruiter. What makes Sanchit Goyal a strong candidate? What roles would suit him best right now?" },
    ],
    CAPABILITIES: [
      'Portfolio Q&A', 'Code Helper', 'ML & AI Expert',
      'General Knowledge', 'Career Advisor', 'Writing Assistant'
    ],
  };

  /* ============================================================
     AI PERSONALITY MODES
     ============================================================ */
  const AI_MODES = {
    default: {
      emoji: 'AI', name: 'Portfolio Assistant', shortName: 'Portfolio',
      desc: 'Friendly, smart portfolio guide',
      prompt: 'You are a friendly, intelligent portfolio assistant. Be warm, engaging, and concise.'
    },
    recruiter: {
      emoji: 'HR', name: 'Recruiter Mode', shortName: 'Recruiter',
      desc: 'Formal guide for hiring managers',
      prompt: 'You are in RECRUITER MODE. Be formal, metrics-focused, and professional. Highlight Sanchit\'s strengths clearly for hiring managers. Use structured bullet points. Speak like a top-tier career advisor.'
    },
    teacher: {
      emoji: 'EDU', name: 'Teacher Mode', shortName: 'Teacher',
      desc: 'Patient educator breaking things down',
      prompt: 'You are in TEACHER MODE. Be patient, clear, and thorough. Break down complex concepts step by step. Use analogies, examples, and simple language. Encourage questions and learning.'
    },
    mentor: {
      emoji: 'MEN', name: 'Mentor Mode', shortName: 'Mentor',
      desc: 'Experienced career mentor',
      prompt: 'You are in MENTOR MODE. Act like a senior engineer with 10+ years of experience guiding a junior developer. Give honest, constructive advice. Focus on career growth, learning paths, and practical wisdom.'
    },
    interviewer: {
      emoji: 'INT', name: 'Interviewer Mode', shortName: 'Interviewer',
      desc: 'Conducts mock technical interviews',
      prompt: 'You are in INTERVIEWER MODE. Conduct mock technical and behavioral interviews. Ask one question at a time. Give detailed feedback after each answer. Be constructive but challenging. Cover DSA, ML concepts, and behavioral questions.'
    },
    coding: {
      emoji: 'DEV', name: 'Coding Assistant', shortName: 'Coder',
      desc: 'Expert coder with detailed explanations',
      prompt: 'You are in CODING ASSISTANT MODE. Provide expert-level code with detailed explanations. Always show working code examples. Explain time/space complexity. Suggest best practices and optimizations. Use proper syntax highlighting.'
    },
    research: {
      emoji: 'RES', name: 'Research Mode', shortName: 'Research',
      desc: 'Deep-dive academic research style',
      prompt: 'You are in RESEARCH MODE. Be thorough, academic, and citation-aware. Deep-dive into topics. Explain underlying mechanisms. Reference relevant papers or concepts where applicable. Be precise and comprehensive.'
    },
    motivational: {
      emoji: 'MOT', name: 'Motivational Coach', shortName: 'Coach',
      desc: 'High-energy encouragement & guidance',
      prompt: 'You are in MOTIVATIONAL COACH MODE. Be high-energy, enthusiastic, and deeply encouraging. Inspire action, celebrate progress, and help overcome self-doubt. Use dynamic language. Make every response feel empowering!'
    },
    casual: {
      emoji: 'CHAT', name: 'Casual Chat', shortName: 'Casual',
      desc: 'Chill conversational companion',
      prompt: 'You are in CASUAL CHAT MODE. Be super chill, friendly, and conversational. Use natural language, emojis where appropriate, and keep things light and fun. Feel like a knowledgeable friend having a normal conversation.'
    },
    technical: {
      emoji: 'TECH', name: 'Technical Expert', shortName: 'Technical',
      desc: 'Terse, precision-focused expert',
      prompt: 'You are in TECHNICAL EXPERT MODE. Be precise, terse, and highly technical. Skip fluff. Use proper terminology. Assume high technical knowledge. Focus on accuracy and depth over accessibility.'
    },
    business: {
      emoji: 'BIZ', name: 'Business Consultant', shortName: 'Business',
      desc: 'ROI-focused, business strategy lens',
      prompt: 'You are in BUSINESS CONSULTANT MODE. Analyze everything through a business lens. Focus on ROI, impact, strategy, and scalability. Use business frameworks. Speak like a McKinsey consultant advising a tech startup.'
    },
  };

  /* ============================================================
     SYSTEM PROMPT BUILDER
     ============================================================ */
  function buildPortfolioGrounding() {
    const data = window.PORTFOLIO_DATA || {};
    const legacy = window.portfolioData || {};
    const owner = data.owner || {};
    const contact = legacy.contact || {};

    const skills = (data.skills || []).map((group) => ({
      category: group.category,
      description: group.description,
      items: (group.items || []).map((item) => (
        typeof item === 'string' ? item : `${item.name} (${item.proficiency}%)`
      ))
    }));

    const projects = (data.projects || []).map((project) => ({
      title: project.title,
      category: project.category,
      description: project.description,
      techStack: project.techStack || [],
      features: project.features || [],
      codeUrl: project.codeUrl || null,
      demoUrl: project.demoUrl || null
    }));

    const certifications = (data.certifications || []).map((cert) => ({
      name: cert.name,
      issuer: cert.issuer,
      issueDate: cert.issueDate,
      category: cert.category,
      description: cert.description,
      skills: cert.skills || [],
      verificationUrl: cert.verificationUrl || null
    }));

    return JSON.stringify({
      owner: {
        name: owner.name || legacy.about?.name || 'Sanchit Goyal',
        roles: owner.roles || legacy.about?.identity || [],
        email: owner.email || contact.email || null,
        location: owner.location || contact.location || null,
        education: owner.education || null,
        availability: contact.availability || null
      },
      profile: {
        headline: legacy.about?.headline || null,
        summary: legacy.about?.summary || null,
        strengths: legacy.about?.strengths || [],
        interests: legacy.about?.interests || []
      },
      education: legacy.education || {},
      verifiedSkills: skills,
      verifiedProjects: projects,
      plannedProjectAreas: data.plannedProjectAreas || [],
      verifiedCertifications: certifications,
      goals: data.goals || legacy.goals || {},
      socialLinks: data.socialLinks || contact.links || []
    }, null, 2);
  }

  function buildSystemPrompt(modeKey) {
    const mode = AI_MODES[modeKey] || AI_MODES.default;
    const portfolioGrounding = buildPortfolioGrounding();
    return `You are MIKASA, an advanced AI assistant embedded in Sanchit Goyal's personal portfolio website. You have two core strengths:

1. **Sanchit's Portfolio Expert** — You have complete, verified knowledge of Sanchit Goyal's profile, education, skills, projects, certifications, and career goals. You represent him with professionalism and accuracy.
2. **General-Purpose AI** — You can answer ANY question on ANY topic: coding, data science, machine learning, mathematics, science, history, current events, creative writing, language, philosophy, pop culture, productivity, life advice, and more.

## CURRENT MODE
${mode.prompt}

## CORE PERSONALITY
- Be professional, highly intelligent, friendly, and naturally conversational.
- Use a clean, polished tone. Adapt to the user's communication style.
- Match the user's language (English, Hindi, Spanish, etc.).
- Retain full context across the conversation.
- When the user asks to switch modes, acknowledge the switch warmly and continue in that style.
- Never say "I only answer portfolio questions" — you CAN help with everything.

## WHAT YOU CAN DO
- Answer questions about Sanchit's portfolio, projects, certifications, skills, background.
- Help with coding in any language (Python, JS, C++, SQL, etc.) with complete working examples.
- Explain ML/AI/Data Science concepts in depth.
- Help with math, statistics, probability problems.
- Answer general knowledge, science, history, geography questions.
- Write essays, summaries, emails, cover letters, blog posts.
- Give career advice, review resumes, prep mock interviews.
- Explain current events, technology trends, research papers.
- Help with creative writing, brainstorming, and ideation.
- Answer philosophical, ethical, or thought-provoking questions.
- Assist with productivity, learning strategies, time management.

## PORTFOLIO ACCURACY RULES
- Treat the VERIFIED PORTFOLIO DATA below as the ground truth for Sanchit's profile.
- Do not invent CGPA, rankings, awards, internships, publications, or metrics not listed.
- If portfolio info is missing, say the portfolio does not list it yet and offer a useful next step.
- Use exact project names, certification names, dates, issuers, and credential IDs from the data.
- For recruiter questions, be positive but honest about Sanchit's current learning stage.

## INTERACTIVE FEATURES
- **Sanchit Trivia Quiz**: If user says "quiz", "trivia", or "play quiz" — host a game-show style quiz with A/B/C/D options about Sanchit's profile.
- **Resume Review**: If asked to review a resume, provide detailed, actionable feedback.
- **Mock Interview**: In interviewer mode, conduct structured interviews with feedback.
- **Code Help**: Write, explain, debug, or optimize any code snippet instantly.

## VERIFIED PORTFOLIO DATA
${portfolioGrounding}

## RESPONSE GUIDELINES
- **Portfolio Questions**: Be specific, cite projects with GitHub links, represent Sanchit with energy and professionalism.
- **Technical / General Questions**: Be thorough, accurate, and educational. Use code blocks, examples, and visuals where helpful.
- **Conciseness**: Match depth to complexity — short for simple questions, detailed for complex ones.
- **Rich Formatting**: Use markdown (headers, bullets, bold, code blocks, tables) to make responses visually rich and scannable.
- **Follow-up Suggestions**: Offer 2-3 natural follow-up questions when it adds value.`;
  }

  /* ============================================================
     GEMINI API CLIENT  STREAMING WITH AUTO-FALLBACK
     ============================================================ */
  async function streamGemini(model, messages, pendingFiles, onChunk, onDone, onError, _tried = []) {
    const apiKey = getGeminiApiKey();
    if (!apiKey) { onError('No API key configured. Please add your Gemini API key.'); return; }
    const url = `${CFG.apiBase}/${model}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`;

    // Build contents with optional multimodal parts
    const contents = messages.map((m, idx) => {
      const isLast = idx === messages.length - 1;
      let parts = [{ text: m.content || '' }];

      // Attach files to the last user message
      if (isLast && m.role === 'user' && pendingFiles && pendingFiles.length > 0) {
        parts = [...pendingFiles.map(f => ({
          inlineData: { mimeType: f.mimeType, data: f.data }
        })), { text: m.content || 'Please analyze the attached file(s).' }];
      }

      return {
        role: m.role === 'assistant' ? 'model' : 'user',
        parts
      };
    });

    let body;
    try {
      body = JSON.stringify({
        contents,
        system_instruction: { parts: [{ text: buildSystemPrompt(window._pankrixMode || 'default') }] },
        generationConfig: {
          temperature: CFG.temperature,
          maxOutputTokens: CFG.maxOutputTokens,
          topP: CFG.topP,
          topK: CFG.topK,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
        ],
      });
    } catch (e) { onError('Failed to build request: ' + e.message); return; }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      if (!res.ok) {
        let errMsg = `API error (${res.status})`;
        try { const d = await res.json(); errMsg = d?.error?.message || errMsg; } catch { }
        const recoverable = res.status === 404 || res.status === 429 || errMsg.toLowerCase().includes('quota') || errMsg.toLowerCase().includes('not found');
        if (recoverable && CFG.FALLBACK_MODELS) {
          const tried = [..._tried, model];
          const next = CFG.FALLBACK_MODELS.find(m => !tried.includes(m));
          if (next) { console.log(`[MIKASA] Switching from ${model} -> ${next}`); return streamGemini(next, messages, pendingFiles, onChunk, onDone, onError, tried); }
        }
        onError(errMsg); return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '', fullText = '', firstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (!data || data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            const chunk = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (chunk) {
              fullText += chunk;
              onChunk(chunk, fullText, firstChunk);
              firstChunk = false;
            }
          } catch (_) { }
        }
      }
      onDone(fullText || 'I apologize, I received an empty response. Please try again.');
    } catch (err) {
      const msg = err.name === 'AbortError' ? 'Request cancelled.' : (err.message || 'Network error. Please check your connection.');
      onError(msg);
    }
  }

  /* ============================================================
     MARKDOWN RENDERER
     ============================================================ */
  const LANG_KW = {
    python: /\b(def|class|if|elif|else|for|while|try|except|finally|with|import|from|return|yield|lambda|pass|break|continue|not|and|or|in|is|None|True|False|self|print|len|range|list|dict|set|tuple|str|int|float|bool|type|open|isinstance|super|__init__|async|await|raise|assert|global|nonlocal|del|map|filter|zip|enumerate|sorted|reversed|any|all|sum|min|max|abs|round)\b/g,
    sql: /\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|FULL|CROSS|ON|GROUP\s+BY|ORDER\s+BY|HAVING|LIMIT|OFFSET|INSERT|INTO|UPDATE|DELETE|CREATE|DROP|ALTER|TABLE|INDEX|VIEW|DISTINCT|COUNT|SUM|AVG|MAX|MIN|AS|AND|OR|NOT|IN|LIKE|BETWEEN|IS|NULL|UNION|ALL|CASE|WHEN|THEN|END|WITH|OVER|PARTITION|BY|RANK|ROW_NUMBER)\b/gi,
    js: /\b(function|const|let|var|if|else|for|while|do|return|class|extends|import|export|default|new|this|typeof|instanceof|async|await|try|catch|finally|throw|null|undefined|true|false|of|in|break|continue|switch|case|yield|Promise|then|resolve|reject|fetch|console|document|window|module|require)\b/g,
  };

  function safeEsc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function safeEscAttr(s) { return String(s).replace(/"/g, '&quot;'); }

  function hlCode(code, lang) {
    const esc = safeEsc(code);
    const l = (lang || '').toLowerCase();
    if (l === 'python' || l === 'py') {
      return esc
        .replace(LANG_KW.python, '<s class="kw">$1</s>')
        .replace(/(#[^\n]*)/g, '<s class="cm">$1</s>')
        .replace(/("""[\s\S]*?"""|'''[\s\S]*?''')/g, '<s class="cm">$1</s>')
        .replace(/(((?<!")["](?:[^"\\]|\\.)*["](?!")|((?<!')')['](?:[^'\\]|\\.)*['](?!')))/g, '<s class="st">$1</s>');
    }
    if (l === 'sql') return esc.replace(LANG_KW.sql, '<s class="kw">$1</s>');
    if (l === 'js' || l === 'javascript' || l === 'ts' || l === 'typescript') {
      return esc
        .replace(LANG_KW.js, '<s class="kw">$1</s>')
        .replace(/(\/\/[^\n]*)/g, '<s class="cm">$1</s>')
        .replace(/(\/\*[\s\S]*?\*\/)/g, '<s class="cm">$1</s>')
        .replace(/((["'])(?:[^"'\\]|\\.)*\2|`(?:[^`\\]|\\.)*`)/g, '<s class="st">$1</s>');
    }
    if (l === 'bash' || l === 'sh' || l === 'shell') {
      return esc.replace(/(#[^\n]*)/g, '<s class="cm">$1</s>').replace(/(\$\w+)/g, '<s class="st">$1</s>');
    }
    if (l === 'json') {
      return esc
        .replace(/"([^"]+)":/g, '<s class="kw">"$1"</s>:')
        .replace(/:\s*("(?:[^"\\]|\\.)*")/g, ': <s class="st">$1</s>')
        .replace(/:\s*(\d+\.?\d*)/g, ': <s class="num">$1</s>')
        .replace(/:\s*(true|false|null)/g, ': <s class="kw">$1</s>');
    }
    return esc;
  }

  function closeIncompleteTags(raw) {
    if (!raw) return '';
    let t = raw;
    const codeBlockCount = (t.match(/```/g) || []).length;
    const inCodeBlock = (codeBlockCount % 2 === 1);
    if (inCodeBlock) return t + '\n```';
    const lastLine = t.substring(t.lastIndexOf('\n') + 1);
    const inlineCodeCount = (lastLine.match(/`/g) || []).length;
    const inInlineCode = (inlineCodeCount % 2 === 1) && !inCodeBlock;
    let suffix = '';
    if (inInlineCode) suffix += '`';
    const temp = t + (inInlineCode ? '`' : '');
    const tempNoClosed = temp.replace(/```[\s\S]*?```/g, '');
    const db = (tempNoClosed.match(/\*\*/g) || []).length;
    if (db % 2 === 1) suffix += '**';
    const sb = (tempNoClosed.replace(/\*\*/g, '').match(/\*/g) || []).length;
    if (sb % 2 === 1) suffix += '*';
    return t + suffix;
  }

  function extractSources(text) {
    if (!text) return [];
    const regex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
    const sources = [], seen = new Set();
    let m;
    while ((m = regex.exec(text)) !== null) {
      const [, title, url] = m;
      if (!seen.has(url)) {
        seen.add(url);
        let domain = 'link';
        try { domain = new URL(url).hostname.replace('www.', ''); } catch { }
        sources.push({ title: title.trim(), url: url.trim(), domain });
      }
    }
    return sources;
  }

  function processTable(t) {
    return t.replace(/((?:\|.+\|\n?)+)/g, (match) => {
      const rows = match.trim().split('\n').filter(r => r.trim() && !r.match(/^\|[-: |]+\|$/));
      if (rows.length < 1) return match;
      const toRow = (r, tag) => '<tr>' + r.split('|').filter((_, i, a) => i > 0 && i < a.length - 1)
        .map(c => `<${tag}>${c.trim()}</${tag}>`).join('') + '</tr>';
      const [head, ...body] = rows;
      return `<div class="sai-table-w"><table class="sai-table"><thead>${toRow(head, 'th')}</thead><tbody>${body.map(r => toRow(r, 'td')).join('')}</tbody></table></div>`;
    });
  }

  function processList(t) {
    t = t.replace(/((?:^[ \t]*[-*] .+\n?)+)/gm, (match) => {
      const items = match.trim().split('\n').map(l => `<li>${l.replace(/^[ \t]*[-*] /, '').trim()}</li>`).join('');
      return `<ul class="sai-ul">${items}</ul>`;
    });
    t = t.replace(/((?:^[ \t]*\d+\. .+\n?)+)/gm, (match) => {
      const items = match.trim().split('\n').map(l => `<li>${l.replace(/^[ \t]*\d+\. /, '').trim()}</li>`).join('');
      return `<ol class="sai-ol">${items}</ol>`;
    });
    return t;
  }

  function renderMarkdown(raw) {
    if (!raw) return '';
    let t = raw;

    // Fenced code blocks
    t = t.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
      const highlighted = hlCode(code.trim(), lang);
      const langLabel = lang ? safeEsc(lang) : 'code';
      const encoded = btoa(encodeURIComponent(
        `<div class="sai-code-wrap"><div class="sai-code-bar"><div class="sai-code-dots"><span></span><span></span><span></span></div><span class="sai-code-lang">${langLabel}</span><button class="sai-copy-code" title="Copy code"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy</button></div><pre class="sai-pre"><code class="sai-code">${highlighted}</code></pre></div>`
      ));
      return `\x00BLOCK${encoded}\x00`;
    });

    t = t.replace(/`([^`\n]+)`/g, (_, c) => `<code class="sai-ic">${safeEsc(c)}</code>`);
    t = t.replace(/^#### (.+)$/gm, '<h5 class="sai-h5">$1</h5>');
    t = t.replace(/^### (.+)$/gm, '<h4 class="sai-h4">$1</h4>');
    t = t.replace(/^## (.+)$/gm, '<h3 class="sai-h3">$1</h3>');
    t = t.replace(/^# (.+)$/gm, '<h2 class="sai-h2">$1</h2>');
    t = t.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/\*([^\*\n]+)\*/g, '<em>$1</em>');
    t = t.replace(/__(.+?)__/g, '<strong>$1</strong>');
    t = t.replace(/_([^_\n]+)_/g, '<em>$1</em>');
    t = t.replace(/~~(.+?)~~/g, '<del>$1</del>');
    t = t.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="sai-link">$1 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10" style="display:inline;vertical-align:middle"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>');
    t = t.replace(/(?<!\()(https?:\/\/[^\s)]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="sai-link">$1</a>');
    t = t.replace(/^---+$/gm, '<hr class="sai-hr">');
    t = t.replace(/^> (.+)$/gm, '<blockquote class="sai-bq">$1</blockquote>');
    t = processTable(t);
    t = processList(t);

    const blocks = t.split(/\n\n+/);
    t = blocks.map(block => {
      block = block.trim();
      if (!block) return '';
      if (/^\x00BLOCK/.test(block) || /^<(h[2-5]|ul|ol|hr|blockquote|div|table|pre)/.test(block)) return block;
      return `<p class="sai-p">${block.replace(/\n/g, '<br>')}</p>`;
    }).join('');

    t = t.replace(/\x00BLOCK([A-Za-z0-9+/=]+)\x00/g, (_, enc) => {
      try { return decodeURIComponent(atob(enc)); } catch { return ''; }
    });

    setTimeout(() => attachCodeCopyHandlers(), 60);
    return t;
  }

  function attachCodeCopyHandlers() {
    document.querySelectorAll('.sai-copy-code:not([data-bound])').forEach(btn => {
      btn.dataset.bound = '1';
      btn.addEventListener('click', () => {
        const code = btn.closest('.sai-code-wrap')?.querySelector('.sai-code')?.textContent || '';
        navigator.clipboard.writeText(code).then(() => {
          btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><polyline points="20 6 9 17 4 12"/></svg> Copied!`;
          setTimeout(() => {
            btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy`;
          }, 2000);
        });
      });
    });
  }

  /* ============================================================
     UTILITIES
     ============================================================ */
  function uid() { return `m${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`; }
  function convId() { return `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`; }
  function timeFmt(iso) {
    try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return ''; }
  }
  function dateFmt(iso) {
    try {
      const d = new Date(iso);
      const today = new Date();
      if (d.toDateString() === today.toDateString()) return 'Today';
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch { return ''; }
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function detectModeFromText(text) {
    const t = text.toLowerCase();
    const triggers = {
      recruiter: ['recruiter mode', 'hiring manager', 'act as recruiter', 'switch to recruiter'],
      teacher: ['teacher mode', 'teach me', 'explain like', 'switch to teacher'],
      mentor: ['mentor mode', 'act as mentor', 'career advice', 'switch to mentor'],
      interviewer: ['interviewer mode', 'mock interview', 'interview me', 'switch to interviewer'],
      coding: ['coding mode', 'code assistant', 'coding assistant', 'switch to code'],
      research: ['research mode', 'academic mode', 'switch to research'],
      motivational: ['motivational mode', 'motivate me', 'coach mode', 'switch to coach'],
      casual: ['casual mode', 'chill mode', 'be casual', 'switch to casual'],
      technical: ['technical mode', 'expert mode', 'switch to technical'],
      business: ['business mode', 'consultant mode', 'switch to business'],
      default: ['default mode', 'reset mode', 'normal mode', 'portfolio mode', 'switch back'],
    };
    for (const [mode, kws] of Object.entries(triggers)) {
      if (kws.some(kw => t.includes(kw))) return mode;
    }
    return null;
  }

  function detectTopicsAndHighlight(text) {
    if (!text) return;
    const t = text.toLowerCase();
    const mappings = {
      about: ['who is sanchit', 'about sanchit', 'about him', 'profile', 'biography', 'background'],
      journey: ['journey', 'experience', 'education', 'lpu', 'college', 'lpu university'],
      skills: ['skill', 'skills', 'python', 'sql', 'javascript', 'scikit-learn', 'pandas', 'numpy', 'machine learning', 'data science'],
      projects: ['project', 'projects', 'recommendation engine', 'banking customer analysis', 'credit banking'],
      certifications: ['certification', 'certifications', 'course', 'courses', 'upgrad'],
      contact: ['contact', 'email', 'linkedin', 'github', 'reach out', 'hire', 'phone']
    };

    for (const [id, keywords] of Object.entries(mappings)) {
      if (keywords.some(kw => t.includes(kw))) {
        const navLink = document.querySelector(`.nav-links a[href="#${id}"]`);
        if (navLink) {
          navLink.classList.add('px-highlight-pulse');
          setTimeout(() => navLink.classList.remove('px-highlight-pulse'), 3000);
        }
      }
    }
  }

  function generateFollowUps(text) {
    const t = text.toLowerCase();
    const sugs = [];
    if (t.includes('project') || t.includes('github')) sugs.push('Show more project details');
    if (t.includes('skill') || t.includes('python') || t.includes('machine learning')) sugs.push('What is Sanchit\'s strongest skill?');
    if (t.includes('certif')) sugs.push('Which certification is most impressive?');
    if (t.includes('data') || t.includes('analysis')) sugs.push('Tell me about his data science approach');
    if (t.includes('learn') || t.includes('studying')) sugs.push('What should he learn next?');
    if (t.includes('intern') || t.includes('job') || t.includes('hire')) sugs.push('What roles suit him?');
    if (t.includes('ai') || t.includes('generative') || t.includes('llm')) sugs.push('How does MIKASA work?');
    if (sugs.length === 0) {
      sugs.push('Tell me something impressive about Sanchit');
      sugs.push('What makes him unique?');
    }
    return sugs.slice(0, 3);
  }

  /* ============================================================
     MIKASA CLASS  MAIN ENGINE
     ============================================================ */
  class PankrixAI {
    constructor() {
      this.root = null;
      this.conversations = []; // [{id, name, messages, createdAt, pinned}]
      this.activeConvId = null;
      this.busy = false;
      this.isOpen = false;
      this.isMinimized = false;
      this.sidebarOpen = false;
      this.model = CFG.defaultModel;
      this.recognition = null;
      this.isListening = false;
      this.speakingMsgId = null;
      this.pendingFiles = []; // [{name, mimeType, data, previewUrl}]
      this.modeModalOpen = false;
      this.currentMode = 'default';
      this.theme = 'dark';
      this.streamEl = null;
      this.editingMsgId = null;
      this.userScrolledUp = false;
    }

    get activeConv() {
      return this.conversations.find(c => c.id === this.activeConvId) || null;
    }
    get messages() { return this.activeConv?.messages || []; }

    /*  Storage  */
    _ls(k) { try { return localStorage.getItem(k) || ''; } catch { return ''; } }
    _lsSet(k, v) { try { localStorage.setItem(k, v); } catch { } }

    loadConversations() {
      try {
        const raw = this._ls(CFG.HIST_KEY);
        this.conversations = raw ? JSON.parse(raw) : [];
      } catch { this.conversations = []; }
    }

    saveConversations() {
      try {
        // Keep last MAX_CONVS, trim messages per conv
        const trimmed = this.conversations.slice(-CFG.MAX_CONVS).map(c => ({
          ...c,
          messages: c.messages.slice(-CFG.MAX_HIST)
        }));
        this._lsSet(CFG.HIST_KEY, JSON.stringify(trimmed));
      } catch { }
    }

    createConversation() {
      const conv = {
        id: convId(),
        name: 'New Chat',
        messages: [],
        createdAt: new Date().toISOString(),
        pinned: false,
      };
      this.conversations.push(conv);
      this.activeConvId = conv.id;
      this.saveConversations();
      return conv;
    }

    switchConversation(id) {
      const conv = this.conversations.find(c => c.id === id);
      if (!conv) return;
      this.activeConvId = id;
      this.pendingFiles = [];
      this._renderMessages();
      this._renderSidebar();
      this._saveUIState();
    }

    deleteConversation(id) {
      this.conversations = this.conversations.filter(c => c.id !== id);
      if (this.activeConvId === id) {
        if (this.conversations.length === 0) this.createConversation();
        else this.activeConvId = this.conversations[this.conversations.length - 1].id;
        this._renderMessages();
      }
      this.saveConversations();
      this._renderSidebar();
    }

    pinConversation(id) {
      const conv = this.conversations.find(c => c.id === id);
      if (conv) { conv.pinned = !conv.pinned; this.saveConversations(); this._renderSidebar(); }
    }

    autoNameConversation(text) {
      if (this.activeConv && this.activeConv.name === 'New Chat') {
        this.activeConv.name = text.slice(0, 36) + (text.length > 36 ? '' : '');
        this.saveConversations();
        this._renderSidebar();
      }
    }

    _saveUIState() {
      try {
        this._lsSet(CFG.UI_STORE, JSON.stringify({
          open: this.isOpen,
          activeConvId: this.activeConvId,
          mode: this.currentMode,
          theme: this.theme,
          sidebarOpen: this.sidebarOpen,
        }));
      } catch { }
    }

    /*  Init  */
    init() {
      document.getElementById('MIKASAAiAssistant')?.remove();
      this.loadConversations();

      // Restore UI state
      let uiState = {};
      try { uiState = JSON.parse(this._ls(CFG.UI_STORE)) || {}; } catch { }
      this.theme = uiState.theme || 'dark';
      this.currentMode = uiState.mode || 'default';
      window._pankrixMode = this.currentMode;
      this.sidebarOpen = uiState.sidebarOpen || false;

      // Ensure at least one conversation
      if (this.conversations.length === 0) {
        this.createConversation();
      } else {
        this.activeConvId = uiState.activeConvId || this.conversations[this.conversations.length - 1].id;
        if (!this.conversations.find(c => c.id === this.activeConvId)) {
          this.activeConvId = this.conversations[this.conversations.length - 1].id;
        }
      }

      this.createUI();
      this._renderMessages();
      this._renderSidebar();
      this.bindEvents();

      if (uiState.open) this.setOpen(true, false);
      this.exposePublicAPI();
    }

    exposePublicAPI() {
      window.pankrixAI = {
        open: () => this.setOpen(true),
        close: () => this.setOpen(false),
        ask: (q) => this.sendMessage(q),
        clear: () => this.clearChat(),
        newChat: () => this._newChat(),
      };
    }

    /*  UI Build  */
    createUI() {
      const el = document.createElement('div');
      el.id = 'MIKASAAiAssistant';
      el.className = 'MIKASA-ai';
      el.dataset.open = 'false';
      el.dataset.busy = 'false';
      el.dataset.minimized = 'false';
      el.dataset.theme = this.theme;
      el.innerHTML = this._buildHTML();
      document.body.appendChild(el);
      this.root = el;
    }

    _buildHTML() {
      const mode = AI_MODES[this.currentMode] || AI_MODES.default;
      return `
<!--  Overlay  -->
<div class="MIKASA-overlay" id="pankrixOverlay" aria-hidden="true"></div>

<!--  FAB  -->
<button class="MIKASA-fab" type="button" aria-label="Open ${CFG.name}" aria-expanded="false" aria-controls="pankrixPanel">
  <span class="MIKASA-fab-rings" aria-hidden="true">
    <span class="MIKASA-fab-ring"></span>
    <span class="MIKASA-fab-ring"></span>
  </span>
  <span class="MIKASA-fab-glow" aria-hidden="true"></span>
  <span class="MIKASA-fab-logo"><img src="${CFG.logoPath}" alt="" width="40" height="40" loading="lazy"></span>
  <span class="MIKASA-fab-label">${CFG.name}</span>
  <span class="MIKASA-fab-badge" id="pankrixUnreadBadge" aria-hidden="true"></span>
</button>

<!--  Chat Panel  -->
<div class="MIKASA-panel" id="pankrixPanel" role="dialog" aria-modal="false" aria-label="${CFG.name} Assistant">

  <!-- Sidebar -->
  <nav class="MIKASA-sidebar${this.sidebarOpen ? ' px-sidebar-open' : ''}" id="pankrixSidebar" aria-label="Conversation sidebar">
    <div class="px-sidebar-head">
      <div class="px-sidebar-logo">
        <img src="${CFG.logoPath}" alt="${CFG.name}" width="24" height="24" loading="lazy">
        <span class="px-sidebar-title">${CFG.name}</span>
      </div>
      <button class="px-new-chat-btn" type="button" id="pxNewChatBtn" title="New chat" aria-label="Start new conversation">+</button>
    </div>
    <div class="px-sidebar-search">
      <input type="search" id="pxSidebarSearch" placeholder="Search chats" aria-label="Search conversations">
    </div>
    <div class="px-sidebar-body" id="pxSidebarBody"></div>
    <div style="padding:10px 12px; border-top:1px solid var(--px-border); flex-shrink:0;">
      <p class="px-sidebar-section-label" style="padding:0 0 6px;">Portfolio Links</p>
      <a class="px-sidebar-nav-link" href="#about" onclick="window.pankrixAI.close()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
        About
      </a>
      <a class="px-sidebar-nav-link" href="#projects" onclick="window.pankrixAI.close()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
        Projects
      </a>
      <a class="px-sidebar-nav-link" href="#skills" onclick="window.pankrixAI.close()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        Skills
      </a>
      <a class="px-sidebar-nav-link" href="#contact" onclick="window.pankrixAI.close()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        Contact
      </a>
    </div>
  </nav>

  <!-- Main area -->
  <div class="MIKASA-main">

    <!-- Header -->
    <header class="MIKASA-header" id="pankrixHeader">
      <button class="px-sidebar-toggle MIKASA-icon-btn" type="button" id="pxSidebarToggle" title="Toggle sidebar" aria-label="Toggle conversation sidebar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" aria-hidden="true">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      <div class="MIKASA-header-brand">
        <div class="MIKASA-header-logo-wrap">
          <img src="${CFG.logoPath}" alt="${CFG.name}" width="32" height="32" loading="lazy">
          <span class="MIKASA-online-dot" title="Online"></span>
        </div>
        <div class="MIKASA-header-info">
          <span class="MIKASA-header-name">${CFG.name}</span>
          <span class="MIKASA-header-sub"><span class="px-status-online">Online</span> &nbsp;|&nbsp; <span class="px-gemini-badge">Gemini</span></span>
        </div>
      </div>

      <button class="px-mode-pill" type="button" id="pxModePill" title="Change AI mode" aria-label="Change AI personality mode" aria-expanded="false">
        <span class="px-mode-dot"></span>
        <span id="pxModeName">${mode.shortName}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="10" height="10" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
      </button>

      <div class="MIKASA-header-btns">
        <button class="MIKASA-icon-btn" type="button" id="pxThemeBtn" title="Toggle theme" aria-label="Toggle dark/light mode">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
        </button>
        <button class="MIKASA-icon-btn" type="button" data-act="summary" title="Summarize conversation" aria-label="Summarize conversation">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="15" height="15" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        </button>
        <button class="MIKASA-icon-btn" type="button" data-act="export" title="Export chat" aria-label="Export conversation">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="15" height="15" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </button>
        <button class="MIKASA-icon-btn" type="button" data-act="clear" title="Clear chat" aria-label="Clear conversation">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="15" height="15" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg>
        </button>
        <button class="MIKASA-icon-btn" type="button" data-act="minimize" title="Minimize" aria-label="Minimize">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
        <button class="MIKASA-icon-btn" type="button" data-act="close" title="Close" aria-label="Close ${CFG.name}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </header>

    <!-- Messages -->
    <div class="MIKASA-messages-wrap">
      <div class="MIKASA-messages" id="pankrixMessages" aria-live="polite" aria-label="Conversation" role="log"></div>
      <button class="px-scroll-bottom" type="button" id="pxScrollBottom" hidden aria-label="Scroll to latest message">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="16" height="16" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
    </div>

    <!-- File attachment area (hidden unless files pending) -->
    <div class="MIKASA-compose" id="pankrixCompose">
      <div class="px-edit-strip" id="pxEditStrip" style="display:none;">
        <span class="px-edit-label">Editing message</span>
        <button class="px-edit-cancel" id="pxEditCancel" type="button">Cancel</button>
      </div>
      <div class="px-file-strip" id="pxFileStrip" style="display:none;"></div>
      <div class="MIKASA-compose-inner" id="pankrixComposeInner">
        <div class="px-compose-left">
          <button class="px-icon-compose-btn" type="button" id="pxAttachBtn" title="Attach file or image" aria-label="Attach file">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" aria-hidden="true"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
          </button>
          <input type="file" id="pxFileInput" accept="image/*,.pdf,.txt,.csv,.json,.py,.js,.md" multiple style="display:none;" aria-label="Upload file">
        </div>
        <textarea class="MIKASA-textarea" id="pankrixInput" rows="1" maxlength="8000"
          placeholder="Message ${CFG.name}" aria-label="Chat input" autocomplete="off" autocorrect="off" spellcheck="true"></textarea>
        <button class="px-icon-compose-btn px-mic-btn" type="button" id="pxMicBtn" title="Voice input" aria-label="Voice input">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" aria-hidden="true">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
        </button>
        <button class="MIKASA-send-btn" type="button" id="pankrixSendBtn" aria-label="Send message" title="Send (Enter)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="16" height="16" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
      <div class="MIKASA-compose-foot">
        <span class="px-char-count" id="pxCharCount">0 / 8000</span>
        <span class="px-powered">Powered by Google Gemini</span>
      </div>
    </div>

  </div><!-- end .MIKASA-main -->

</div><!-- end .MIKASA-panel -->`;
    }

    /*  Event Binding  */
    bindEvents() {
      // Use delegated event handling for message actions to prevent duplicate bindings
      const r = this.root;

      // FAB
      r.querySelector('.MIKASA-fab').addEventListener('click', () => this.setOpen(!this.isOpen));

      // Overlay
      r.querySelector('#pankrixOverlay')?.addEventListener('click', () => this.setOpen(false));

      // Delegated actions (header buttons)
      r.addEventListener('click', e => {
        const btn = e.target.closest('[data-act]');
        if (btn) this._handleAction(btn.dataset.act);

        const sugg = e.target.closest('.px-sugg-card');
        if (sugg) this.sendMessage(sugg.dataset.q);

        const followup = e.target.closest('.px-followup-chip');
        if (followup) this.sendMessage(followup.dataset.q);

        const retry = e.target.closest('.px-retry-btn');
        if (retry) this._retryLast();

        const cpMsg = e.target.closest('.px-copy-msg');
        if (cpMsg) this._copyMsg(cpMsg.dataset.id);

        const speakBtn = e.target.closest('.px-speak-btn');
        if (speakBtn) this._toggleSpeak(speakBtn.dataset.id, speakBtn);

        const regenBtn = e.target.closest('.px-regen-btn');
        if (regenBtn) this._regenerate();

        const reactionBtn = e.target.closest('.px-reaction-btn');
        if (reactionBtn) this._handleReaction(reactionBtn);

        const convItem = e.target.closest('.px-conv-item');
        if (convItem && !e.target.closest('.px-conv-del') && !e.target.closest('.px-conv-pin')) {
          this.switchConversation(convItem.dataset.id);
        }

        const convPin = e.target.closest('.px-conv-pin');
        if (convPin) {
          e.stopPropagation();
          this.pinConversation(convPin.dataset.id);
        }

        const convDel = e.target.closest('.px-conv-del');
        if (convDel) {
          e.stopPropagation();
          this.deleteConversation(convDel.dataset.id);
        }

        const editBtn = e.target.closest('.px-user-edit-btn');
        if (editBtn) this._editMsg(editBtn.dataset.id);

        // Close mode modal when clicking outside
        if (this.modeModalOpen && !e.target.closest('#pxModePill') && !e.target.closest('.px-mode-modal')) {
          this._closeModeModal();
        }
      });

      // New chat button
      r.querySelector('#pxNewChatBtn')?.addEventListener('click', () => this._newChat());

      // Sidebar toggle
      r.querySelector('#pxSidebarToggle')?.addEventListener('click', () => this._toggleSidebar());

      // Mode pill
      r.querySelector('#pxModePill')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.modeModalOpen ? this._closeModeModal() : this._openModeModal();
      });

      // Theme toggle
      r.querySelector('#pxThemeBtn')?.addEventListener('click', () => this._toggleTheme());

      // Sidebar search
      r.querySelector('#pxSidebarSearch')?.addEventListener('input', e => {
        this._renderSidebar(e.target.value);
      });

      // Send button
      r.querySelector('#pankrixSendBtn').addEventListener('click', () => this._submitInput());

      // Textarea
      const ta = r.querySelector('#pankrixInput');
      ta.addEventListener('input', () => {
        this._autoResize(ta);
        r.querySelector('#pxCharCount').textContent = `${ta.value.length} / 8000`;
        const sb = r.querySelector('#pankrixSendBtn');
        if (sb) {
          const hasContent = ta.value.trim().length > 0 || this.pendingFiles.length > 0;
          sb.classList.toggle('MIKASA-send-active', hasContent);
        }
      });
      ta.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this._submitInput(); }
      });

      r.querySelector('#pxEditCancel')?.addEventListener('click', () => {
        const ta = r.querySelector('#pankrixInput');
        if (ta) ta.value = '';
        this._hideEditIndicator();
        this._autoResize(ta);
        r.querySelector('#pxCharCount').textContent = '0 / 8000';
        r.querySelector('#pankrixSendBtn')?.classList.remove('MIKASA-send-active');
      });

      // File attach
      r.querySelector('#pxAttachBtn').addEventListener('click', () => r.querySelector('#pxFileInput').click());
      r.querySelector('#pxFileInput').addEventListener('change', e => this._handleFiles(e.target.files));

      // Drag and drop
      const compose = r.querySelector('#pankrixCompose');
      compose.addEventListener('dragover', e => { e.preventDefault(); compose.classList.add('px-drag-over'); });
      compose.addEventListener('dragleave', () => compose.classList.remove('px-drag-over'));
      compose.addEventListener('drop', e => {
        e.preventDefault();
        compose.classList.remove('px-drag-over');
        this._handleFiles(e.dataTransfer.files);
      });

      // Mic
      r.querySelector('#pxMicBtn').addEventListener('click', () => this._toggleMic());

      // Escape
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
          if (this.modeModalOpen) { this._closeModeModal(); return; }
          if (this.isOpen && !this.isMinimized) this.setOpen(false);
        }
      });

      // External open
      window.addEventListener('pankrix-ai:open', () => this.setOpen(true));

      // Scroll-to-bottom & smart autoscroll
      const msgCt = r.querySelector('#pankrixMessages');
      msgCt?.addEventListener('scroll', () => this._updateScrollBtn(), { passive: true });
      r.querySelector('#pxScrollBottom')?.addEventListener('click', () => this._scrollBottom(true));
    }

    _handleAction(act) {
      if (act === 'close') this.setOpen(false);
      if (act === 'clear') this.clearChat();
      if (act === 'minimize') this._toggleMinimize();
      if (act === 'export') this._exportChat();
      if (act === 'summary') this._summarizeChat();
    }

    /*  Sidebar  */
    _toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen;
      const sb = this.root.querySelector('#pankrixSidebar');
      sb?.classList.toggle('px-sidebar-open', this.sidebarOpen);
      this._saveUIState();
    }

    _renderSidebar(searchQuery = '') {
      const body = this.root.querySelector('#pxSidebarBody');
      if (!body) return;

      const q = searchQuery.toLowerCase();
      const filtered = q
        ? this.conversations.filter(c => c.name.toLowerCase().includes(q) || c.messages.some(m => m.content?.toLowerCase().includes(q)))
        : this.conversations;

      const pinned = filtered.filter(c => c.pinned).reverse();
      const recent = filtered.filter(c => !c.pinned).reverse();

      let html = '';
      if (pinned.length > 0) {
        html += `<p class="px-sidebar-section-label">Pinned</p>`;
        html += pinned.map(c => this._convItemHTML(c)).join('');
      }
      if (recent.length > 0) {
        html += `<p class="px-sidebar-section-label">Recent</p>`;
        html += recent.map(c => this._convItemHTML(c)).join('');
      }
      if (filtered.length === 0) {
        html = `<p style="font-size:11px;color:var(--px-text-muted);padding:12px 4px;">No conversations found</p>`;
      }
      body.innerHTML = html;
    }

    _convItemHTML(conv) {
      const active = conv.id === this.activeConvId;
      const icon = conv.pinned ? '' : (conv.messages.length === 0 ? '' : '');
      const pinTitle = conv.pinned ? 'Unpin conversation' : 'Pin conversation';
      const pinClass = conv.pinned ? 'px-conv-pin active' : 'px-conv-pin';
      const pinText = conv.pinned ? '' : '';
      return `
        <div class="px-conv-item${active ? ' active' : ''}" data-id="${safeEscAttr(conv.id)}" role="button" tabindex="0" aria-label="Switch to conversation: ${safeEsc(conv.name)}">
          <span class="px-conv-icon">${icon}</span>
          <span class="px-conv-name" title="${safeEsc(conv.name)}">${safeEsc(conv.name)}</span>
          <span class="${pinClass}" data-id="${safeEscAttr(conv.id)}" title="${pinTitle}" role="button" aria-label="${pinTitle}">${pinText}</span>
          <span class="px-conv-del" data-id="${safeEscAttr(conv.id)}" title="Delete conversation" role="button" aria-label="Delete conversation"></span>
        </div>`;
    }

    /*  AI Mode  */
    _openModeModal() {
      this._closeModeModal();
      this.modeModalOpen = true;
      const header = this.root.querySelector('#pankrixHeader');

      const modal = document.createElement('div');
      modal.className = 'px-mode-modal';
      modal.id = 'pxModeModal';
      modal.innerHTML = `
        <div class="px-mode-modal-header">AI Personality Mode</div>
        <div class="px-mode-list">
          ${Object.entries(AI_MODES).map(([key, m]) => `
            <div class="px-mode-item${this.currentMode === key ? ' active' : ''}" data-mode="${key}" role="button" tabindex="0">
              <span class="px-mode-emoji">${m.emoji}</span>
              <div class="px-mode-info">
                <span class="px-mode-name">${m.name}</span>
                <span class="px-mode-desc">${m.desc}</span>
              </div>
            </div>`).join('')}
        </div>`;

      header.style.position = 'relative';
      header.appendChild(modal);

      modal.querySelectorAll('.px-mode-item').forEach(item => {
        item.addEventListener('click', () => {
          const key = item.dataset.mode;
          this._setMode(key);
          this._closeModeModal();
        });
      });

      this.root.querySelector('#pxModePill')?.setAttribute('aria-expanded', 'true');
    }

    _closeModeModal() {
      this.modeModalOpen = false;
      this.root.querySelector('#pxModeModal')?.remove();
      this.root.querySelector('#pxModePill')?.setAttribute('aria-expanded', 'false');
    }

    _setMode(key) {
      this.currentMode = key;
      window._pankrixMode = key;
      const mode = AI_MODES[key] || AI_MODES.default;
      const nameEl = this.root.querySelector('#pxModeName');
      if (nameEl) nameEl.textContent = mode.shortName;
      this._saveUIState();
      this._toast(`${mode.emoji} ${mode.name} activated!`);
    }

    /*  Theme  */
    _toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark';
      this.root.dataset.theme = this.theme;
      this._saveUIState();
      this._toast(this.theme === 'light' ? ' Light mode' : ' Dark mode');
    }

    /*  Toast  */
    _toast(msg, type = 'info') {
      const existing = document.querySelector('.MIKASA-toast');
      if (existing) existing.remove();
      const t = document.createElement('div');
      t.className = 'MIKASA-toast';
      t.setAttribute('role', 'status');
      t.textContent = msg;
      document.body.appendChild(t);
      requestAnimationFrame(() => t.classList.add('px-toast-show'));
      setTimeout(() => {
        t.classList.remove('px-toast-show');
        setTimeout(() => t.remove(), 300);
      }, 2500);
    }

    /*  State  */
    setOpen(open, persist = true) {
      this.isOpen = !!open;
      this.isMinimized = false;
      this.root.dataset.open = String(this.isOpen);
      this.root.dataset.minimized = 'false';
      this.root.querySelector('.MIKASA-fab')?.setAttribute('aria-expanded', String(this.isOpen));

      if (!this.isOpen && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        this.speakingMsgId = null;
      }
      if (this.isOpen) {
        const badge = this.root.querySelector('#pankrixUnreadBadge');
        if (badge) badge.textContent = '';
        setTimeout(() => {
          this.root.querySelector('#pankrixInput')?.focus();
          this._scrollBottom(true);
          this._updateScrollBtn();
        }, 280);
      }
      if (persist) this._saveUIState();
    }

    _toggleMinimize() {
      this.isMinimized = !this.isMinimized;
      this.root.dataset.minimized = String(this.isMinimized);
      if (this.isMinimized && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        this.speakingMsgId = null;
      }
    }

    setBusy(b) {
      this.busy = !!b;
      this.root.dataset.busy = String(this.busy);
      const ta = this.root.querySelector('#pankrixInput');
      const sb = this.root.querySelector('#pankrixSendBtn');
      const mic = this.root.querySelector('#pxMicBtn');
      const attach = this.root.querySelector('#pxAttachBtn');
      if (ta) ta.disabled = this.busy;
      if (sb) { sb.disabled = this.busy; if (this.busy) sb.classList.remove('MIKASA-send-active'); }
      if (mic) mic.disabled = this.busy;
      if (attach) attach.disabled = this.busy;
    }

    /*  File Handling  */
    async _handleFiles(fileList) {
      if (!fileList || fileList.length === 0) return;
      const strip = this.root.querySelector('#pxFileStrip');

      for (const file of Array.from(fileList)) {
        if (file.size > 10 * 1024 * 1024) { this._toast(` ${file.name} is too large (max 10MB)`); continue; }
        try {
          const data = await fileToBase64(file);
          const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
          this.pendingFiles.push({ name: file.name, mimeType: file.type, data, previewUrl });
        } catch (e) {
          this._toast(` Failed to read ${file.name}`);
        }
      }
      this._renderFileStrip();
      // Activate send button
      const sb = this.root.querySelector('#pankrixSendBtn');
      if (sb && this.pendingFiles.length > 0) sb.classList.add('MIKASA-send-active');
    }

    _renderFileStrip() {
      const strip = this.root.querySelector('#pxFileStrip');
      if (!strip) return;
      if (this.pendingFiles.length === 0) { strip.style.display = 'none'; strip.innerHTML = ''; return; }
      strip.style.display = 'flex';
      strip.innerHTML = this.pendingFiles.map((f, idx) => `
        <div class="px-file-preview">
          ${f.previewUrl ? `<img src="${safeEscAttr(f.previewUrl)}" alt="">` : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`}
          <span class="px-file-preview-name">${safeEsc(f.name)}</span>
          <span class="px-file-remove" data-idx="${idx}" role="button" title="Remove file" aria-label="Remove ${safeEsc(f.name)}"></span>
        </div>`).join('');

      strip.querySelectorAll('.px-file-remove').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.idx);
          if (this.pendingFiles[idx]?.previewUrl) URL.revokeObjectURL(this.pendingFiles[idx].previewUrl);
          this.pendingFiles.splice(idx, 1);
          this._renderFileStrip();
          const sb = this.root.querySelector('#pankrixSendBtn');
          const ta = this.root.querySelector('#pankrixInput');
          if (sb && !ta?.value.trim() && this.pendingFiles.length === 0) sb.classList.remove('MIKASA-send-active');
        });
      });
    }

    /*  Export  */
    _exportChat() {
      if (!this.messages.length) { this._toast('No conversation to export'); return; }
      const lines = [`${CFG.name} - Export`, `Conversation: ${this.activeConv?.name || 'Chat'}`, `Date: ${new Date().toLocaleString()}`, `${'-'.repeat(60)}\n`];
      this.messages.forEach(m => {
        if (m.role === 'user') lines.push(`You [${timeFmt(m.time)}]:\n${m.content}\n`);
        else if (m.role === 'assistant') lines.push(`${CFG.name} [${timeFmt(m.time)}]:\n${m.content}\n`);
        lines.push('-'.repeat(40));
      });
      const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `mikasa-chat-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(a.href);
      this._toast(' Chat exported');
    }

    /*  Summary & Edit  */
    _summarizeChat() {
      if (!this.messages.length) { this._toast('No conversation to summarize'); return; }
      this.sendMessage("Please provide a concise summary of our conversation so far.");
    }

    _editMsg(id) {
      const m = this.messages.find(msg => msg.id === id);
      if (!m) return;
      const ta = this.root.querySelector('#pankrixInput');
      if (ta) {
        ta.value = m.content;
        this._autoResize(ta);
        ta.focus();
        this.editingMsgId = id;
        this._showEditIndicator();
        this.root.querySelector('#pankrixSendBtn')?.classList.add('MIKASA-send-active');
      }
    }

    _showEditIndicator() {
      const strip = this.root.querySelector('#pxEditStrip');
      if (strip) strip.style.display = 'flex';
    }

    _hideEditIndicator() {
      this.editingMsgId = null;
      const strip = this.root.querySelector('#pxEditStrip');
      if (strip) strip.style.display = 'none';
    }

    /*  Voice Input  */
    _toggleMic() {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      const btn = this.root.querySelector('#pxMicBtn');
      if (!SR) { this._toast(' Voice typing not supported in this browser'); return; }
      if (this.isListening) { this.recognition?.stop(); return; }
      try {
        if (!this.recognition) {
          this.recognition = new SR();
          this.recognition.continuous = false;
          this.recognition.interimResults = false;
          this.recognition.lang = navigator.language || 'en-US';
          this.recognition.onstart = () => { this.isListening = true; btn?.classList.add('px-listening'); this._toast(' Listening'); };
          this.recognition.onend = () => { this.isListening = false; btn?.classList.remove('px-listening'); };
          this.recognition.onerror = (e) => {
            this.isListening = false;
            btn?.classList.remove('px-listening');
            if (e.error === 'not-allowed') this._toast(' Microphone permission denied');
            else this._toast('Speech recognition failed. Try again.');
          };
          this.recognition.onresult = (e) => {
            const transcript = e.results[0][0].transcript;
            const ta = this.root.querySelector('#pankrixInput');
            if (ta && transcript) {
              ta.value = (ta.value + ' ' + transcript).trim();
              this._autoResize(ta);
              this.root.querySelector('#pxCharCount').textContent = `${ta.value.length} / 8000`;
              this.root.querySelector('#pankrixSendBtn')?.classList.add('MIKASA-send-active');
              ta.focus();
            }
          };
        }
        this.recognition.start();
      } catch (err) { this._toast('Could not start microphone'); }
    }

    /*  Voice Output  */
    _getCleanText(raw) {
      if (!raw) return '';
      return raw
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[#*_\->`~|]/g, ' ')
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ').trim();
    }

    _toggleSpeak(id, btn) {
      if (!('speechSynthesis' in window)) { this._toast(' Text-to-speech not supported'); return; }
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        if (this.speakingMsgId === id) { this.speakingMsgId = null; btn?.classList.remove('active'); this._toast(' Speech stopped'); return; }
      }
      const msg = this.messages.find(m => m.id === id);
      if (!msg) return;
      const text = this._getCleanText(msg.content);
      if (!text) { this._toast('Nothing to read'); return; }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = navigator.language || 'en-US';
      utterance.onstart = () => { this.speakingMsgId = id; btn?.classList.add('active'); };
      utterance.onend = () => { this.speakingMsgId = null; btn?.classList.remove('active'); };
      utterance.onerror = () => { this.speakingMsgId = null; btn?.classList.remove('active'); };
      window.speechSynthesis.speak(utterance);
    }

    /*  Chat layout helpers  */
    _aiAvatarHTML() {
      return `<div class="px-msg-avatar" aria-hidden="true"><img src="${CFG.logoPath}" alt="" width="32" height="32" loading="lazy"></div>`;
    }

    _dateDividerHTML(iso) {
      return `<div class="px-date-divider" role="separator"><span>${dateFmt(iso)}</span></div>`;
    }

    _shouldShowDateDivider(msgs, idx) {
      if (idx === 0) return true;
      try {
        return new Date(msgs[idx - 1].time).toDateString() !== new Date(msgs[idx].time).toDateString();
      } catch { return false; }
    }

    _actionsHTML(id, isSpeaking = false) {
      return `
      <div class="px-msg-actions">
        <button class="px-action-btn px-copy-msg" data-id="${safeEscAttr(id)}" title="Copy" type="button" aria-label="Copy message">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="14" height="14"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        </button>
        <button class="px-action-btn px-speak-btn${isSpeaking ? ' active' : ''}" data-id="${safeEscAttr(id)}" title="Read aloud" type="button" aria-label="Read aloud">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
        </button>
        <button class="px-action-btn px-regen-btn" title="Regenerate" type="button" aria-label="Regenerate response">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.48"/></svg>
        </button>
        <button class="px-action-btn px-reaction-btn" data-reaction="like" data-id="${safeEscAttr(id)}" title="Good response" type="button" aria-label="Good response"></button>
        <button class="px-action-btn px-reaction-btn" data-reaction="dislike" data-id="${safeEscAttr(id)}" title="Bad response" type="button" aria-label="Bad response"></button>
      </div>`;
    }

    _isNearBottom(threshold = 96) {
      const ct = this.root.querySelector('#pankrixMessages');
      if (!ct) return true;
      return ct.scrollHeight - ct.scrollTop - ct.clientHeight < threshold;
    }

    _updateScrollBtn() {
      const ct = this.root.querySelector('#pankrixMessages');
      const btn = this.root.querySelector('#pxScrollBottom');
      if (!ct || !btn) return;
      const near = this._isNearBottom();
      this.userScrolledUp = !near;
      btn.hidden = near || ct.scrollHeight <= ct.clientHeight + 20;
    }

    /*  Skeleton / typing  */
    _showSkeleton() {
      const ct = this.root.querySelector('#pankrixMessages');
      if (!ct || ct.querySelector('.MIKASA-skeleton')) return;
      const welcome = ct.querySelector('.MIKASA-welcome');
      if (welcome) welcome.remove();
      const div = document.createElement('div');
      div.className = 'MIKASA-msg MIKASA-ai MIKASA-skeleton';
      div.innerHTML = `
        ${this._aiAvatarHTML()}
        <div class="MIKASA-msg-body">
          <div class="px-msg-meta">
            <span class="px-msg-sender">${CFG.name}</span>
            <span class="px-msg-typing-label">typing</span>
          </div>
          <div class="MIKASA-ai-bubble px-typing-bubble">
            <div class="px-typing-indicator" aria-label="${CFG.name} is typing">
              <div class="px-typing-dot"></div>
              <div class="px-typing-dot"></div>
              <div class="px-typing-dot"></div>
            </div>
          </div>
        </div>`;
      ct.appendChild(div);
      this._scrollBottom(true);
    }

    _hideSkeleton() { this.root.querySelector('.MIKASA-skeleton')?.remove(); }

    /*  Submit  */
    _submitInput() {
      const ta = this.root.querySelector('#pankrixInput');
      const text = (ta?.value || '').trim();
      if ((!text && this.pendingFiles.length === 0) || this.busy) return;
      const finalText = text || (this.pendingFiles.length > 0 ? 'Please analyze the attached file(s).' : '');
      ta.value = '';
      this.root.querySelector('#pxCharCount').textContent = '0 / 8000';
      this.root.querySelector('#pankrixSendBtn')?.classList.remove('MIKASA-send-active');
      this._autoResize(ta);
      this.sendMessage(finalText);
    }

    _newChat() {
      this.createConversation();
      this.pendingFiles = [];
      this._renderFileStrip();
      this._renderMessages();
      this._renderSidebar();
      this._saveUIState();
      this.root.querySelector('#pankrixInput')?.focus();
    }

    /*  Send Message  */
    async sendMessage(text) {
      if (!text && this.pendingFiles.length === 0) return;
      if (this.busy) return;

      if (window.speechSynthesis) { window.speechSynthesis.cancel(); this.speakingMsgId = null; }
      this.setOpen(true);
      this._closeModeModal();

      // Detect topics and highlight corresponding nav links
      detectTopicsAndHighlight(text);

      // If we are editing, delete messages from that point forward
      if (this.editingMsgId && this.activeConv) {
        const idx = this.activeConv.messages.findIndex(m => m.id === this.editingMsgId);
        if (idx !== -1) {
          this.activeConv.messages = this.activeConv.messages.slice(0, idx);
        }
        this._hideEditIndicator();
      }

      // Detect mode switch from text
      const detectedMode = detectModeFromText(text);
      if (detectedMode) { this._setMode(detectedMode); }

      // Add user message
      const files = [...this.pendingFiles];
      const userMsg = {
        id: uid(), role: 'user', content: text,
        time: new Date().toISOString(),
        files: files.map(f => ({ name: f.name, previewUrl: f.previewUrl, mimeType: f.mimeType }))
      };

      if (!this.activeConv) this.createConversation();
      this.activeConv.messages.push(userMsg);
      this.autoNameConversation(text);
      this.saveConversations();

      // Clear pending files
      this.pendingFiles = [];
      this._renderFileStrip();

      this.userScrolledUp = false;
      this._renderMessages();
      this._scrollBottom(true);
      this.setBusy(true);
      this._showSkeleton();

      // Build API history
      const hist = this.messages
        .slice(-CFG.MAX_HIST)
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ role: m.role, content: m.content || '' }));

      let streamEl = null;
      let streamText = '';

      await streamGemini(
        this.model, hist, files,
        (chunk, full, isFirst) => {
          this._hideSkeleton();
          if (isFirst || !streamEl) {
            const aiMsg = { id: uid(), role: 'assistant', content: '', time: new Date().toISOString() };
            this.activeConv?.messages.push(aiMsg);
            streamEl = this._appendStreamEl(aiMsg);
          }
          streamText = full;
          const ct = streamEl?.querySelector('.MIKASA-ai-text');
          if (ct) ct.innerHTML = `${renderMarkdown(closeIncompleteTags(full))}<span class="MIKASA-cursor" aria-hidden="true"></span>`;
          this._updateSourcesGrid(streamEl, full);
          this._scrollBottom();
        },
        (full) => {
          this._hideSkeleton();
          const last = [...(this.activeConv?.messages || [])].reverse().find(m => m.role === 'assistant' && !m.content);
          if (last) { last.content = full; this.saveConversations(); }
          if (streamEl) {
            const ct = streamEl.querySelector('.MIKASA-ai-text');
            if (ct) ct.innerHTML = renderMarkdown(full);
            this._updateSourcesGrid(streamEl, full);
            streamEl.classList.remove('MIKASA-streaming');
            // Add action bar
            const actionsEl = this._buildActions(last?.id || uid());
            const bubble = streamEl.querySelector('.MIKASA-ai-bubble');
            if (bubble) bubble.appendChild(actionsEl);
            // Add follow-up chips
            const followUps = generateFollowUps(full);
            if (followUps.length > 0) {
              const chipEl = document.createElement('div');
              chipEl.className = 'px-followups';
              chipEl.innerHTML = followUps.map(f => `<button class="px-followup-chip" type="button" data-q="${safeEscAttr(f)}">${safeEsc(f)}</button>`).join('');
              streamEl.querySelector('.MIKASA-msg-body')?.appendChild(chipEl);
            }
          }
          this.setBusy(false);
          this._scrollBottom();
          this._renderSidebar();
          if (!this.isOpen) {
            const badge = this.root.querySelector('#pankrixUnreadBadge');
            if (badge) badge.textContent = '1';
          }
        },
        (errMsg) => {
          this._hideSkeleton();
          this.activeConv?.messages.push({ id: uid(), role: 'error', content: errMsg, time: new Date().toISOString() });
          this.saveConversations();
          this._renderMessages();
          this.setBusy(false);
          this._scrollBottom();
        }
      );
    }

    _updateSourcesGrid(streamEl, full) {
      if (!streamEl) return;
      const sources = extractSources(full);
      const bubble = streamEl.querySelector('.MIKASA-ai-bubble');
      if (!bubble) return;
      let grid = bubble.querySelector('.px-sources-grid');
      if (sources.length > 0) {
        const html = sources.map((s, i) => `
          <a href="${safeEscAttr(s.url)}" target="_blank" rel="noopener noreferrer" class="px-source-card">
            <span class="px-source-num">${i + 1}</span>
            <div class="px-source-info"><span class="px-source-title">${safeEsc(s.title)}</span><span class="px-source-domain">${safeEsc(s.domain)}</span></div>
          </a>`).join('');
        if (grid) { grid.innerHTML = html; }
        else {
          grid = document.createElement('div');
          grid.className = 'px-sources-grid';
          grid.innerHTML = html;
          const textEl = bubble.querySelector('.MIKASA-ai-text');
          if (textEl) bubble.insertBefore(grid, textEl);
          else bubble.appendChild(grid);
        }
      } else if (grid) { grid.remove(); }
    }

    _retryLast() {
      const msgs = this.activeConv?.messages || [];
      const last = [...msgs].reverse().find(m => m.role === 'user');
      if (!last) return;
      const idx = msgs.lastIndexOf(last);
      if (this.activeConv) {
        this.activeConv.messages = msgs.slice(0, idx + 1);
        this.saveConversations();
      }
      this.sendMessage(last.content);
    }

    _regenerate() {
      const msgs = this.activeConv?.messages || [];
      const lastAI = [...msgs].reverse().find(m => m.role === 'assistant');
      const lastUser = [...msgs].reverse().find(m => m.role === 'user');
      if (!lastUser) return;
      const idx = lastAI ? msgs.lastIndexOf(lastAI) : msgs.length;
      if (this.activeConv) {
        this.activeConv.messages = msgs.slice(0, idx);
        this.saveConversations();
      }
      this.sendMessage(lastUser.content);
    }

    _copyMsg(id) {
      const m = this.messages.find(msg => msg.id === id);
      if (!m) return;
      navigator.clipboard.writeText(m.content)
        .then(() => this._toast('Copied to clipboard'))
        .catch(() => this._toast('Copy failed'));
    }

    _handleReaction(btn) {
      const type = btn.dataset.reaction;
      const parent = btn.closest('.px-msg-actions');
      parent?.querySelectorAll('.px-reaction-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this._toast(type === 'like' ? ' Thanks for the feedback!' : ' We\'ll work on improving!');
    }

    clearChat() {
      if (this.activeConv) {
        this.activeConv.messages = [];
        this.activeConv.name = 'New Chat';
        this.saveConversations();
      }
      this.pendingFiles = [];
      this._renderFileStrip();
      this._renderMessages();
      this._renderSidebar();
      if (window.speechSynthesis) { window.speechSynthesis.cancel(); this.speakingMsgId = null; }
    }

    /*  Render  */
    _renderMessages() {
      const ct = this.root.querySelector('#pankrixMessages');
      if (!ct) return;
      const msgs = this.activeConv?.messages || [];
      if (!msgs.length) {
        ct.innerHTML = this._welcomeHTML();
        this._updateScrollBtn();
        return;
      }
      ct.innerHTML = msgs.map((m, i) => {
        const divider = this._shouldShowDateDivider(msgs, i) ? this._dateDividerHTML(m.time) : '';
        return divider + this._msgHTML(m);
      }).join('');
      // Bind message events via delegation (avoids duplicate handlers)
      setTimeout(() => attachCodeCopyHandlers(), 80);
      requestAnimationFrame(() => {
        this._scrollBottom(true);
        this._updateScrollBtn();
      });
    }

    _welcomeHTML() {
      const suggs = CFG.SUGGESTIONS.map(s => `
        <button class="px-sugg-card" type="button" data-q="${safeEscAttr(s.q)}" aria-label="Suggest: ${safeEsc(s.label)}">
          <span class="px-sugg-icon">${s.icon}</span>
          <span class="px-sugg-label-wrap">
            <span class="px-sugg-title">${safeEsc(s.label)}</span>
            <span class="px-sugg-desc">${safeEsc(s.desc)}</span>
          </span>
        </button>`).join('');

      const caps = CFG.CAPABILITIES.map(c => `<span class="px-welcome-chip"> ${c}</span>`).join('');

      return `
<div class="MIKASA-welcome" role="region" aria-label="Welcome to ${CFG.name}">
  <div class="px-welcome-chat-intro">
    ${this._aiAvatarHTML()}
    <div class="px-welcome-bubble">
      <p class="px-welcome-greeting">Hey! I'm <strong>${CFG.name}</strong> </p>
      <p class="px-welcome-body">Your intelligent portfolio assistant for Sanchit Goyal. Ask me about his projects, skills, career goals, or anything ML &amp; AI related. I'm powered by Gemini and ready to help.</p>
    </div>
  </div>
  <p class="px-welcome-prompt">Quick questions to get started:</p>
  <div class="px-welcome-grid" role="list" aria-label="Suggested conversations">${suggs}</div>
  <div class="px-welcome-chips" aria-label="Capabilities">${caps}</div>
</div>`;
    }

    _msgHTML(msg) {
      if (msg.role === 'error') {
        return `<div class="MIKASA-error-msg" role="alert">
          <span class="px-error-icon"></span>
          <div class="px-error-body">
            <p>Connection issue. This is usually a temporary API rate limit. Please retry in a moment! </p>
            <button class="px-retry-btn" type="button"> Retry</button>
          </div>
        </div>`;
      }
      if (msg.role === 'user') {
        const fileAttachments = (msg.files || []).filter(f => f.previewUrl).map(f =>
          `<img src="${safeEscAttr(f.previewUrl)}" alt="${safeEsc(f.name)}" class="px-attach-thumb">`
        ).join('');
        return `
<div class="MIKASA-msg MIKASA-user" data-id="${safeEscAttr(msg.id)}">
  <div class="MIKASA-msg-body">
    <div class="px-msg-meta px-msg-meta-user">
      <span class="px-msg-time">${timeFmt(msg.time)}</span>
      <span class="px-msg-sender">You</span>
    </div>
    <div class="MIKASA-user-bubble-wrap">
      <div class="MIKASA-user-bubble">
        <div class="MIKASA-user-text">${safeEsc(msg.content)}</div>
        ${fileAttachments ? `<div class="MIKASA-user-attachments">${fileAttachments}</div>` : ''}
      </div>
      <button class="px-user-edit-btn" data-id="${safeEscAttr(msg.id)}" title="Edit message" type="button" aria-label="Edit message">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      </button>
    </div>
  </div>
  <div class="px-msg-avatar px-msg-avatar-user" aria-hidden="true">Y</div>
</div>`;
      }
      // Assistant
      const sources = extractSources(msg.content);
      const sourcesHTML = sources.length > 0 ? `
        <div class="px-sources-grid">
          ${sources.map((s, i) => `
            <a href="${safeEscAttr(s.url)}" target="_blank" rel="noopener noreferrer" class="px-source-card">
              <span class="px-source-num">${i + 1}</span>
              <div class="px-source-info"><span class="px-source-title">${safeEsc(s.title)}</span><span class="px-source-domain">${safeEsc(s.domain)}</span></div>
            </a>`).join('')}
        </div>` : '';

      const followUps = generateFollowUps(msg.content);
      const followHTML = followUps.length > 0 ? `
        <div class="px-followups">
          ${followUps.map(f => `<button class="px-followup-chip" type="button" data-q="${safeEscAttr(f)}">${safeEsc(f)}</button>`).join('')}
        </div>` : '';

      return `
<div class="MIKASA-msg MIKASA-ai" data-id="${safeEscAttr(msg.id)}">
  ${this._aiAvatarHTML()}
  <div class="MIKASA-msg-body">
    <div class="px-msg-meta">
      <span class="px-msg-sender">${CFG.name}</span>
      <span class="px-msg-time">${timeFmt(msg.time)}</span>
    </div>
    <div class="MIKASA-ai-bubble">
      ${sourcesHTML}
      <div class="MIKASA-ai-text">${renderMarkdown(msg.content)}</div>
      ${this._actionsHTML(msg.id, this.speakingMsgId === msg.id)}
    </div>
    ${followHTML}
  </div>
</div>`;
    }

    _buildActions(id) {
      const wrap = document.createElement('div');
      wrap.innerHTML = this._actionsHTML(id);
      const div = wrap.firstElementChild;
      div.querySelector('.px-copy-msg').addEventListener('click', () => this._copyMsg(id));
      div.querySelector('.px-speak-btn').addEventListener('click', (e) => this._toggleSpeak(id, e.currentTarget));
      div.querySelector('.px-regen-btn').addEventListener('click', () => this._regenerate());
      div.querySelectorAll('.px-reaction-btn').forEach(b => b.addEventListener('click', () => this._handleReaction(b)));
      return div;
    }

    _appendStreamEl(msg) {
      const ct = this.root.querySelector('#pankrixMessages');
      if (!ct) return null;
      const div = document.createElement('div');
      div.className = 'MIKASA-msg MIKASA-ai MIKASA-streaming';
      div.dataset.id = msg.id;
      div.innerHTML = `
        ${this._aiAvatarHTML()}
        <div class="MIKASA-msg-body">
          <div class="px-msg-meta">
            <span class="px-msg-sender">${CFG.name}</span>
            <span class="px-msg-time">${timeFmt(msg.time)}</span>
          </div>
          <div class="MIKASA-ai-bubble">
            <div class="MIKASA-ai-text"></div>
          </div>
        </div>`;
      ct.appendChild(div);
      return div;
    }

    _scrollBottom(force = false) {
      const ct = this.root.querySelector('#pankrixMessages');
      if (!ct) return;
      if (!force && this.userScrolledUp && !this._isNearBottom()) return;
      const top = ct.scrollHeight;
      if (force) {
        ct.scrollTo({ top, behavior: 'smooth' });
      } else {
        ct.scrollTop = top;
      }
      requestAnimationFrame(() => {
        ct.scrollTop = ct.scrollHeight;
        this._updateScrollBtn();
      });
    }

    _autoResize(ta) {
      ta.style.height = 'auto';
      ta.style.height = `${Math.min(ta.scrollHeight, 140)}px`;
    }
  }

  /* ============================================================
     INIT
     ============================================================ */
  function init() {
    const ai = new PankrixAI();
    ai.init();
    if (!window.pankrixAI) ai.exposePublicAPI();
    document.querySelectorAll('[data-open-pankrix-ai]').forEach(btn => {
      btn.addEventListener('click', () => ai.setOpen(true));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

