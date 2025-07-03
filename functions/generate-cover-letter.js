export async function onRequestPost(context) {
  const { resume, jobDescription, writingStyle, personalTouch } = await context.request.json();

  // Simple template logic for demonstration
  const letter = `Dear Hiring Manager,\n\nI am excited to apply for this position. Here is a summary:\n\nResume: ${resume}\nJob Description: ${jobDescription}\nWriting Style: ${writingStyle}\nPersonal Touch: ${personalTouch}\n\nSincerely,\n[Your Name]`;

  return new Response(JSON.stringify({ letter }), {
    headers: { 'Content-Type': 'application/json' }
  });
}