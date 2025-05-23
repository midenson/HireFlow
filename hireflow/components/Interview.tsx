'use client'
import { generateQuestions } from '@/app/actions/action';
import React, { useState } from 'react'

interface formType {
    jobTitle: string;
    level: string;
    company: string;
    interview: string[]
}

const Interview = () => {
    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState('');

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
        console.log(questions);
        setQuestions(questions);
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

        { questions && <pre>{questions}</pre> }
      </div>
    )
}

export default Interview

// SYSTEM FLOW
    // 1. user enters a job title, level and company
    // 2. user selects type of interview (behavioural, technical, personal etc...)
    // 3. user presses the start button and the LLM generates the questions
    // 4. The clock starts ticking and the user has a specified amount of time before he can't answer the question anymore
    // 5. The LLM grades the user at the end and gives the user candid feedback on how to improve
// LOOKS LIKE THIS WOULD REQUIRE A LOT OF API CALLS, WE MUST OPTIMIZE THE CALLS AND MAKE THE ENTIRE PROCESS AS EFFICIENT AS POSSIBLE