# Government Scheme Explainer

An AI-powered web app that explains government schemes, notices and policies in simple language, in the user's own language.

**Live demo:** https://scheme-explainer.onrender.com
(The first load can take about 50 seconds because the free server wakes up.)

Built for the IDEA//FORGE Online Hackathon, Track 1: Civic Pulse, Digital Governance & Public Information (Problem: Multilingual Policy, Rights & Scheme Explainer).

## The problem

Government notices and scheme rules are often written in difficult, formal English. Many citizens, especially in rural areas, cannot easily understand whether a scheme applies to them, what documents they need or how to apply.

## What it does

- Paste a government scheme or notice.
- Choose a language: Marathi, Hindi or English.
- Get a simple explanation: what the scheme is, who is eligible, benefits, documents required and how to apply.
- The AI is told to use only the pasted text. If something is missing, it says "Not mentioned in the text" instead of guessing.

## Tech stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js
- AI: Google Gemini API
- Hosting: Render
- The API key stays on the server and is never exposed in the browser.

## Run it locally

1. Install Node.js (version 20 or higher).
2. Clone this repository:
   git clone https://github.com/sw839131-sys/scheme-explainer.git
   cd scheme-explainer
3. Get a free Gemini API key from https://aistudio.google.com
4. Create a file named `.env` in the project folder with this line:
   GEMINI_API_KEY=your_key_here
5. Start the server:
   node --env-file=.env server.js
6. Open http://localhost:3000

## Disclaimer

This tool gives a simplified explanation for understanding only. Always confirm details on the official government website before applying.

## Author

Sanket Wankhade, 3rd-year IT student
