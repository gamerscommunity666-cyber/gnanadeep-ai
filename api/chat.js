
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GNANADEEP CORE is not configured. Add GROQ_API_KEY in Vercel."
      });
    }

    const { messages } = req.body || {};

    if (!Array.isArray(messages)) {
      return res.status(400).json({
        error: "Invalid messages"
      });
    }

    const safeMessages = messages
      .filter(m =>
        ["user", "assistant"].includes(m.role) &&
        typeof m.content === "string"
      )
      .slice(-20);

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [
            {
              role: "system",
              content: `You are GNANADEEP AI, a balanced, intelligent,
              friendly and helpful AI assistant.
              Give clear, accurate and useful answers.
              Help with learning, coding, creativity and problem solving.
              Be respectful and conversational.`
            },
            ...safeMessages
          ],
          temperature: 0.7,
          max_tokens: 2048
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "Groq API error"
      });
    }

    const reply =
      data.choices?.[0]?.message?.content || "";

    return res.status(200).json({ reply });

  } catch (error) {
    return res.status(500).json({
      error: "GNANADEEP CORE error: " + error.message
    });
  }
}

