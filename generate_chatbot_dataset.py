import json
import itertools
import random
import os

# Define core synonyms and variations
PREFIXES = [
    "tell me about", "what do you know about", "give me details on", "explain",
    "what is", "where is", "do you know if", "i want to know about", "info on",
    "details about", "can you tell me", "can you explain", "what's", "whats",
    "any idea about", "does", "is", "can", "how about", "what about",
    "pls tell", "abt", "know anything bout", "wht", "plz share", "tell me abt",
    "briefly explain", "describe", "elaborate on", "anything on", ""
]

SUBJECTS = [
    "Sanchit", "Sanchit Goyal", "he", "him", "this guy", "the developer", 
    "the creator", "bro", "Sanchit's", "his", "the dev", "sanchit", "he's"
]

QUESTION_TEMPLATES = [
    "{prefix} {subject} {topic}",
    "{prefix} {topic} of {subject}",
    "{subject} {topic}",
    "{topic} {subject}",
    "does {subject} know {topic}",
    "is {subject} good at {topic}",
    "what {topic} does {subject} use",
    "how is {subject} in {topic}",
    "{topic} level of {subject}",
    "{topic} skills of {subject}",
    "does {subject} do {topic}",
    "can {subject} work with {topic}",
    "has {subject} worked on {topic}",
    "{subject} experience in {topic}"
]

