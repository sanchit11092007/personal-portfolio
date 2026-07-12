const portfolioData = {
  assistant: {
    name: "MIKASA",
    meaning: "Named after Mikasa Ackerman from Attack on Titan",
    purpose: "A focused portfolio assistant for Sanchit Goyal's personal website.",
    personality: [
      "professional",
      "friendly",
      "helpful",
      "conversational",
      "approachable"
    ],
    unavailableMessage: "I don't currently have information about that. Feel free to explore the portfolio sections for more details."
  },
  about: {
    name: "Sanchit Goyal",
    headline: "Aspiring Data Scientist, Machine Learning Enthusiast, and AI Research Enthusiast.",
    summary: "Sanchit Goyal is a B.Tech Computer Science Engineering student specializing in Data Science and Machine Learning. His portfolio focuses on artificial intelligence, machine learning, data science, research-minded problem solving, and practical frontend AI experiences.",
    identity: [
      "Aspiring Data Scientist",
      "Machine Learning Enthusiast",
      "AI Research Enthusiast"
    ],
    strengths: [
      "Analytical thinking",
      "Project-based learning",
      "Research curiosity",
      "Problem solving",
      "Continuous improvement"
    ],
    interests: [
      "Artificial Intelligence",
      "Machine Learning",
      "Data Science",
      "Deep Learning",
      "Generative AI",
      "Python Development",
      "Research",
      "Problem Solving",
      "Hackathons",
      "Open Source"
    ]
  },
  education: {
    degree: "B.Tech in Computer Science Engineering",
    specialization: "Data Science and Machine Learning",
    institution: "Lovely Professional University",
    status: "In progress",
    startDate: "August 2025"
  },
  skills: {
    programming: [
      "Python",
      "SQL",
      "JavaScript",
      "C++",
      "Java",
      "R"
    ],
    dataScience: [
      "NumPy",
      "Pandas",
      "Matplotlib",
      "Seaborn",
      "Excel",
      "Google Sheets",
      "Power BI",
      "Exploratory Data Analysis",
      "Data Cleaning",
      "Feature Engineering"
    ],
    machineLearning: [
      "Scikit-learn",
      "Machine Learning foundations",
      "Deep Learning fundamentals",
      "Neural Networks",
      "Generative AI",
      "Prompt Engineering",
      "Model evaluation"
    ],
    tools: [
      "Git",
      "GitHub",
      "VS Code",
      "Jupyter Notebook",
      "Google Colab",
      "Kaggle",
      "Canva",
      "Figma"
    ]
  },
  projects: {
    categories: [
      { id: "ai-ml",          title: "AI & Machine Learning",             icon: "fa-solid fa-brain" },
      { id: "data-science",   title: "Data Science",                      icon: "fa-solid fa-chart-line" },
      { id: "programming",    title: "Programming & Software Development", icon: "fa-solid fa-code" },
      { id: "future",         title: "Future Projects",                   icon: "fa-solid fa-rocket" }
    ],
    items: [
      {
        category: "data-science",
        title: "Pure Python Data Cleaning Recommendation Engine",
        description: "Developed a recommendation engine using pure Python focused on data cleaning and preprocessing workflows. The project analyzes dataset characteristics and recommends suitable data cleaning strategies such as handling missing values, duplicate records, inconsistent formatting, and outlier treatment.",
        features: [
          "Automated data quality assessment",
          "Missing value handling recommendations",
          "Duplicate data detection",
          "Outlier identification support",
          "Rule-based recommendation generation",
          "Pure Python implementation"
        ],
        techStack: ["Python", "Data Cleaning", "Data Preprocessing", "Data Analysis", "Recommendation Logic", "CSV Processing"],
        image: "assets/images/project-data-cleaning.png",
        codeUrl: "https://github.com/sanchit11092007/Pure-Python-Data-Cleaning-Recommendation-Engine"
      },
      {
        category: "data-science",
        title: "Credit Banking Customer Analysis",
        description: "Performed exploratory data analysis on banking customer data to identify customer behavior patterns, financial trends, and key business insights. Focuses on transforming raw banking data into meaningful visualizations and actionable insights for customer segmentation and financial analysis.",
        features: [
          "Exploratory Data Analysis (EDA)",
          "Customer behavior analysis",
          "Data visualization",
          "Trend identification",
          "Business insight generation",
          "Statistical data exploration"
        ],
        techStack: ["Python", "Pandas", "NumPy", "Matplotlib", "Seaborn", "Data Visualization", "Exploratory Data Analysis"],
        image: "assets/images/project-banking-analysis.png",
        codeUrl: "https://github.com/sanchit11092007/Credit-Banking-Analysis"
      }
    ],
    plannedAreas: [
      "Predictive Modeling",
      "Natural Language Processing",
      "Deep Learning",
      "Computer Vision",
      "MLOps & Deployment",
      "AI Research"
    ]
  },
  certifications: {
    verified: [
      {
        category: "other",
        name: "Generative AI Foundation",
        issuer: "upGrad",
        issueDate: "2025",
        description: "Completed foundational training in Generative Artificial Intelligence, covering large language models, prompt engineering fundamentals, AI applications, ethical AI considerations, and modern generative AI workflows.",
        skills: ["Generative AI", "Large Language Models", "Prompt Engineering", "AI Fundamentals", "Responsible AI", "AI Applications"],
        image: "assets/images/cert-generative-ai.jpg",
        verificationUrl: "https://www.upgrad.com/"
      },
      {
        category: "other",
        name: "Power BI",
        issuer: "upGrad",
        issueDate: "2025",
        description: "Completed practical training in business intelligence and data visualization using Power BI. Learned dashboard creation, report development, data transformation, KPI monitoring, and business analytics workflows.",
        skills: ["Power BI", "Data Visualization", "Business Intelligence", "Dashboard Design", "Data Analytics", "Reporting"],
        image: "assets/images/cert-power-bi.jpeg",
        verificationUrl: "https://www.upgrad.com/"
      },
      {
        category: "other",
        name: "Web Scraping",
        issuer: "upGrad",
        issueDate: "2026",
        description: "Completed training in web scraping techniques for extracting, collecting, and processing data from websites using Python-based tools and automation workflows.",
        skills: ["Web Scraping", "Python", "BeautifulSoup", "Data Collection", "HTML Parsing", "Data Extraction"],
        image: "assets/images/cert-web-scraping.png",
        verificationUrl: "https://www.upgrad.com/"
      },
      {
        category: "other",
        name: "Ultimate Job Ready Data Science Course",
        issuer: "Code with Harry",
        issueDate: "2026",
        description: "Completed comprehensive training in Data Science, including Python, machine learning, data cleaning, exploratory data analysis, Pandas, NumPy, and predictive modeling.",
        skills: ["Data Science", "Python", "Machine Learning", "Data Analysis", "Pandas", "NumPy"],
        image: "assets/images/cert-cwh-data-science.png",
        verificationUrl: "https://www.codewithharry.com/"
      },
      {
        category: "other",
        name: "Python Bootcamp Course",
        issuer: "Code with Harry",
        issueDate: "2025",
        description: "Completed intense Python programming bootcamp covering standard syntax, algorithms, object-oriented programming, data structures, and software design principles.",
        skills: ["Python Programming", "Algorithms", "Object-Oriented Programming", "Data Structures"],
        image: "assets/images/cert-cwh-python.png",
        verificationUrl: "https://www.codewithharry.com/"
      },
      {
        category: "other",
        name: "Web - Development Course",
        issuer: "Code with Harry",
        issueDate: "2026",
        description: "Completed full course in web development, covering HTML5, CSS3, JavaScript ES6+, responsive web layouts, frontend system architectures, and modern UI practices.",
        skills: ["HTML5", "CSS3", "JavaScript", "Responsive Design", "Frontend Development"],
        image: "assets/images/cert-cwh-web-dev.png",
        verificationUrl: "https://www.codewithharry.com/"
      }
    ],
    note: "I don't currently have information about that. Feel free to explore the portfolio sections for more details.",
    learningTracks: [
      "Artificial Intelligence and Machine Learning",
      "Data Science",
      "Programming and Development",
      "Foundational technical learning"
    ]
  },

  achievements: {
    verified: [],
    note: "I don't currently have information about that. Feel free to explore the portfolio sections for more details."
  },
  goals: {
    career: [
      "Become a successful Data Scientist",
      "Build impactful AI products",
      "Contribute to AI research",
      "Continuously learn and improve"
    ],
    currentFocus: [
      "Data Structures and Algorithms",
      "Machine Learning foundations",
      "Data Science practice",
      "Frontend AI experiences",
      "Practical project development"
    ],
    aspirations: "Sanchit aims to grow into roles where he can combine strong data foundations, machine learning, research curiosity, and practical engineering to build useful AI systems."
  },
  contact: {
    email: "contact.sanchitgoyal@gmail.com",
    location: "India",
    phone: "Available on request",
    availability: "Open to internship opportunities, AI/ML collaborations, Data Science projects, research discussions, and meaningful technology conversations.",
    links: [
      {
        label: "LinkedIn",
        icon: "linkedin",
        url: "https://www.linkedin.com/in/the-sanchit-goyal",
        tone: "blue",
        priority: true
      },
      {
        label: "GitHub",
        icon: "github",
        url: "https://github.com/sanchit11092007",
        tone: "cyan",
        priority: true
      },
      {
        label: "Kaggle",
        icon: "kaggle",
        url: "https://www.kaggle.com/sanchitgoyal2007",
        tone: "cyan"
      },
      {
        label: "LeetCode",
        icon: "leetcode",
        url: "https://leetcode.com/u/sanchit11092007/",
        tone: "amber"
      },
      {
        label: "HackerRank",
        icon: "hackerrank",
        url: "https://www.hackerrank.com/profile/Sanchit11092007",
        tone: "green"
      },
      {
        label: "Codeforces",
        icon: "codeforces",
        url: "https://codeforces.com/profile/sanchit11092007",
        tone: "purple"
      },
      {
        label: "Medium",
        icon: "medium",
        url: "https://medium.com/@sanchitgoyal11092007",
        tone: "neutral"
      },
      {
        label: "DEV Community",
        icon: "dev",
        url: "https://dev.to/sanchit_goyal",
        tone: "neutral"
      },
      {
        label: "X",
        icon: "xbrand",
        url: "https://x.com/iamsanchitgoyal",
        tone: "purple"
      },
      {
        label: "Portfolio Website",
        icon: "portfolio",
        url: "https://sanchit11092007.github.io/personal-portfolio/",
        tone: "purple"
      }
    ]
  },
  suggestedQuestions: [
    "Tell me about Sanchit",
    "Show his projects",
    "What are his technical skills?",
    "What certifications does he have?",
    "Why Data Science?",
    "What are his career goals?",
    "How can I contact him?"
  ]
};

