'use client'
import React, { useState, useRef } from 'react'
import { generateSummary, generateCoverLetter } from '@/app/actions/action';
import { workExperience, ResumeData } from '@/types/types';
import ModernResume from './MordernResume';
import { useReactToPrint } from 'react-to-print';
import CoverLetter from './CoverLetter';

const Resume = () => {
  const [resume, setResume] = useState<ResumeData>({
    fullName: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    summary: '',
    workExperience: [{
      position:'',
      company:'',
      startDate:'',
      endDate:'',
      description:'',
    }],
    skills: []
  });
  const [ summary, setSummary ] = useState('');
  const [ loading, setLoading ] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const coverLetterRef = useRef<HTMLDivElement>(null);
  const [coverLoading, setcoverLoading] = useState(false);

  const handleDownload = useReactToPrint({ 
    contentRef: contentRef,
    documentTitle: 'resume',
    onAfterPrint() {
      console.log('✅ Printed successfully')
    },
    onPrintError() {
      console.log('an error occured while printing, pls try again!')
    }
  })

  const safeHandleDownload = () => {
    if(!contentRef.current) return;
    requestAnimationFrame(() => handleDownload());
  };

// cover letter download

  const handleCoverDownload = useReactToPrint({ 
    contentRef: coverRef,
    documentTitle: 'cover letter',
    onAfterPrint() {
      console.log('✅ Printed successfully')
    },
    onPrintError() {
      console.log('an error occured while printing, pls try again!')
    }
  })

  // safe cover letter download

  const safeHandleCoverDownload = () => {
    if(!contentRef.current) return;
    requestAnimationFrame(() => handleCoverDownload());
  };

  const addWorkExperience = () => {
    setResume((prev) => ({
      ...prev, workExperience: [...prev.workExperience, { position: '', company: '', startDate: '', endDate: '', description: '' }]
    }))
  };
  const updateWorkExperience = (index: number, field: keyof workExperience, value: string) => {
    const updated = [...resume.workExperience];
    updated[index][field] = value;
    setResume((prev) => ({...prev, workExperience: updated}))
  };

  const updateSkills = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const skillArray = value.split(', ').map(s => s.trim());
    setResume((prev) => ({ ...prev, skills: skillArray }))
  };

  const handleChange = (field: keyof ResumeData, value: string) => {
    setResume((prev) => ({ ...prev, [field]: value }));
  };

