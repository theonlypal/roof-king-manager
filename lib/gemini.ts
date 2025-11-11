export async function suggestCategoryWithGemini(apiKey: string, description: string): Promise<string | null> {
  try {
    const prompt = `You are helping a roofing company categorize extra work on jobs.

Task: Given a short description of extra work, output ONLY a short category label (1-4 words), no punctuation.

Examples:
"Replace 3 sheets of rotten plywood under roof deck" -> Rotten decking repair
"Install additional flashing around chimney" -> Flashing installation
"Haul away unexpected debris from tear-off" -> Debris removal

Now categorize this description:
"${description}"

Answer:`;

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'object',
              properties: { category: { type: 'string' } },
              required: ['category'],
            },
          },
        }),
      }
    );

    if (!response.ok) {
      console.error('Gemini API error:', response.status);
      return null;
    }

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      console.error('No text content in Gemini response');
      return null;
    }

    const parsed = JSON.parse(textContent);
    return parsed.category?.trim() || null;
  } catch (error) {
    console.error('Gemini category suggestion error:', error);
    return null;
  }
}