window.portfolioData = portfolioData;

window.PORTFOLIO_DATA = {
  owner: {
    name: portfolioData.about.name,
    email: portfolioData.contact.email,
    location: portfolioData.contact.location,
    roles: portfolioData.about.identity,
    education: `${portfolioData.education.degree}, ${portfolioData.education.specialization} specialization`
  },
  socialLinks: portfolioData.contact.links,
  skills: [
    {
      category: "Programming Languages",
      description: "Core code fluency for data analysis, portfolio interfaces, and algorithm practice.",
      items: portfolioData.skills.programming.map((name, index) => ({
        name,
        proficiency: [55, 45, 35, 25, 15, 5][index] || 10
      }))
    },
    {
      category: "Data Science & Machine Learning",
      description: "Foundational tools for data preparation, exploration, and model experimentation.",
      items: [
        ...portfolioData.skills.dataScience.slice(0, 7),
        ...portfolioData.skills.machineLearning.slice(0, 4)
      ].map((name, index) => ({
        name,
        proficiency: [60, 60, 35, 30, 45, 40, 20, 25, 25, 15, 12][index] || 10
      }))
    },
    {
      category: "AI & Deep Learning",
      description: "Emerging AI topics Sanchit is actively learning through research and projects.",
      items: portfolioData.skills.machineLearning.map((name, index) => ({
        name,
        proficiency: [15, 18, 12, 12, 15, 20, 15][index] || 10
      }))
    },
    {
      category: "Tools & Platforms",
      description: "Practical tools used for coding, notebooks, collaboration, and visual work.",
      items: portfolioData.skills.tools.map((name, index) => ({
        name,
        proficiency: [45, 45, 45, 35, 35, 25, 20, 15][index] || 10
      }))
    }
  ],
  projects: portfolioData.projects.items,
  projectCategories: portfolioData.projects.categories,
  plannedProjectAreas: portfolioData.projects.plannedAreas,
  certificationCategories: [
    {
      id: "ml-ai",
      title: "Artificial Intelligence & Machine Learning"
    },
    {
      id: "data-science",
      title: "Data Science"
    },
    {
      id: "development",
      title: "Programming & Development"
    },
    {
      id: "other",
      title: "Other Certifications"
    }
  ],
  certifications: portfolioData.certifications.verified,
  developerActivity: {
    filters: [
      { id: "all", title: "All" },
      { id: "professional", title: "Professional" },
      { id: "code", title: "Code" },
      { id: "writing", title: "Writing" },
      { id: "data", title: "Data" },
      { id: "practice", title: "Practice" }
    ],
    platforms: [
      {
        label: "LinkedIn",
        icon: "fa-brands fa-linkedin-in",
        url: "https://www.linkedin.com/in/the-sanchit-goyal",
        signal: "Professional updates",
        description: "Career milestones, internship readiness, learning updates, and professional networking.",
        tone: "blue",
        categories: ["professional"]
      },
      {
        label: "GitHub",
        icon: "fa-brands fa-github",
        url: "https://github.com/sanchit11092007",
        signal: "Repository progress",
        description: "Project repositories, source code, commits, and practical development work.",
        tone: "cyan",
        categories: ["code"]
      },
      {
        label: "Medium",
        icon: "fa-brands fa-medium",
        url: "https://medium.com/@sanchitgoyal11092007",
        signal: "Writing log",
        description: "Technical writing, learning reflections, and long-form development notes.",
        tone: "neutral",
        categories: ["writing"]
      },
      {
        label: "DEV Community",
        icon: "fa-brands fa-dev",
        url: "https://dev.to/sanchit_goyal",
        signal: "Developer posts",
        description: "Frontend, programming, AI, and data science notes shared with developer communities.",
        tone: "green",
        categories: ["writing", "code"]
      },
      {
        label: "Kaggle",
        icon: "fa-brands fa-kaggle",
        url: "https://www.kaggle.com/sanchitgoyal2007",
        signal: "Data science practice",
        description: "Datasets, notebooks, analytics practice, and data science learning activity.",
        tone: "cyan",
        categories: ["data", "practice"]
      },
      {
        label: "LeetCode",
        icon: "fa-solid fa-code",
        url: "https://leetcode.com/u/sanchit11092007/",
        signal: "Problem solving",
        description: "DSA practice and algorithmic problem-solving progress.",
        tone: "amber",
        categories: ["practice", "code"]
      },
      {
        label: "HackerRank",
        icon: "fa-brands fa-hackerrank",
        url: "https://www.hackerrank.com/profile/Sanchit11092007",
        signal: "Coding practice",
        description: "Programming challenges, foundations, and skill-building exercises.",
        tone: "green",
        categories: ["practice", "code"]
      },
      {
        label: "Codeforces",
        icon: "fa-solid fa-terminal",
        url: "https://codeforces.com/profile/sanchit11092007",
        signal: "Competitive coding",
        description: "Contest practice, algorithmic thinking, and problem-solving discipline.",
        tone: "purple",
        categories: ["practice", "code"]
      }
    ],
    logs: [
      {
        platform: "GitHub",
        status: "Project repositories",
        detail: "Data cleaning and banking analysis projects document hands-on data science practice.",
        cadence: "Active"
      },
      {
        platform: "LinkedIn",
        status: "Professional profile",
        detail: "Public career profile for internships, collaborations, and professional updates.",
        cadence: "Public"
      },
      {
        platform: "Medium and DEV",
        status: "Writing channels",
        detail: "Technical writing spaces for learning notes, AI exploration, and developer reflections.",
        cadence: "Growing"
      },
      {
        platform: "Coding profiles",
        status: "Problem solving",
        detail: "LeetCode, HackerRank, and Codeforces collect DSA and programming practice signals.",
        cadence: "In progress"
      }
    ]
  },
  goals: portfolioData.goals,
  achievements: portfolioData.achievements,
  chatbot: {
    suggestedQuestions: portfolioData.suggestedQuestions
  }
};