// function to check if resume field is valid

  const isResumeValid = (data: ResumeData) => {
  if (!data.fullName.trim() || !data.email.trim()) return false;
  if (!data.skills || data.skills.length === 0) return false;
  if (!data.workExperience || data.workExperience.length === 0) return false;

  const hasValidWork = data.workExperience.some(
    (w) =>
      w.position.trim() &&
      w.company.trim() &&
      w.startDate &&
      w.endDate &&
      w.description.trim()
  );

  return hasValidWork;
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

   try {

    const prompt = `
    Generate a professional, concise, and ATS-friendly resume summary for the following information:

    ${resume.fullName}, with skills in ${resume.skills.join(', ')}.
    Work experience includes ${resume.workExperience
      .map(w => `${w.position} at ${w.company}`)
      .join(', ')}.

    Write in the first person, around 3-4 sentences.
  `;

    const aisummary = await generateSummary(prompt);
    setResume((prev) => ({ ...prev, summary: aisummary }));
    setSummary(aisummary);
    setLoading(false);

   } catch (error) {
    console.log(error);
    alert(error);
   }
    console.log(resume)
  }

  const generateLetter = async () => {
    if (!isResumeValid(resume)) {
      alert('Please fill in the required resume fields before generating a cover letter.');
      return;
    }

    const prompt = `
    Generate a professional, concise, and ATS-friendly cover letter for job seeking candidate with the following information:
    ${resume.fullName}, with skills in ${resume.skills.join(', ')}.
    Work experience includes ${resume.workExperience
      .map(w => `${w.position} at ${w.company}`)
      .join(', ')}.

    Write in the first person. Make sure to fill in the full name, company name and all other relevant information in the spaces provided.
  `;
      setcoverLoading(true);
      try {
          const letter = await generateCoverLetter(prompt);
          setResume((prev) => ({...prev, coverLetterContent: letter}))
      } catch (error) {
          console.log(error);
          alert(error)
      }
      setcoverLoading(false)
  }

  return (
    <div>
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-4 space-y-6">
      <div>
        <label>Full Name</label>
        <input
          type="text"
          value={resume.fullName}
          onChange={e => handleChange('fullName', e.target.value)}
          className="input"
          required
        />
      </div>
      <div>
        <label>Email</label>
        <input
          type="email"
          value={resume.email}
          onChange={e => handleChange('email', e.target.value)}
          className="input"
          required
        />
      </div>
      <div>
        <label>Phone</label>
        <input
          type="tel"
          value={resume.phone}
          onChange={e => handleChange('phone', e.target.value)}
          className="input"
        />
      </div>
      <div>
        <label>LinkedIn</label>
        <input
          type="url"
          value={resume.linkedin}
          onChange={e => handleChange('linkedin', e.target.value)}
          className="input"
        />
      </div>
      <div>
        <label>GitHub</label>
        <input
          type="url"
          value={resume.github}
          onChange={e => handleChange('github', e.target.value)}
          className="input"
        />
      </div>
      {/* <div>
        <label>Summary</label>
        <textarea
          value={resume.summary}
          onChange={e => handleChange('summary', e.target.value)}
          className="input textarea"
        />
      </div> */}

      <div>
        <label>Work Experience</label>
        {resume.workExperience.map((we, i) => (
          <div key={i} className="border p-3 rounded mb-3 space-y-2">
            <input
              placeholder="Position"
              value={we.position}
              onChange={e => updateWorkExperience(i, 'position', e.target.value)}
              className="input"
            />
            <input
              placeholder="Company"
              value={we.company}
              onChange={e => updateWorkExperience(i, 'company', e.target.value)}
              className="input"
            />
            <input
              type='month'
              placeholder="Start Date"
              value={we.startDate}
              onChange={e => updateWorkExperience(i, 'startDate', e.target.value)}
              className="input"
            />
            <input
              type="month"
              placeholder="End Date"
              value={we.endDate}
              onChange={e => updateWorkExperience(i, 'endDate', e.target.value)}
              className="input"
            />
            <textarea
              placeholder="Description"
              value={we.description}
              onChange={e => updateWorkExperience(i, 'description', e.target.value)}
              className="input textarea"
            />
          </div>
        ))}
        <button type="button" onClick={addWorkExperience} className="btn-primary">
          Add Experience
        </button>
      </div>

      <div>
        <label>Skills (comma separated)</label>
        <input type="text" onChange={updateSkills} className="input" />
      </div>

      <button type="submit" className="btn-primary w-full">
        { loading ? 'loading...' : 'Generate Resume with AI' }
      </button>
    </form>
    {summary && (
        <div className="mt-6 bg-white p-4 border rounded shadow">
          <h2 className="font-semibold mb-2">Generated Resume:</h2>
          <pre className="whitespace-pre-wrap">{summary}</pre>
          <div>
            <ModernResume data={resume} ref={contentRef} />
            <button
              onClick={safeHandleDownload}
              disabled={!contentRef.current}
              className="p-3 bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Download Resume
            </button>
          </div>
        </div>
      )}

    <div>
      <button
        onClick={generateLetter}
        className="p-3 bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        { coverLoading ? 'loading...' : ' generate cover letter with AI' }
      </button>
    </div>
    {resume.coverLetterContent && (
        <div className="mt-6 bg-white p-4 border rounded shadow">
          <h2 className="font-semibold mb-2">Generated cover letter:</h2>
          <div>
            <CoverLetter data={resume} ref={coverLetterRef}/>
            <button
              onClick={safeHandleCoverDownload}
              disabled={!coverRef.current}
              className="p-3 bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              download cover letter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Resume
