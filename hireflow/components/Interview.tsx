'use client'
import { generateFeedback, generateQuestions } from '@/app/lib/action';
import React, { useState, useRef, useEffect } from 'react';
import TestSpeech from './TestSpeech';

type qAList = {
  id: string;
  question: string;
  answer: string;
};

type LLMParsedResult = {
  question: string;
  answer: string;
  grade: string;
  feedback: string;
};

interface formType {
  jobTitle: string;
  level: string;
  company: string;
  interview: string[];
}

const Interview = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [canProceed, setCanProceed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<qAList[]>([]);
  const [grading, setGrading] = useState<LLMParsedResult[]>([]);
  const [form, setForm] = useState<formType>({
    jobTitle: '',
    level: '',
    company: '',
    interview: [],
  });


// submit transcript results

useEffect(() => {
  if (!listening && transcript.trim() && interviewStarted) {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[currentIndex].answer = transcript.trim();
      return updated;
    });
    console.log(`✅ Answer saved for question ${currentIndex}: ${transcript}`);
  }
}, [transcript, listening, interviewStarted]);


  // Handle Form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setForm(prev => ({ ...prev, interview: selectedOptions }));
  };

  // Format LLM questions
  function formatQuestions(raw: string): qAList[] {
    return raw
      .split(/\n+/)
      .map(line => line.trim())
      .filter(line => /^[\d\-\*]?[\.)]?\s*/.test(line))
      .map((line, index) => {
        const questionText = line.replace(/^\d+[\.\)]?\s*/, '');
        return { id: `q${index + 1}`, question: questionText, answer: '' };
      });
  }

  // Parse LLM feedback
