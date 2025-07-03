form.addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const resume = resumeText.value.trim();
    const jobDescription = document.getElementById('job-description').value.trim();
    const writingStyle = document.getElementById('writing-style').value;
    const personalTouch = document.getElementById('personal-touch').value.trim();
  
    if (!resume || !jobDescription) {
      alert('Please provide both your resume and job description.');
      return;
    }
  
    loadingState.classList.remove('hidden');
    initialState.classList.add('hidden');
    generatedContent.classList.add('hidden');
    generateBtn.disabled = true;
  
    try {
      // Call your Cloudflare Function
      const resp = await fetch('/functions/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume, jobDescription, writingStyle, personalTouch })
      });
  
      const data = await resp.json();
  
      coverLetterText.textContent = data.letter;
      aiFeedback.innerHTML = ""; // Optionally, you can add feedback logic here
  
      loadingState.classList.add('hidden');
      generatedContent.classList.remove('hidden');
    } catch (error) {
      alert('An error occurred while generating your cover letter. Please try again.');
    } finally {
      generateBtn.disabled = false;
    }
  });