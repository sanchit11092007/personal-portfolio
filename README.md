# Sanchit Goyal Portfolio

Premium single-page portfolio website for Sanchit Goyal, focused on Artificial Intelligence, Machine Learning, Data Science, and Software Engineering internship opportunities.

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- No frameworks, libraries, UI kits, or external animation dependencies

## Structure

```text
.
+-- index.html
+-- README.md
+-- robots.txt
+-- sitemap.xml
+-- css/
|   +-- style.css
|   +-- animations.css
|   +-- responsive.css
+-- js/
|   +-- main.js
|   +-- animations.js
|   +-- particles.js
|   +-- form-handler.js
+-- assets/
|   +-- images/
|   +-- resume/
|   +-- favicon/
+-- components/
```

## Editing Content

- Update portfolio text directly in `index.html`.
- Replace `assets/resume/Sanchit_Goyal_Resume.pdf` with the final resume PDF.
- Replace `assets/images/profile-placeholder.jpg` with a professional profile photo.
- Add real certificate previews inside `assets/images/certificates/`.
- Update GitHub, LinkedIn, email, and live demo links before publishing.

## Contact Form Backend

The contact form is wired for silent submission. Add a Google Forms, Google Apps Script, or Google Sheets endpoint to the form:

```html
<form id="contactForm" data-form-endpoint="YOUR_ENDPOINT_HERE">
```

If the endpoint is empty, the form simulates a successful send for local demos.

## GitHub Pages Deployment

1. Push this folder to a GitHub repository.
2. Go to repository settings.
3. Enable GitHub Pages from the `main` branch root.
4. Update `sitemap.xml`, canonical URLs, and OpenGraph URLs with the final domain.

## Performance Notes

- The particle background is canvas-based and capped for mobile performance.
- Animations respect `prefers-reduced-motion`.
- Images are ready for lazy-loading and replacement.
- Layouts use stable sizing to reduce layout shift.
