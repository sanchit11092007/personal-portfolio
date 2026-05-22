/**
 * Certifications Data Store
 * ─────────────────────────
 * Add new certifications by appending objects to the relevant category array.
 * The UI will render them automatically — no HTML edits required.
 *
 * Each certificate supports:
 *   title       – Certificate name
 *   issuer      – Platform / organization
 *   year        – Year of completion (string)
 *   skills      – Array of skill tags
 *   description – Optional short description
 *   image       – Optional path to certificate image (relative to project root)
 *   link        – Optional external verification link
 */

window.CertificationsData = {
  categories: [
    {
      id: "ml-ai",
      label: "Machine Learning & AI",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h1l1 6h8l1-6h1a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z"/><circle cx="9" cy="10" r="1"/><circle cx="15" cy="10" r="1"/></svg>',
      certs: []
    },
    {
      id: "data-science",
      label: "Data Science & Analytics",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M21 12c0 1.66-4.03 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/></svg>',
      certs: []
    },
    {
      id: "development",
      label: "Development & Programming",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
      certs: []
    },
    {
      id: "others",
      label: "Other Certifications",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>',
      certs: [
        {
          title: "Generative AI Foundations",
          issuer: "upGrad / Microsoft",
          year: "2025",
          skills: ["GenAI", "Prompting", "AI Concepts"],
          description: "Foundational course covering generative AI concepts, prompt engineering techniques, and Microsoft AI ecosystem.",
          thumbnail: "assets/images/certificates/others/gen-ai-foundations.jpg",
          fullImage: "assets/images/certificates/others/gen-ai-foundations.jpg",
          pdfLink: "",
          verificationLink: ""
        },
        {
          title: "Advanced Power BI Workshop",
          issuer: "Lovely Professional University / upGrad",
          year: "2025",
          skills: ["Power BI", "DAX", "Dashboards"],
          description: "Workshop covering advanced Power BI techniques including DAX formulas, data modeling, and interactive dashboards.",
          thumbnail: "assets/images/certificates/others/power-bi-workshop.jpeg",
          fullImage: "assets/images/certificates/others/power-bi-workshop.jpeg",
          pdfLink: "",
          verificationLink: ""
        },
        {
          title: "Mastering Data Scraping from Web to Insights",
          issuer: "Lovely Professional University / upGrad Campus",
          year: "2026",
          skills: ["Web Scraping", "Data Extraction", "BeautifulSoup", "Automation"],
          description: "Comprehensive program focused on web scraping, data parsing, and automated extraction pipelines for generating actionable insights.",
          thumbnail: "assets/images/certificates/others/data-scraping.png",
          fullImage: "assets/images/certificates/others/data-scraping.png",
          pdfLink: "",
          verificationLink: ""
        }
      ]
    }
  ]
};
