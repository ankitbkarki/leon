export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { resume, jobDescription, writingStyle, personalTouch } = await request.json();

    // Compose the prompt for Gemini
    const prompt = `
You are a professional cover letter writer. Write a unique, personalized cover letter based ONLY on the following:
Resume: ${resume}
Job Description: ${jobDescription}
Writing Style: ${writingStyle}
Personal Touch: ${personalTouch}
Do not hallucinate. Use only the information provided.`;

    // Call Gemini API
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + env.GEMINI_API_KEY,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: prompt }] }
          ]
        })
      }
    );
    const data = await response.json();
    // Extract the generated text
    const letter = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, no letter generated.";
    return new Response(JSON.stringify({ letter }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    // Log error for debugging
    console.error("Function error:", err);
    return new Response(JSON.stringify({ letter: "An error occurred in the serverless function." }), { headers: { 'Content-Type': 'application/json' }, status: 500 });
  }
}
