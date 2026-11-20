const http = require("http");
const fs = require("fs");

const KEY = process.env.GEMINI_API_KEY;
// Tried in this order. If one is busy or out of quota, the next one is used.
const MODELS = ["gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite"];

async function askGemini(prompt, asJson = false) {
  const body = { contents: [{ parts: [{ text: prompt }] }] };
  if (asJson) body.generationConfig = { responseMimeType: "application/json" };

  let lastError = "";
  for (const model of MODELS) {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": KEY },
        body: JSON.stringify(body),
      }
    );
    const data = await r.json();
    const out = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (out) {
      console.log("Answered by:", model);
      return out;
    }

    lastError = JSON.stringify(data);
    console.log("Model failed:", model, r.status);
    const canSwitch = [404, 429, 500, 503].includes(r.status);
    if (!canSwitch) break;
  }
  throw new Error(lastError);
}

async function readBody(req) {
  let body = "";
  for await (const chunk of req) body += chunk;
  return JSON.parse(body);
}

function send(res, code, obj) {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(JSON.stringify(obj));
}

const NO_MD = `Do not use markdown symbols like ** or *. Use plain section titles and lines starting with "- ".`;

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(fs.readFileSync("index.html"));
  }

  if (req.method === "POST") {
    try {
      const { text, lang, answers } = await readBody(req);

      if (req.url === "/api/explain") {
        const answer = await askGemini(`You are a government scheme explainer for ordinary citizens.
Use ONLY the text below. Do not add outside information.
If something is not in the text, say "Not mentioned in the text".
Reply in ${lang}, in simple words, with these sections:
1. What the scheme is
2. Who is eligible
3. Benefits
4. Documents required
5. How to apply
Keep names of schemes, portals and offices (for example CSC) as people commonly say them.
${NO_MD}

Text:
${text}`);
        return send(res, 200, { answer });
      }

      if (req.url === "/api/questions") {
        const raw = await askGemini(`Read the scheme text below.
Write exactly 4 simple yes/no questions that check whether a person is eligible,
based ONLY on the eligibility rules in the text.
Write the questions in ${lang}.
Return only a JSON array of 4 strings.

Text:
${text}`, true);
        return send(res, 200, { questions: JSON.parse(raw) });
      }

      if (req.url === "/api/verdict") {
        const list = answers.map((a) => `Q: ${a.q}\nA: ${a.a}`).join("\n");
        const answer = await askGemini(`Use ONLY the scheme text below and the person's answers.
Decide: Eligible, Not eligible, or Not sure (if answers are missing).
Reply in ${lang}. First line: the decision. Then 2-3 short lines giving the reason,
based on the rules in the text. Last line: remind them to confirm on the official website.
${NO_MD}

Scheme text:
${text}

Answers:
${list}`);
        return send(res, 200, { answer });
      }
    } catch (e) {
      return send(res, 500, { answer: "Error: " + e.message, questions: [] });
    }
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(process.env.PORT || 3000, () => console.log("Running"));