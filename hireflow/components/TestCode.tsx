'use client'
import { generateFeedback, generateQuestions } from '@/app/actions/action';
import React, { useState } from 'react'

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
    interview: string[]
}

type grading = {
  number: string;
  question: string;
  grade: string;
  feedback: string;
}

const TestCode = () => {
    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState<qAList[]>([]);
    const [grading, setGrading] = useState<LLMParsedResult[]>([]);
    const [answers, setAnswers] = useState('');

    const [form, setForm] = useState<formType>({
      jobTitle: '',
      level: '',
      company: '',
      interview: []
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
      setForm((prev) => ({...prev, interview: selectedOptions}))
    }

    function formatQuestions(raw: string): { id: string; question: string; answer: string }[] {
      const questionLines = raw
        .split(/\n+/) // split by new lines
        .map(line => line.trim())
        .filter(line => line && /^[\d\-\*]?[\.)]?\s*/.test(line)); // filter lines that start like "1.", "2)", "- ", etc.
    
      return questionLines.map((line, index) => {
        const questionText = line.replace(/^\d+[\.\)]?\s*/, ''); // remove leading "1." or "2)"
        return {
          id: `q${index + 1}`,
          question: questionText,
          answer: '',
        };
      });
    }

    function parseLLMResponse(text: string): LLMParsedResult[] {
      const sections: string[] = text.split(/### \d+\.\s/).slice(1); // remove the first chunk before question 1
      const results: LLMParsedResult[] = [];
    
      sections.forEach((section: string) => {
        const [titleLine, ...rest] = section.split("\n").filter(line => line.trim() !== '');
        const question: string = titleLine.trim();
    
        const gradeMatch: RegExpMatchArray | null = section.match(/\*\*Grade:\s*(.*?)\*\*/);
        const feedbackMatch: RegExpMatchArray | null = section.match(/\*\*Feedback:\*\*\s*([\s\S]*?)(?=\n{2,}|\*\*|###|$)/);
    
        const grade: string = gradeMatch ? gradeMatch[1].trim() : '';
        const feedback: string = feedbackMatch ? feedbackMatch[1].trim().replace(/\n/g, ' ') : '';
    
        results.push({
          question,
          answer: '',
          grade,
          feedback
        });
      });
    
      return results;
    }
    
    

    const prompt = `
    You are a professional job interviewer.
    
    Generate 5 ${form.interview.join(', ')} interview questions for a ${form.level} ${form.jobTitle} applying to ${form.company}.
    
    Respond only with plain text, numbering each question 1 to 5.
      `.trim();

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);

      try {
        const questions = await generateQuestions(prompt);
        const formattedQuestions = formatQuestions(questions);
        console.log(formattedQuestions);
        setQuestions(formattedQuestions);
      } catch (error) {
        console.log(error);
        alert(error);
      }

      setLoading(false)
    }

    const handlePrompt = (questions: qAList[]) => {
      
      let answerPrompt = `
      you are a very strict grading assistant for a job interview for a ${form.jobTitle} position at ${form.company} interviewing a
      candidate applying for a ${form.level} position, Grade each of the answers below on a scale of 0 to 10 and provide brief feedback for each.
    `.trim();

      questions.forEach((item, idx) => {
        answerPrompt += `${idx + 1} : ${item.question} \n`
        answerPrompt += `${idx + 1} : ${item.answer} \n` 
      });
      return answerPrompt
    }

    const handleGrading = async (e: React.FormEvent) => {
      e.preventDefault();
    
      setLoading(true);
      try {
        const llmPrompt =  handlePrompt(questions);
        
        const llmResponse = await generateFeedback(llmPrompt);
        const parsedResponse = parseLLMResponse(llmResponse); 
        
        setGrading(parsedResponse);
        console.log(parsedResponse);
        console.log(grading);
        console.log(llmResponse);
      
      } catch (error) {
        console.log(error);
        alert(error);
      } 
      setLoading(false)
    }
        
    return (
      <div className="overflow-x-hidden">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="jobTitle"
            placeholder="Job Title"
            value={form.jobTitle}
            onChange={handleChange}
            className="border p-2 mb-2 block w-full"
          />
    
          <input
            type="text"
            name="level"
            placeholder="Level"
            value={form.level}
            onChange={handleChange}
            className="border p-2 mb-2 block w-full"
          />
    
          <input
            type="text"
            name="company"
            placeholder="Company"
            value={form.company}
            onChange={handleChange}
            className="border p-2 mb-4 block w-full"
          />
    
          <label className="block mb-2 font-bold">Select interview type(s):</label>
          <select
            multiple
            value={form.interview}
            onChange={handleSelect}
            className="border p-2 w-full h-32"
          >
            <option value="technical">Technical</option>
            <option value="behavioral">Behavioral</option>
            <option value="personal">Personal</option>
          </select>
          <button type='submit' className='px-3 py-2'>{loading ? 'loading...' : 'generate questions'}</button>
        </form>
  
        <pre className="mt-4 bg-gray-100 p-2">
          {JSON.stringify(form, null, 2)}
        </pre>

      <form onSubmit={handleGrading}>
        {
            questions.map((qa, index) => (
              <div key={qa.id} className="mb-4">
                <p className='font-semibold'>{index + 1}. {qa.question}</p>
                <textarea
                  className="border w-full p-2"
                  rows={4}
                  value={qa.answer}
                  onChange={(e) => 
                    setQuestions((prev) => prev.map((item) => 
                      item.id === qa.id ? { ...item, answer: e.target.value } : item
                    ))
                  }
                />
              </div>
            ))
          }
          {grading.map((fb, i) => (
            <div key={i} className="bg-white p-4 rounded shadow mb-4">
              <p className="text-gray-700 mb-2"><strong>Q:</strong> {fb.question}</p>
              <p className="text-blue-600 font-medium"><strong>Grade:</strong> {fb.grade}</p>
              <p className="text-gray-800 mt-2"><strong>Feedback:</strong> {fb.feedback}</p>
            </div>
          ))}
          <button type='submit'>{loading ? 'loading...' : 'submit answers'}</button>
      </form>
      </div>
    )
}

export default TestCode
