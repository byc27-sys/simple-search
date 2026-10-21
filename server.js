const express = require("express");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Basic in-memory request limit: 60 requests per IP per 15 minutes.
// For a larger deployment, use a shared store and stronger abuse protection.
const hits = new Map();
app.use((req, res, next) => {
  if (!req.path.startsWith("/api/")) return next();

  const now = Date.now();
  const key = req.ip;
  const entry = hits.get(key) || { count: 0, resetAt: now + 15 * 60 * 1000 };

  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + 15 * 60 * 1000;
  }

  entry.count += 1;
  hits.set(key, entry);

  if (entry.count > 60) {
    return res.status(429).json({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." });
  }

  next();
});

app.use(express.static("public"));

app.get("/api/search", async (req, res) => {
  const q = String(req.query.q || "").trim();

  if (!q || q.length > 200) {
    return res.status(400).json({ error: "검색어를 입력해 주세요. (최대 200자)" });
  }

  if (!process.env.BRAVE_API_KEY) {
    return res.status(500).json({ error: "서버에 검색 API 키가 설정되지 않았습니다." });
  }

  try {
    const params = new URLSearchParams({
      q,
      count: "10",
      country: "KR",
      search_lang: "ko"
    });

    const response = await fetch(
      `https://api.search.brave.com/res/v1/web/search?${params}`,
      {
        headers: {
          Accept: "application/json",
          "X-Subscription-Token": process.env.BRAVE_API_KEY
        },
        signal: AbortSignal.timeout(10000)
      }
    );

    if (!response.ok) {
      console.error("Brave API status:", response.status);
      return res.status(502).json({
        error: "검색 서비스에서 응답을 받지 못했습니다. API 키와 이용 한도를 확인해 주세요."
      });
    }

    const data = await response.json();
    const results = (data.web?.results || [])
      .filter(item => typeof item.url === "string" && /^https?:\/\//i.test(item.url))
      .map(item => ({
        title: item.title || "제목 없음",
        url: item.url,
        description: item.description || ""
      }));

    res.json({ results });
  } catch (error) {
    console.error("Search error:", error.message);
    res.status(502).json({ error: "검색 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Simple Search is running on port ${PORT}`);
});
