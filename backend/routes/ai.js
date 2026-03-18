const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com',
});

router.post('/generate-template', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        const response = await openai.chat.completions.create({
            model: "deepseek-chat",
            messages: [
                {
                    role: "system",
                    content: "You are an expert cold email copywriter. Generate a high-converting email template. Return ONLY JSON with 'subject' and 'body' fields. Use {{name}} and {{company}} as variables. Keep the body concise and professional."
                },
                {
                    role: "user",
                    content: `Generate an email template for: ${prompt}`
                }
            ]
        });

        const result = JSON.parse(response.choices[0].message.content);
        res.json(result);
    } catch (error) {
        console.error('DeepSeek Error:', error);
        res.status(500).json({ error: 'Failed to generate template' });
    }
});

module.exports = router;
