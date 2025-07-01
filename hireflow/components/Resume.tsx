'use client'
import React, { useState, useRef, useEffect } from 'react'
import { generateSummary, generateCoverLetter, createResume } from '@/app/lib/action';
import { workExperience, ResumeData, coverLetterData } from '@/types/types';
import ModernResume from './MordernResume';
import { useReactToPrint } from 'react-to-print';
import CoverLetter from './CoverLetter';
import { useUser } from '@/app/lib/stores/hooks/useUser';

const Resume = () => {
  const [resume, setResume] = useState<ResumeData>({
    fullName: 'Ayo Mide',
    email: 'ayo@mide.com',
    phone: '1234567890',
    linkedin: 'https://ayo.com',
    github: 'https://ayo.com',
    summary: '',
    workExperience: [{
      position:'developer',
      company:'google',
      startDate:'',
      endDate:'',
      description:'Built and maintained several internal web apps using React.',
    }],
    skills: ['react', 'javascript', 'LLMs'],
    coverLetterData: [{
      address: '123 Sample Street, Lagos',
      recipientName: 'John doe',
      recipientRole: 'HR',
      targetCompany: 'Amazon',
      targetJobTitle: 'web developer',
      coverLetterContent: '',
    }]
  });
  const [ summary, setSummary ] = useState('');
  const [ loading, setLoading ] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null);
  const coverLetterRef = useRef<HTMLDivElement>(null);
  const [coverLoading, setcoverLoading] = useState(false);
  const [canDownload, setcanDownload] = useState(false);
  const [coverLetterDownload, setcoverLetterDownload] = useState(false)

  const { data: user } = useUser();
  const userId = user?.$id

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
    contentRef: coverLetterRef,
    documentTitle: 'cover letter',
    onAfterPrint() {
      console.log('✅ Cover Letter Printed successfully')
    },
    onPrintError() {
      console.log('an error occured while printing, pls try again!');
      console.trace();
    }
  })

  const safeCoverHandleDownload = () => {
    if(!coverLetterRef.current) return;
    requestAnimationFrame(() => handleCoverDownload());
  };

  useEffect(() => {
    if (summary && contentRef.current) {
      setcanDownload(true)
    }
  }, [summary, contentRef.current])

  useEffect(() => {
    if (resume.coverLetterData?.length !== 0 && coverLetterRef.current) {
      setcoverLetterDownload(true)
    }
  }, [ resume.coverLetterData, coverLetterRef ])

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

// add cover letter data

const addCoverLetter = () => {
  setResume(prev => ({
    ...prev,
    coverLetterData: [
      ...(prev.coverLetterData || []),
      {
        address: '',
        recipientName: '',
        recipientRole: '',
        targetCompany: '',
        targetJobTitle: '',
        coverLetterContent: ''
      }
    ]
  }));
};

const updateCoverLetterData = (
  index: number,
  field: keyof coverLetterData,
  value: string
) => {
  const updated = [
    ...(resume.coverLetterData || [])
  ];
  updated[index][field] = value;
  setResume((prev) => ({...prev, coverLetterData: updated}))
}
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

    // call the LLM API to return the resume summary
    const aisummary = await generateSummary(prompt);
    setResume((prev) => ({ ...prev, summary: aisummary }));
    setSummary(aisummary);

    // save resume into the database
    const newResume = await createResume(resume, userId!);
    console.log(newResume);

    setLoading(false);

   } catch (error) {
    console.log(error);
    console.trace();
    alert(error);
   }
    setLoading(false)
    console.log(resume)
  }

  const generateLetter = async () => {
    if (!isResumeValid(resume)) {
      alert('Please fill in the required resume fields before generating a cover letter.');
      return;
    }

    const prompt = `
      Generate a professional, concise, and ATS-friendly cover letter with this info:
      - Full Name: ${resume.fullName}
      - Skills: ${resume.skills.join(', ')}
      - Work experience: ${resume.workExperience.map(w => `${w.position} at ${w.company}`).join(', ')}
      - cover letter data: ${resume.coverLetterData?.map(cl => `address: ${cl.address} to recipient name: ${cl.recipientName}, recipient role: ${cl.recipientRole}, target company: ${cl.targetCompany}, target job title: ${cl.targetJobTitle}`)}
      - today's date: ${new Date().toLocaleDateString()}

      Use a natural tone. Insert the name, company, and job title where appropriate.
      Omit header/footer and closing like "Sincerely".
      Also, make sure to omit unnecessary informations like where the candidate saw the posting, make it a cover letter that can be sent to the recipient without any further editing.
  `;
      setcoverLoading(true);
      try {
          const letter = await generateCoverLetter(prompt);
          setResume(prev => ({
            ...prev,
            coverLetterData: [
              {
                ...prev.coverLetterData?.[0], // retain existing fields like recipientName
                coverLetterContent: letter,
              }
            ]
          }));
      } catch (error) {
          console.log(error);
          alert(error)
      }
      setcoverLoading(false)
  }