KNOWLEDGE_BASE = [
    {
        "category": "Personal & Education",
        "topics": ["LPU", "Lovely Professional University", "university", "college", "degree", "B.Tech", "btech", "b.tech cse", "computer science", "education", "studies", "studying"],
        "answers": [
            "Sanchit is currently pursuing his B.Tech in Computer Science Engineering at Lovely Professional University (LPU).",
            "He studies Computer Science Engineering at LPU, specializing in Data Science and Machine Learning.",
            "Sanchit Goyal is a B.Tech CSE student at Lovely Professional University, with a strong focus on AI."
        ]
    },
    {
        "category": "Personal & Education",
        "topics": ["specialization", "major", "field", "focus area", "what does he study", "specialty"],
        "answers": [
            "His specialization is in Data Science, Machine Learning, and Artificial Intelligence.",
            "Sanchit specializes deeply in Data Science and ML alongside his core Computer Science studies.",
            "He focuses primarily on Artificial Intelligence, Data Science, and ML."
        ]
    },
    {
        "category": "Skills - Python",
        "topics": ["Python", "python 3", "py", "python programming", "python skills", "coding in python"],
        "answers": [
            "Sanchit is highly proficient in Python, specifically utilizing it for Data Science, Machine Learning, and backend automation.",
            "He has a strong command over Python and uses it as his primary language for AI and data-related tasks.",
            "Python is his main programming language. He builds machine learning models, automation scripts, and data pipelines with it."
        ]
    },
    {
        "category": "Skills - SQL",
        "topics": ["SQL", "databases", "mysql", "queries", "database management", "sql skills"],
        "answers": [
            "He is skilled in SQL for database management, data querying, and backend integration.",
            "Sanchit uses SQL to handle complex data manipulation and backend database architecture.",
            "He works with SQL databases frequently for his data science and web development projects."
        ]
    },
    {
        "category": "Skills - General",
        "topics": ["skills", "tech stack", "technologies", "what does he know", "programming languages", "development skills"],
        "answers": [
            "His technical stack includes Python, SQL, C/C++, Data Science libraries (Pandas, NumPy, Scikit-learn), Data Visualization tools, and platforms like Docker and Firebase.",
            "Sanchit is skilled in AI/ML, Data Science, Python, backend integrations, and modern web development technologies.",
            "He specializes in a versatile stack featuring Python, Machine Learning frameworks, data analytics tools, and Git for version control."
        ]
    },
    {
        "category": "Skills - Data Science",
        "topics": ["data science", "data cleaning", "EDA", "pandas", "numpy", "scikit-learn", "data analysis", "regression"],
        "answers": [
            "He specializes in Data Science, utilizing Pandas and NumPy for data manipulation, and Scikit-learn for building regression and classification models.",
            "Sanchit is experienced in Exploratory Data Analysis (EDA), data cleaning, and creating machine learning models using Python's data science ecosystem.",
            "His data science toolkit heavily involves Pandas, NumPy, Scikit-learn, and advanced EDA techniques."
        ]
    },
    {
        "category": "Skills - Visualization",
        "topics": ["data visualization", "matplotlib", "seaborn", "plotly", "power bi", "charts", "dashboards", "analytics"],
        "answers": [
            "Sanchit uses Matplotlib, Seaborn, and Plotly for programmatic data visualization, and Power BI for creating interactive analytics dashboards.",
            "He is highly capable in data visualization, transforming complex datasets into readable insights using Power BI, Seaborn, and Plotly.",
            "His analytics skills are backed by strong visualization abilities using modern Python libraries and Power BI."
        ]
    },
    {
        "category": "Tools & Platforms",
        "topics": ["tools", "platforms", "software", "environment", "git", "github", "docker", "linux", "postman", "vercel"],
        "answers": [
            "Sanchit works with industry-standard tools including Git, GitHub, Docker, Linux, Postman, Vercel, and Netlify.",
            "His development environment incorporates VS Code, Jupyter Notebooks, Docker for containerization, and Git for version control.",
            "He leverages tools like Docker, Git, Google Colab, and Postman to streamline his development and AI modeling workflows."
        ]
    },
    {
        "category": "Projects",
        "topics": ["projects", "what did he build", "portfolio projects", "work", "development work", "github projects"],
        "answers": [
            "Sanchit builds AI-integrated applications, automation tools, data science models, and responsive modern websites. Check out his portfolio's projects section!",
            "His projects range from machine learning implementations and exploratory data analysis to complete modern web applications and APIs.",
            "He has developed multiple sophisticated projects focusing on AI, Data Science, and web development. His GitHub showcases his hands-on experience."
        ]
    },
    {
        "category": "Career & Goals",
        "topics": ["career goal", "future plans", "what does he want to be", "aim", "future focus", "ai engineer", "data scientist", "internship"],
        "answers": [
            "His ultimate goal is to become an AI Engineer or Data Scientist, creating intelligent systems that solve real-world problems.",
            "Sanchit aims to work professionally as a Machine Learning Engineer or AI Specialist, continuously learning and building scalable solutions.",
            "He is actively preparing for internships and full-time roles in the Data Science and Artificial Intelligence space."
        ]
    },
    {
        "category": "Contact & Resume",
        "topics": ["contact", "hire", "resume", "cv", "linkedin", "email", "get in touch", "how to reach"],
        "answers": [
            "You can contact Sanchit via the contact form on this portfolio, or connect with him directly on LinkedIn.",
            "His resume is available for download in the Resume section of this website, and you can reach him through his integrated contact form.",
            "Sanchit is open to opportunities! Feel free to use the contact form, check his GitHub, or network with him on LinkedIn."
        ]
    },
    {
        "category": "Conversational - Greeting",
        "topics": ["hi", "hello", "hey", "who are you", "what is this", "greetings", "good morning", "good evening", "sup"],
        "answers": [
            "Hello! I am Sanchit's AI assistant. I can answer any questions you have about his skills, education, projects, and career goals. How can I help you?",
            "Hi there! I'm an AI designed to help you navigate Sanchit's professional portfolio. What would you like to know about him?",
            "Greetings! I represent Sanchit Goyal. Feel free to ask me about his technical skills, AI journey, or resume!"
        ]
    },
    {
        "category": "Conversational - Goodbye",
        "topics": ["bye", "goodbye", "thanks", "thank you", "cya", "see ya", "that's all", "nothing else", "exit"],
        "answers": [
            "You're welcome! Feel free to ask if you have any more questions about Sanchit.",
            "Thanks for visiting! Have a great day, and don't hesitate to reach out to Sanchit directly.",
            "Goodbye! Sanchit appreciates your interest in his portfolio."
        ]
    }
]

# We need a massive dataset. Let's create variations.
dataset = []
seen_questions = set()

def clean_question(q):
    # Remove extra spaces and standardize
    q = " ".join(q.split()).lower().strip()
    if not q.endswith("?") and random.random() > 0.3:
        q += "?"
    return q

print("Starting generation...")

for entry in KNOWLEDGE_BASE:
    category = entry["category"]
    topics = entry["topics"]
    answers = entry["answers"]
    
    for topic in topics:
        for subject in SUBJECTS:
            for prefix in PREFIXES:
                for template in QUESTION_TEMPLATES:
                    raw_q = template.format(prefix=prefix, subject=subject, topic=topic)
                    q = clean_question(raw_q)
                    
                    if q not in seen_questions and len(q) > 4:
                        seen_questions.add(q)
                        ans = random.choice(answers)
                        
                        dataset.append({
                            "category": category,
                            "question": q,
                            "answer": ans
                        })

# Shuffle the dataset so it's not grouped artificially if used for training
random.shuffle(dataset)

# Output
output_path = os.path.join(os.path.dirname(__file__), "chatbot_dataset.json")
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(dataset, f, indent=2, ensure_ascii=False)

print(f"Successfully generated {len(dataset)} unique QA pairs!")
print(f"Dataset saved to: {output_path}")