function parseLLMResponse(text: string): LLMParsedResult[] {
  console.log('🧾 Raw LLM response:', text);

  if (!text || typeof text !== 'string' || text.trim() === '') {
    console.warn('⚠️ Empty or invalid response from LLM.');
    return [];
  }

  const sections = text.split(/### \d+\.\s/).slice(1); // split on "### 1.", "### 2." etc.

  const results = sections.map(section => {
    const titleLine = section.split('\n').find(Boolean)?.trim() || '';
    const gradeMatch = section.match(/\*\*Grade:\s*(.*?)\*\*/);
    const feedbackMatch = section.match(/\*\*Feedback:\*\*\s*([\s\S]*?)(?=\n{2,}|\*\*|###|$)/);

    return {
      question: titleLine,
      answer: '',
      grade: gradeMatch?.[1]?.trim() || 'N/A',
      feedback: feedbackMatch?.[1]?.trim().replace(/\n/g, ' ') || 'No feedback provided.',
    };
  });

  if (results.length === 0) {
    console.warn('⚠️ Failed to parse any sections. Check format of LLM response.');
  }

  return results;
}


  const generatePrompt = () => `
You are a professional job interviewer.
Generate 5 ${form.interview.join(', ')} interview questions for a ${form.level} ${form.jobTitle} applying to ${form.company}.
Respond only with plain text, numbering each question 1 to 5.
`.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const rawQuestions = await generateQuestions(generatePrompt());
      const formatted = formatQuestions(rawQuestions);
      setQuestions(formatted);
    } catch (error) {
      console.error(error);
      alert('Error generating questions');
    }
    setLoading(false);
  };

const handlePrompt = (qs: qAList[]) => {
  let prompt = `
You are a very strict grading assistant for a job interview for a ${form.jobTitle} position at ${form.company}.
Grade each of the answers below on a scale of 0 to 10 and provide brief feedback.
Only grade questions that have an answer. Format your response as:

### 1. Question text here
**Grade:** 7
**Feedback:** Brief feedback here.

`.trim();

  qs.forEach((q, i) => {
    if (q.answer.trim()) {
      prompt += `\n\n${i + 1}: ${q.question}\n${i + 1}: ${q.answer}`;
    }
  });

  console.log('📝 Generated grading prompt:', prompt);
  return prompt;
};


const handleGrading = async (e: React.FormEvent) => {
  e.preventDefault();

  // Prevent submitting with no answers
  const answered = questions.filter(q => q.answer.trim());
  if (answered.length === 0) {
    alert('Please answer at least one question before submitting.');
    return;
  }

  setLoading(true);
  try {
    const prompt = handlePrompt(answered);
    const response = await generateFeedback(prompt);

    if (!response || typeof response !== 'string' || response.trim() === '') {
      throw new Error('Empty response from LLM');
    }

    const parsed = parseLLMResponse(response);

    if (parsed.length === 0) {
      alert('The AI could not process your answers. Please try again.');
    }

    setGrading(parsed);
  } catch (error) {
    console.error('❌ Grading error:', error);
    alert('An error occurred while grading your answers.');
  }
  setLoading(false);
};


  // 🔊 Speak Question

  const speakText = (text: string, onEnd?: () => void) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
  
    utterance.onstart = () => console.log('🔊 Speaking:', text);
    utterance.onend = () => {
      console.log('✅ Done speaking');
      onEnd?.(); // Callback after speech ends
    };
    utterance.onerror = (e) => console.log('❌ Speech error:', e.error);
  
    const loadVoices = () => {
      const voices = synth.getVoices();
      if (voices.length > 0) {
        const selectedVoice = voices.find(voice => voice.name.includes('Google')) || voices[0];
        utterance.voice = selectedVoice;
        utterance.volume = 1;
        utterance.pitch = 1.2;
        utterance.rate = 1.1;
        synth.speak(utterance);
      } else {
        setTimeout(loadVoices, 100);
      }
    };
  
    loadVoices();
  };
  
  const askNextQuestion = (index: number) => {
    if (index < questions.length) {
      setCurrentIndex(index);
      setCanProceed(false);
      speakText(questions[index].question, () => {
        setCanProceed(true); // Allow proceeding after speaking ends
        setListening(true)
      });
    } else {
      console.log("🎉 Interview complete.");
      setInterviewStarted(false);
    }
  };
  
  const handleClick = () => {
    setInterviewStarted(true);
    speakText(
      "Hello! Welcome to your interview assistant. Let's get started with the first question.",
      () => askNextQuestion(0)
    );
    console.log('interview has started...')
  };
  
  const proceedToNext = () => {
    if (canProceed) {
      setTranscript('');
      askNextQuestion(currentIndex + 1);
      setListening(false)
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-2">
        <input type="text" name="jobTitle" placeholder="Job Title" value={form.jobTitle} onChange={handleChange} className="border p-2 w-full" />
        <input type="text" name="level" placeholder="Level" value={form.level} onChange={handleChange} className="border p-2 w-full" />
        <input type="text" name="company" placeholder="Company" value={form.company} onChange={handleChange} className="border p-2 w-full" />
        <select multiple value={form.interview} onChange={handleSelect} className="border p-2 w-full h-32">
          <option value="technical">Technical</option>
          <option value="behavioral">Behavioral</option>
          <option value="personal">Personal</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {loading ? 'Generating...' : 'Generate Questions'}
        </button>
      </form>

      <form onSubmit={handleGrading} className="mt-8 space-y-4">
        {questions.map((qa, idx) => (
          <div key={qa.id}>
            <p className="font-semibold">{idx + 1}. {qa.question}</p>
            <textarea className="border w-full p-2" rows={3} value={qa.answer} onChange={e => {
              const updated = [...questions];
              updated[idx].answer = e.target.value;
              setQuestions(updated);
            }} />
          </div>
        ))}
        {grading.map((g, i) => (
          <div key={i} className="bg-gray-100 p-2 rounded">
            <p><strong>Grade:</strong> {g.grade}</p>
            <p><strong>Feedback:</strong> {g.feedback}</p>
          </div>
        ))}
        {questions.length > 0 && (
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
            {loading ? 'Grading...' : 'Submit Answers'}
          </button>
        )}
      </form>

      {/* Start Interview */}
      <div className="mt-8">
        <h2 className="text-lg font-bold mb-2">Speech Interview</h2>
        {!interviewStarted ? (
        <button
          onClick={handleClick}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
        >
          Start Interview
        </button>
      ) : (
        <button
          onClick={handleClick}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
        >
          Start Interview
        </button>
      )}
      <button
          onClick={proceedToNext}
          className="bg-blue-600 ml-4 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
        >
          proceed
        </button>
        { listening && <TestSpeech transcript={transcript} setTranscript={setTranscript} listening={listening} setListening={setListening} />}
        {interviewStarted && <p className="text-green-600 mt-2">Listening for your response...</p>}
      </div>
    </div>
  );
};

export default Interview;
