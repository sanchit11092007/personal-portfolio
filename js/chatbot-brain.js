/**
 * Sanchit Goyal Portfolio — Chatbot Brain
 * A conversational AI engine with intent detection, response pools,
 * variation randomisation, and basic conversation memory.
 */

(function () {
  "use strict";

  /* ─────────────────────────────────────────────
     1.  KNOWLEDGE BANK  (response pools per intent)
  ───────────────────────────────────────────── */
  const KB = {

    greeting: {
      patterns: [/\b(hi|hello|hey|howdy|yo|sup|hiya|good\s*(morning|evening|afternoon))\b/i],
      responses: [
        "Hey! 👋 I'm Sanchit's AI assistant. You can ask me about his skills, projects, education, or career goals — I've got it all covered.",
        "Hello! Welcome to Sanchit's portfolio. Feel free to ask about his technical skills, AI/ML journey, projects, or anything else you're curious about.",
        "Hi there! I can walk you through Sanchit's background, skills, certifications, and projects. What would you like to know?",
        "Hey! Great to have you here. Ask me anything — from Sanchit's Python proficiency to his career aspirations."
      ]
    },

    introduction: {
      patterns: [
        /\b(who is|who's|tell me about|about him|about sanchit|introduce|what does he do|what do you know about|know about him|overview|summary|bio)\b/i,
        /^(him|he|sanchit)\??$/i
      ],
      responses: [
        "Sanchit Goyal is a Computer Science Engineering student at Lovely Professional University (LPU), specialising in Data Science, Machine Learning, and Artificial Intelligence. He focuses on building practical AI-driven projects and modern web experiences.",
        "Sanchit is a B.Tech CSE student passionate about turning data into intelligent systems. His primary focus areas are Machine Learning, Data Science, and frontend development, and he actively builds projects to sharpen those skills.",
        "He is an aspiring AI/ML Engineer currently pursuing B.Tech CSE at LPU. Sanchit combines strong data science fundamentals with hands-on project work across Python, visualization, and modern web technologies.",
        "Sanchit Goyal is a dedicated developer and data enthusiast. He's building his career at the intersection of AI, Data Science, and full-stack web development — always driven by a desire to solve real-world problems.",
        "Sanchit is a tech-driven CSE student who blends AI/ML theory with practical execution. He's based at Lovely Professional University and is working toward a professional role as an AI or Data Science Engineer."
      ]
    },

    education: {
      patterns: [
        /\b(education|college|university|lpu|lovely professional|b\.?tech|btech|degree|study|studying|enrolled|academic|semester|cse|computer science)\b/i
      ],
      responses: [
        "Sanchit is currently pursuing a B.Tech in Computer Science Engineering at Lovely Professional University (LPU), with a specialisation in Data Science and Machine Learning.",
        "He is a B.Tech CSE student at LPU — Lovely Professional University. His academic focus centres on Artificial Intelligence, Data Science, and Machine Learning alongside core computer science subjects.",
        "Sanchit's academic background is in Computer Science Engineering at LPU. He has chosen to specialise in Data Science and AI, which directly informs the projects and tools he works with.",
        "His degree is a B.Tech in CSE from Lovely Professional University. The programme's AI/ML specialisation track aligns perfectly with his goal of becoming a Data Science or AI engineer."
      ]
    },

    skills_general: {
      patterns: [
        /\b(skills|tech stack|what can he do|capabilities|technologies|expertise|proficient|knows|good at|strong at|technical)\b/i,
        /^(skills)\??$/i
      ],
      responses: [
        "Sanchit's technical stack spans Python, SQL, C/C++, Data Science libraries (Pandas, NumPy, Scikit-learn), data visualisation tools (Matplotlib, Seaborn, Plotly, Power BI), and platforms like Git, Docker, and Firebase.",
        "He is skilled across multiple domains — Python for AI/Data Science, SQL for databases, modern JS frameworks for frontend, and tools like Docker, Git, and Postman for development workflows.",
        "His skill set includes strong Python programming, data manipulation with Pandas and NumPy, machine learning basics with Scikit-learn, and data visualisation. On the tools side, he's comfortable with Git, VS Code, Jupyter, and Docker.",
        "Sanchit's capabilities range from data science workflows and EDA to frontend development and API integration. He's a versatile developer who bridges the gap between analytics and engineering.",
        "He is currently focused on AI, Data Science, ML fundamentals, and responsive web development. His core technical skills include Python, SQL, Pandas, NumPy, and data visualisation libraries."
      ]
    },

    python: {
      patterns: [
        /\b(python|py\b|python level|how good.*python|python proficiency)\b/i
      ],
      responses: [
        "Python is one of Sanchit's primary programming languages. He uses it extensively for Data Science workflows, exploratory data analysis, building ML models, and automation scripts.",
        "He rates himself at around 70% proficiency in Python. Sanchit regularly works with Python's data science ecosystem — including Pandas, NumPy, Matplotlib, and Scikit-learn — for real project work.",
        "Sanchit is quite solid in Python. It's his go-to language for ML experiments, EDA notebooks, and backend scripting. He's well-versed with libraries across data manipulation, visualisation, and machine learning.",
        "Python sits at the core of Sanchit's technical toolkit. From writing Jupyter notebooks for analysis to building automation tools and ML pipelines, he leverages Python daily in his learning and projects."
      ]
    },

    sql: {
      patterns: [/\b(sql|database|mysql|queries|relational)\b/i],
      responses: [
        "Sanchit has solid SQL skills with around 50% proficiency. He uses SQL for data querying, database management, and integrating relational data into his projects.",
        "He is comfortable working with SQL for structured data tasks — writing complex queries, aggregating datasets, and connecting databases to his data pipelines.",
        "SQL is part of his data toolkit. Sanchit applies it regularly for backend data access and analytics tasks."
      ]
    },

    ml_ai: {
      patterns: [
        /\b(machine learning|ml|artificial intelligence|ai|deep learning|neural|scikit|sklearn|regression|classification|clustering|eda|data science|data analysis|nlp|computer vision)\b/i
      ],
      responses: [
        "Sanchit is deeply passionate about AI and Machine Learning. He works with Scikit-learn for supervised learning tasks, and has studied regression, classification, clustering, and EDA techniques.",
        "His AI/ML journey includes hands-on work with data cleaning, exploratory data analysis, and building predictive models using Python's scientific stack. He is currently expanding into more advanced ML concepts.",
        "Machine Learning is his primary area of focus. Sanchit has applied ML fundamentals in project work — from data preprocessing and feature engineering to model building and evaluation using Scikit-learn.",
        "He has studied and applied core ML concepts including regression, classification, and clustering. He works with real datasets to practice EDA and model development, and is growing into more advanced AI topics.",
        "Sanchit's Data Science background means he approaches AI problems methodically — clean data first, then rigorous EDA, then model selection. He is actively building real projects to solidify his ML skills."
      ]
    },

    visualization: {
      patterns: [
        /\b(visuali[sz]ation|matplotlib|seaborn|plotly|power bi|charts|graphs|dashboard|analytics|reporting)\b/i
      ],
      responses: [
        "For data visualisation, Sanchit uses Matplotlib and Seaborn for Python-based charts, Plotly for interactive graphics, and Power BI for creating business intelligence dashboards.",
        "He is skilled in translating raw data into clear visual stories. Sanchit applies Seaborn and Matplotlib for EDA visualisations and Power BI for structured reporting and dashboards.",
        "Sanchit's visualisation toolkit includes Matplotlib, Seaborn, Plotly, and Power BI. He uses these regularly when presenting data insights in his projects and analyses."
      ]
    },

    tools: {
      patterns: [
        /\b(tools|platforms|git|github|docker|linux|vscode|vs code|jupyter|colab|google colab|postman|anaconda|firebase|mongodb|netlify|vercel|streamlit|flask|hugging face|kaggle|figma|canva)\b/i,
        /\bwhat tools\b/i
      ],
      responses: [
        "Sanchit works with a modern development toolset: Git & GitHub for version control, Docker for containerisation, VS Code and Jupyter for development, and Postman for API testing.",
        "His platform experience covers Google Colab, Jupyter Notebook, Kaggle, and Hugging Face for AI/ML work — plus Firebase, MongoDB, Netlify, and Vercel for web development and deployment.",
        "He uses tools spanning data science (Jupyter, Colab, Anaconda, Kaggle) and full development (Git, Docker, Postman, Linux, VS Code). On the AI side, he leverages Hugging Face and Streamlit for model demos.",
        "Sanchit's toolbox is well-rounded — Git for source control, Docker for environment management, Firebase and MongoDB for databases, and Netlify/Vercel for hosting and deployment."
      ]
    },

    projects: {
      patterns: [
        /\b(project|projects|built|building|portfolio project|github project|what has he made|what did he build|show projects|work)\b/i,
        /^(projects|work)\??$/i
      ],
      responses: [
        "Sanchit's projects span AI-integrated applications, data science analyses, automation tools, and modern web development. His portfolio showcases hands-on work that bridges theory and real-world application.",
        "He has built responsive portfolio websites, AI-integrated tools, data analysis notebooks, and backend-connected web applications. Every project reflects his drive to create practical and visually polished solutions.",
        "Sanchit actively builds projects to grow his skills — from EDA and ML notebooks to full-stack web applications. You can explore his work directly in the Projects section of this portfolio.",
        "His project portfolio reflects a blend of Data Science, AI, and web development. He focuses on building things that solve real problems rather than just academic exercises.",
        "Sanchit builds projects across Data Science, ML, and web development. Check out the Projects section above for a detailed look at his hands-on work and technical execution."
      ]
    },

    frontend: {
      patterns: [
        /\b(frontend|front-end|front end|web dev|website|ui|ux|html|css|javascript|js|react|responsive|design)\b/i,
        /\bis he (a )?frontend\b/i
      ],
      responses: [
        "Yes, Sanchit is also a frontend developer. He builds modern, responsive websites with clean UI/UX, using HTML, CSS, JavaScript, and modern design principles. This very portfolio is a testament to that.",
        "Sanchit has strong frontend development skills. He creates visually premium, responsive web interfaces — focusing on glassmorphism, animations, and mobile-friendly layouts.",
        "He's not just a data guy — Sanchit builds polished frontend experiences too. His web projects feature modern aesthetics, smooth animations, and performance-optimised code.",
        "Sanchit's frontend work emphasises clean visual hierarchy, micro-animations, and responsive design. He bridges the gap between data engineering and user-facing product development."
      ]
    },

    backend: {
      patterns: [
        /\b(backend|back-end|back end|api|flask|server|node|database integration|rest)\b/i
      ],
      responses: [
        "Sanchit has backend exposure through Flask for Python-based APIs, Firebase and MongoDB for data storage, and Docker for containerised environments.",
        "He has worked with backend technologies including Flask, REST API integration, Firebase, and MongoDB. His focus is growing in this area alongside his primary AI/Data Science stack.",
        "On the backend side, Sanchit has experience with Flask, Firebase, and MongoDB — enough to connect his data science models to real-world applications and deploy them."
      ]
    },

    goals: {
      patterns: [
        /\b(goal|goals|aim|ambition|future|aspire|aspiration|career|plan|want to be|dream|target|objective|internship)\b/i,
        /^(goals?|career)\??$/i
      ],
      responses: [
        "Sanchit's primary career goal is to work as an AI Engineer or Data Scientist — building intelligent systems that create genuine real-world impact.",
        "His ambition is to specialise in Artificial Intelligence and Machine Learning at a professional level. He is actively building projects, strengthening his fundamentals, and preparing for internship and full-time opportunities.",
        "Sanchit aims to be at the intersection of AI research and product development. He wants to create AI-driven applications that are both technically sophisticated and practically useful.",
        "He is laser-focused on becoming a Machine Learning Engineer or AI/Data Science specialist. Every project, course, and skill he builds is a step toward that long-term goal.",
        "His near-term goal is to secure a high-quality internship in Data Science or AI, gain industry exposure, and eventually grow into a full-time AI Engineering role."
      ]
    },

    certifications: {
      patterns: [
        /\b(certif|certificate|certified|course|courses|credential|udemy|coursera|nptel|badge)\b/i
      ],
      responses: [
        "Sanchit has pursued certifications in Data Science, Machine Learning, and AI topics to complement his university education. You can view them in the Certifications section of this portfolio.",
        "He actively takes structured courses to accelerate his learning beyond the classroom. His certifications cover areas like Python, ML fundamentals, data analysis, and AI development.",
        "Sanchit believes in continuous learning. Alongside his B.Tech degree, he has earned certifications in key areas of Data Science and Artificial Intelligence. Check the Certifications section for full details!"
      ]
    },

    contact: {
      patterns: [
        /\b(contact|reach|hire|email|linkedin|connect|get in touch|message|available)\b/i,
        /\b(resume|cv|download)\b/i
      ],
      responses: [
        "You can get in touch with Sanchit through the Contact section of this portfolio. He is also active on LinkedIn and GitHub.",
        "Sanchit is open to internship opportunities, collaborations, and professional connections. Use the contact form on this page or reach out directly via LinkedIn.",
        "His resume is available for download in the Resume section of this portfolio. For direct communication, you can use the contact form or connect on LinkedIn.",
        "Feel free to reach out — Sanchit is currently looking for internship and project collaboration opportunities in AI, Data Science, and software development."
      ]
    },

    strength: {
      patterns: [
        /\b(strong|strongest|best skill|core skill|main skill|top skill|speciality)\b/i
      ],
      responses: [
        "Sanchit's strongest areas are Python programming, Data Science with Pandas and NumPy, and exploratory data analysis. These form the core of his technical identity.",
        "His strongest suit is the end-to-end data science workflow — from raw data cleaning and EDA to building and evaluating machine learning models in Python.",
        "Data Science and Python are where Sanchit truly shines. He combines clean analytical thinking with practical coding skills to deliver well-structured, insightful data projects."
      ]
    },

    learning: {
      patterns: [
        /\b(currently learning|learning now|studying now|improving|growing|what is he learning|latest learning)\b/i
      ],
      responses: [
        "Sanchit is currently deepening his understanding of Machine Learning — working through advanced EDA, feature engineering, and model evaluation techniques.",
        "He is actively expanding his AI knowledge, exploring Hugging Face models, improving his Scikit-learn proficiency, and experimenting with Streamlit for deploying ML apps.",
        "Right now, Sanchit is focused on bridging the gap between data science fundamentals and applied AI — learning how to deploy models, work with APIs, and build production-ready ML workflows."
      ]
    },

    goodbye: {
      patterns: [
        /\b(bye|goodbye|see you|cya|thanks|thank you|that's all|nothing else|exit|done|quit)\b/i
      ],
      responses: [
        "Thanks for stopping by! Feel free to reach out to Sanchit directly if you'd like to connect. Have a great day! 👋",
        "It was great chatting! Don't hesitate to come back if you have more questions about Sanchit's work. 😊",
        "Goodbye! Sanchit appreciates your interest in his portfolio. Hope to see you again!",
        "Thanks for the conversation! If you are a recruiter or collaborator, do use the Contact section — Sanchit would love to hear from you."
      ]
    }
  };

  /* ─────────────────────────────────────────────
     2.  FALLBACK POOL
  ───────────────────────────────────────────── */
  const FALLBACKS = [
    "That's an interesting question! Try asking about Sanchit's skills, projects, education, or AI/ML journey — the assistant has detailed answers ready.",
    "The assistant didn't quite catch that. You could rephrase, or ask something like: 'What are his skills?', 'Tell me about his projects', or 'What are his career goals?'",
    "Hmm, could you be a bit more specific? For instance, you could ask about Python, Data Science, certifications, tools, or his career goals.",
    "Not sure exactly what you meant there — but feel free to explore topics like education, ML skills, frontend work, or how to contact Sanchit.",
    "Try asking about something specific: his university, a programming language, a project category, or what kind of developer he is. I've got detailed answers ready!"
  ];

  /* ─────────────────────────────────────────────
     3.  HELPERS
  ───────────────────────────────────────────── */
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // Basic conversation memory — track last category to avoid instant repeats
  let lastCategory = null;
  let lastResponseIndex = {};

  const getVariedResponse = (category, pool) => {
    if (!lastResponseIndex[category]) lastResponseIndex[category] = -1;
    let idx;
    do {
      idx = Math.floor(Math.random() * pool.length);
    } while (pool.length > 1 && idx === lastResponseIndex[category]);
    lastResponseIndex[category] = idx;
    return pool[idx];
  };

  /* ─────────────────────────────────────────────
     4.  INTENT RESOLVER
  ───────────────────────────────────────────── */
  const resolveIntent = (input) => {
    for (const [category, data] of Object.entries(KB)) {
      for (const pattern of data.patterns) {
        if (pattern.test(input)) {
          lastCategory = category;
          return getVariedResponse(category, data.responses);
        }
      }
    }
    return pick(FALLBACKS);
  };

  /* ─────────────────────────────────────────────
     5.  UI ENGINE  (attached to window for main.js)
  ───────────────────────────────────────────── */
  window.ChatbotBrain = { resolveIntent };

})();
