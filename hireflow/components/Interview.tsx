'use client'
import { generateFeedback, generateQuestions } from '@/app/lib/action';
import Link from 'next/link';
import React, { useState } from 'react';

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
  // const [currentIndex, setCurrentIndex] = useState(0);
  // const [interviewStarted, setInterviewStarted] = useState(false);
  // const [transcript, setTranscript] = useState('');
  // const [listening, setListening] = useState(false);
  // const [canProceed, setCanProceed] = useState(false);
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

// useEffect(() => {
//   if (!listening && transcript.trim() && interviewStarted) {
//     setQuestions((prev) => {
//       const updated = [...prev];
//       updated[currentIndex].answer = transcript.trim();
//       return updated;
//     });
//     console.log(`✅ Answer saved for question ${currentIndex}: ${transcript}`);
//   }
// }, [transcript, listening, interviewStarted]);


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

  // const speakText = (text: string, onEnd?: () => void) => {
  //   const synth = window.speechSynthesis;
  //   const utterance = new SpeechSynthesisUtterance(text);
  
  //   utterance.onstart = () => console.log('🔊 Speaking:', text);
  //   utterance.onend = () => {
  //     console.log('✅ Done speaking');
  //     onEnd?.(); // Callback after speech ends
  //   };
  //   utterance.onerror = (e) => console.log('❌ Speech error:', e.error);
  
  //   const loadVoices = () => {
  //     const voices = synth.getVoices();
  //     if (voices.length > 0) {
  //       const selectedVoice = voices.find(voice => voice.name.includes('Google')) || voices[0];
  //       utterance.voice = selectedVoice;
  //       utterance.volume = 1;
  //       utterance.pitch = 1.2;
  //       utterance.rate = 1.1;
  //       synth.speak(utterance);
  //     } else {
  //       setTimeout(loadVoices, 100);
  //     }
  //   };
  
  //   loadVoices();
  // };
  
  // const askNextQuestion = (index: number) => {
  //   if (index < questions.length) {
  //     setCurrentIndex(index);
  //     setCanProceed(false);
  //     speakText(questions[index].question, () => {
  //       setCanProceed(true); // Allow proceeding after speaking ends
  //       setListening(true)
  //     });
  //   } else {
  //     console.log("🎉 Interview complete.");
  //     setInterviewStarted(false);
  //   }
  // };
  
  // const handleClick = () => {
  //   setInterviewStarted(true);
  //   speakText(
  //     "Hello! Welcome to your interview assistant. Let's get started with the first question.",
  //     () => askNextQuestion(0)
  //   );
  //   console.log('interview has started...')
  // };
  
  // const proceedToNext = () => {
  //   if (canProceed) {
  //     setTranscript('');
  //     askNextQuestion(currentIndex + 1);
  //     setListening(false)
  //   }
  // };

return (
  <div className="bg-gray-50 min-h-screen p-4 max-w-4xl mx-auto">
    {/* 💡 Catchy Call-to-Action Banner */}
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-md mb-6 shadow-md flex items-center justify-between flex-wrap">
      <div className="flex items-center space-x-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9S3 16.97 3 12 7.03 3 12 3s9 4.03 9 9z" />
        </svg>
        <p className="font-medium text-base md:text-lg">
          Need a job-winning resume or cover letter powered by AI?
        </p>
      </div>
      <Link
        href="/"
        className="mt-3 md:mt-0 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-all font-semibold"
      >
        Launch Resume & Cover Letter Tool →
      </Link>
    </div>

    {/* Interview Config Form */}
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow">
      <h2 className="text-2xl font-bold text-gray-800">Interview Configuration</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          name="jobTitle"
          placeholder="Job Title"
          value={form.jobTitle || ''}
          onChange={handleChange}
          className="input"
        />
        <input
          type="text"
          name="level"
          placeholder="Level"
          value={form.level || ''}
          onChange={handleChange}
          className="input"
        />
        <input
          type="text"
          name="company"
          placeholder="Company"
          value={form.company || ''}
          onChange={handleChange}
          className="input"
        />
        <select
          multiple
          value={form.interview || []}
          onChange={handleSelect}
          className="input h-32"
        >
          <option value="technical">Technical</option>
          <option value="behavioral">Behavioral</option>
          <option value="personal">Personal</option>
        </select>
      </div>

      <button
        type="submit"
        className="btn-primary w-full md:w-fit"
      >
        {loading ? 'Generating...' : 'Generate Questions'}
      </button>
    </form>

    {/* Answer Section */}
    <form onSubmit={handleGrading} className="mt-10 space-y-6 bg-white p-6 rounded-xl shadow">
      <h2 className="text-2xl font-bold text-gray-800">Answer the Questions</h2>

      {questions.map((qa, idx) => (
        <div key={qa.id} className="space-y-2">
          <p className="font-semibold text-gray-700">{idx + 1}. {qa.question}</p>
          <textarea
            className="input textarea"
            rows={3}
            value={qa.answer || ''}
            onChange={e => {
              const updated = [...questions];
              updated[idx].answer = e.target.value;
              setQuestions(updated);
            }}
          />
        </div>
      ))}

      {grading.map((g, i) => (
        <div key={i} className="bg-gray-100 p-4 rounded-lg border border-gray-300">
          <p className="font-semibold text-green-700"><strong>Grade:</strong> {g.grade}</p>
          <p className="text-gray-700"><strong>Feedback:</strong> {g.feedback}</p>
        </div>
      ))}

      {questions.length > 0 && (
        <button type="submit" className="btn-secondary w-full md:w-fit">
          {loading ? 'Grading...' : 'Submit Answers'}
        </button>
      )}
    </form>
  </div>
);
};

export default Interview;
