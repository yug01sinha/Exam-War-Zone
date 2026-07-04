# Exam War Room — Landing Page

Single-file, zero-build static landing page for **Exam War Room**, an AI-powered exam prep platform for CBSE Class 10 students.

## Stack
- Pure HTML + CSS + vanilla JS (no framework, no build step)
- Google Fonts: Inter, Space Grotesk, JetBrains Mono
- Deployed as a static site on Vercel

## Run locally
```bash
npm run dev    # serves the folder at http://localhost:3000
```
Or just open `index.html` in a browser.

## Deploy to Vercel
1. Push this folder to a Git repo.
2. Import the repo at https://vercel.com/new — Vercel auto-detects it as a static site and deploys `index.html` as the entry point.
3. (Optional) Set the project name to `exam-war-room` for a clean URL.

No build command is required. `vercel.json` is preconfigured with security headers and long-lived caching for static assets.
