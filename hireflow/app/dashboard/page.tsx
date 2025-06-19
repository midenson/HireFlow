'use client';

import { useUser } from '../lib/stores/hooks/useUser';
import { useUserResumes } from '../lib/stores/hooks/useUserResumes';

const DashboardPage = () => {
  const { data: userData } = useUser();
  const { data: resumes, isLoading } = useUserResumes(userData?.$id!);

  if (isLoading) return <p>Loading your resumes...</p>;

  // Helper: Ensure workExperience and coverLetterData are arrays
  const parseArray = (field: any) => {
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
    return parseArray(resume.coverLetterData).map((cl: any) => {
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
    <div className="p-4 space-y-12">
      {/* Resume Section */}
      <section>
        <h1 className="text-2xl mb-4 font-bold">Your Resumes</h1>
        {resumes?.length === 0 ? (
          <p>No resumes found. Go generate one!</p>
        ) : (
          <ul className="space-y-6">
            {resumes?.map((resume) => {
              const workExperience = parseArray(resume.workExperience).map((exp: string | object) => typeof exp === 'string' ? JSON.parse(exp) : exp);
              const skills = Array.isArray(resume.skills) ? resume.skills : [];

              return (
                <li key={resume.$id} className="border p-4 rounded shadow-sm bg-white">
                  <p className="text-gray-500 text-sm">{new Date(resume.$createdAt).toLocaleString()}</p>
                  <h2 className="text-lg font-semibold">{resume.fullName}</h2>
                  <p>{resume.email}</p>

                  <div className="mt-3">
                    <h3 className="font-semibold text-md mb-1">Work Experience</h3>
                    {workExperience.length > 0 ? (
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {workExperience.map((job: any, i: number) => (
                          <li key={i}>
                            <strong>{job.position}</strong> at {job.company} ({job.startDate} – {job.endDate})<br />
                            <span className="text-gray-600">{job.description}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No work experience added.</p>
                    )}
                  </div>

                  <div className="mt-3">
                    <h3 className="font-semibold text-md mb-1">Skills</h3>
                    {skills.length > 0 ? (
                      <ul className="list-disc list-inside text-sm">
                        {resume.skills.map((skill: string, index: number) => (
                          <li key={index}>{skill.replace(/"/g, '')}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No skills added.</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Cover Letters Section */}
      {coverLetters!.length > 0 && (
        <section>
          <h2 className="text-2xl mb-4 font-bold">Your Cover Letters</h2>
          <ul className="space-y-6">
            {coverLetters?.map((cl, i) => (
              <li key={i} className="border p-4 rounded bg-gray-50 shadow-sm">
                <p className="text-sm text-gray-500">From resume created on {new Date(cl.createdAt).toLocaleString()}</p>
                <p><strong>To:</strong> {cl.recipientName} ({cl.recipientRole}) at {cl.targetCompany}</p>
                <p><strong>Job Title:</strong> {cl.targetJobTitle}</p>
                <p><strong>Address:</strong> {cl.address}</p>
                <div className="mt-2 whitespace-pre-wrap text-sm">
                  {cl.coverLetterContent}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default DashboardPage;
