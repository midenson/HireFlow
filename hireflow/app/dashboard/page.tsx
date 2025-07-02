'use client';

import { workExperience } from '@/types/types';
import { useUser } from '../lib/stores/hooks/useUser';
import { useUserResumes } from '../lib/stores/hooks/useUserResumes';

const DashboardPage = () => {
  const { data: userData } = useUser();
  const { data: resumes, isLoading } = useUserResumes(userData?.$id);

  if (isLoading) return <p>Loading your resumes...</p>;

  // Helper: Ensure workExperience and coverLetterData are arrays
  const parseArray = (field: string) => {
    if (Array.isArray(field)) return field;
    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  // Gather all valid cover letters
const coverLetters = resumes
  ?.flatMap(resume => {
    return parseArray(resume.coverLetterData).map((cl: string) => {
      const parsedCL = typeof cl === 'string' ? JSON.parse(cl) : cl;
      return {
        ...parsedCL,
        resumeId: resume.$id,
        createdAt: resume.$createdAt,
      };
    });
  })
  .filter(cl => cl.coverLetterContent && cl.coverLetterContent.trim() !== '');


return (
  <div className="bg-gray-50 min-h-screen p-4 space-y-12">
    {/* 💡 CTA Banner to Interview Tool */}
    <div className="max-w-5xl mx-auto mb-6 bg-blue-100 border-l-4 border-blue-500 text-blue-800 p-4 rounded-md shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center space-x-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9S3 16.97 3 12 7.03 3 12 3s9 4.03 9 9z" />
        </svg>
        <p className="font-medium text-base md:text-lg">
          Need a job-winning resume or cover letter powered by AI?
        </p>
      </div>
      <a
        href="/interview"
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-all font-semibold"
      >
        Try the Interview Generator →
      </a>
    </div>

    <div className="max-w-5xl mx-auto space-y-12">
      {/* 📝 Resume Section */}
      <section>
        <h1 className="text-3xl mb-6 font-bold text-gray-800">Your Resumes</h1>

        {resumes?.length === 0 ? (
          <p className="text-gray-600">No resumes found. Go generate one!</p>
        ) : (
          <ul className="space-y-6">
            {resumes?.map((resume) => {
              const workExperience = parseArray(resume.workExperience).map((exp: string | object) =>
                typeof exp === 'string' ? JSON.parse(exp) : exp
              );
              const skills = Array.isArray(resume.skills) ? resume.skills : [];

              return (
                <li key={resume.$id} className="border p-6 rounded-lg shadow-sm bg-white space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">{resume.fullName}</h2>
                    <p className="text-gray-400 text-sm">{new Date(resume.$createdAt).toLocaleString()}</p>
                  </div>
                  <p className="text-gray-700">{resume.email}</p>

                  <div>
                    <h3 className="font-semibold text-md mb-1 text-gray-700">Work Experience</h3>
                    {workExperience.length > 0 ? (
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {workExperience.map((job: workExperience, i: number) => (
                          <li key={i}>
                            <strong>{job.position}</strong> at {job.company} ({job.startDate} – {job.endDate})<br />
                            <span>{job.description}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-400">No work experience added.</p>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold text-md mb-1 text-gray-700">Skills</h3>
                    {skills.length > 0 ? (
                      <ul className="flex flex-wrap gap-2 text-sm text-gray-600">
                        {skills.map((skill: string, index: number) => (
                          <li key={index} className="bg-gray-100 px-2 py-1 rounded">{skill.replace(/"/g, '')}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-400">No skills added.</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* 💌 Cover Letters Section */}
      {coverLetters!.length > 0 && (
        <section>
          <h2 className="text-3xl mb-6 font-bold text-gray-800">Your Cover Letters</h2>
          <ul className="space-y-6">
            {coverLetters?.map((cl, i) => (
              <li key={i} className="border p-6 rounded-lg bg-white shadow space-y-2">
                <p className="text-sm text-gray-400">From resume created on {new Date(cl.createdAt).toLocaleString()}</p>
                <p className="text-gray-700"><strong>To:</strong> {cl.recipientName} ({cl.recipientRole}) at {cl.targetCompany}</p>
                <p className="text-gray-700"><strong>Job Title:</strong> {cl.targetJobTitle}</p>
                <p className="text-gray-700"><strong>Address:</strong> {cl.address}</p>
                <div className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
                  {cl.coverLetterContent}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  </div>
);
};

export default DashboardPage;