return (
  <div className="bg-gray-50 min-h-screen p-4">
    {/* 💡 CTA Banner to Interview Tool */}
    <div className="max-w-4xl mx-auto mb-6 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-md shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center space-x-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9S3 16.97 3 12 7.03 3 12 3s9 4.03 9 9z" />
        </svg>
        <p className="font-medium text-base md:text-lg">
          Need AI-generated interview questions & feedback?
        </p>
      </div>
      <a
        href="/interview"
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-all font-semibold"
      >
        Try the Interview Generator →
      </a>
    </div>

    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-center text-gray-800">AI Resume & Cover Letter Generator</h1>

      {/* Personal Info */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" value={resume.fullName || ''} onChange={e => handleChange('fullName', e.target.value)} placeholder="Full Name" className="input" required />
          <input type="email" value={resume.email || ''} onChange={e => handleChange('email', e.target.value)} placeholder="Email" className="input" required />
          <input type="tel" value={resume.phone || ''} onChange={e => handleChange('phone', e.target.value)} placeholder="Phone" className="input" />
          <input type="url" value={resume.linkedin || ''} onChange={e => handleChange('linkedin', e.target.value)} placeholder="LinkedIn" className="input" />
          <input type="url" value={resume.github || ''} onChange={e => handleChange('github', e.target.value)} placeholder="GitHub" className="input" />
        </div>
      </div>

      {/* Work Experience */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Work Experience</h2>
        {resume.workExperience.map((we, i) => (
          <div key={i} className="border border-gray-200 p-4 rounded-md space-y-3 bg-gray-50">
            <input placeholder="Position" value={we.position || ''} onChange={e => updateWorkExperience(i, 'position', e.target.value)} className="input" />
            <input placeholder="Company" value={we.company || ''} onChange={e => updateWorkExperience(i, 'company', e.target.value)} className="input" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="month" placeholder="Start Date" value={we.startDate || ''} onChange={e => updateWorkExperience(i, 'startDate', e.target.value)} className="input" />
              <input type="month" placeholder="End Date" value={we.endDate || ''} onChange={e => updateWorkExperience(i, 'endDate', e.target.value)} className="input" />
            </div>
            <textarea placeholder="Description" value={we.description || ''} onChange={e => updateWorkExperience(i, 'description', e.target.value)} className="input textarea" />
          </div>
        ))}
        <button type="button" onClick={addWorkExperience} className="btn-primary w-fit">+ Add Experience</button>
      </div>

      {/* Cover Letter */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Cover Letter</h2>
        {resume.coverLetterData?.map((cl, i) => (
          <div key={i} className="border border-gray-200 p-4 rounded-md space-y-3 bg-gray-50">
            <input placeholder="Address" value={cl.address || ''} onChange={e => updateCoverLetterData(i, 'address', e.target.value)} className="input" />
            <input placeholder="Recipient Name" value={cl.recipientName || ''} onChange={e => updateCoverLetterData(i, 'recipientName', e.target.value)} className="input" />
            <input placeholder="Recipient Role" value={cl.recipientRole || ''} onChange={e => updateCoverLetterData(i, 'recipientRole', e.target.value)} className="input" />
            <input placeholder="Target Company" value={cl.targetCompany || ''} onChange={e => updateCoverLetterData(i, 'targetCompany', e.target.value)} className="input" />
            <input placeholder="Target Job Title" value={cl.targetJobTitle || ''} onChange={e => updateCoverLetterData(i, 'targetJobTitle', e.target.value)} className="input" />
          </div>
        ))}
        <button type="button" onClick={addCoverLetter} className="btn-primary w-fit">+ Add Cover Letter</button>
      </div>

      {/* Skills */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Skills</h2>
        <input type="text" placeholder="e.g. JavaScript, React, LLMs" onChange={updateSkills} className="input" />
      </div>

      {/* Generate Button */}
      <button type="submit" className="btn-primary w-full">
        {loading ? 'Loading...' : 'Generate Resume with AI'}
      </button>
    </form>

    {/* Resume Output */}
    {summary && (
      <div className="max-w-4xl mx-auto mt-10 bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Generated Resume:</h2>
        <ModernResume data={resume} ref={contentRef} />
        <div className="flex justify-end">
          <button onClick={safeHandleDownload} disabled={!canDownload} className="btn-secondary">
            Download Resume
          </button>
        </div>
      </div>
    )}

    {/* Generate Cover Letter */}
    <div className="max-w-4xl mx-auto mt-8 flex justify-center">
      <button onClick={generateLetter} className="btn-primary w-full max-w-md">
        {coverLoading ? 'Loading...' : 'Generate Cover Letter with AI'}
      </button>
    </div>

    {/* Cover Letter Output */}
    {resume.coverLetterData?.[0]?.coverLetterContent && (
      <div className="max-w-4xl mx-auto mt-10 bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Generated Cover Letter:</h2>
        <CoverLetter data={resume} ref={coverLetterRef} />
        <div className="flex justify-end">
          <button onClick={safeCoverHandleDownload} disabled={!coverLetterDownload} className="btn-secondary">
            Download Cover Letter
          </button>
        </div>
      </div>
    )}
  </div>
);
}

export default Resume


// <ModernResume data={resume} ref={contentRef} />