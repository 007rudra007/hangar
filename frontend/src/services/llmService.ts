
import { Item } from '../types'

export const llmService = {
    generatePromptJSON: async (items: Item[], occasion: string, preferences?: string) => {
        const description = items.map(i =>
            `- (ID: ${i.id}) ${i.color} ${i.season} ${i.category} (${i.occasion}) ${i.isFavorite ? '[Favorite]' : ''}`
        ).join('\n')

        const prompt = {
            task: "Style an outfit",
            occasion: occasion,
            preferences: preferences || "None",
            wardrobe: description,
            request: "Please recommend an outfit from the above wardrobe for the specified occasion and preferences. Return a VALID JSON with key 'notes' (string) and 'items' (array of NUMBERS corresponding to the IDs of the selected items)."
        }

        return JSON.stringify(prompt, null, 2)
    },

    callLLM: async (provider: string, apiKey: string, items: Item[], occasion: string, preferences: string = "", model?: string): Promise<string> => {
        const prompt = await llmService.generatePromptJSON(items, occasion, preferences)

        if (provider === 'gemini') {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            })
            const data = await response.json()

            if (!response.ok) {
                const errorMessage = data.error?.message || data.error?.status || "Unknown Gemini Error";
                throw new Error(`Gemini Error: ${errorMessage}`);
            }

            return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response"
        }

        if (provider === 'openai') {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-4o",
                    messages: [{ role: "user", content: prompt }]
                })
            })
            const data = await response.json()

            if (!response.ok) {
                const errorMessage = data.error?.message || "Unknown OpenAI Error";
                throw new Error(`OpenAI Error: ${errorMessage}`);
            }

            return data.choices?.[0]?.message?.content || "No response"
        }

        if (provider === 'anthropic') {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json',
                    'dangerously-allow-browser': 'true'
                },
                body: JSON.stringify({
                    model: "claude-3-5-sonnet-20240620",
                    max_tokens: 1024,
                    messages: [{ role: "user", content: prompt }]
                })
            })
            const data = await response.json()

            if (!response.ok) {
                const errorMessage = data.error?.message || "Unknown Anthropic Error";
                throw new Error(`Anthropic Error: ${errorMessage}`);
            }

            return data.content?.[0]?.text || "No response"
        }

        if (provider === 'openrouter') {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': 'https://hangar.app', // Optional for OpenRouter
                    'X-Title': 'Hangar',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: model || "google/gemini-2.0-flash-001", // Default to a good free/cheap model
                    messages: [{ role: "user", content: prompt }]
                    // Note: OpenRouter supports many models. In DB we added 'openrouter_model'. But callLLM doesn't receive it yet.
                    // I will refactor callLLM signature in next step or assume default.
                    // Let's assume standard 'openai/gpt-4o' or 'google/gemini-2.0-flash-001'
                })
            })
            const data = await response.json()
            if (!response.ok) {
                const errorMessage = data.error?.message || "Unknown OpenRouter Error";
                throw new Error(`OpenRouter Error: ${errorMessage}`);
            }
            return data.choices?.[0]?.message?.content || "No response"
        }

        return "Unknown Provider"
    },

    analyzeImage: async (imageBase64: string, provider: string, apiKey: string): Promise<any> => {
        // Prepare prompt
        const promptText = "Analyze this clothing item. Return ONLY valid JSON with keys: category (one of: tops, bottoms, dresses, shoes, accessories), color, season (one of: summer, winter, spring, autumn), occasion (one of: casual, formal, party, sports), notes (short description)."

        // Remove header from base64 if present for API usage
        const base64Data = imageBase64.split(',')[1] || imageBase64

        if (provider === 'gemini') {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: promptText },
                            { inline_data: { mime_type: "image/jpeg", data: base64Data } }
                        ]
                    }]
                })
            })
            const data = await response.json()

            if (!response.ok) {
                const errorMessage = data.error?.message || "Unknown Gemini Vision Error";
                console.error(errorMessage);
                throw new Error(`Gemini Vision Error: ${errorMessage}`);
            }

            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}"
            return extractJSON(text)
        }

        if (provider === 'openai') {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-4o",
                    messages: [{
                        role: "user",
                        content: [
                            { type: "text", text: promptText },
                            { type: "image_url", image_url: { url: imageBase64 } }
                        ]
                    }],
                    max_tokens: 300
                })
            })
            const data = await response.json()
            const text = data.choices?.[0]?.message?.content || "{}"
            return extractJSON(text)
        }

        return {}
    }
}

function extractJSON(text: string): any {
    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(text);
    } catch (e) {
        console.error("Failed to parse JSON", e);
        return {};
    }
}
