import React from "react";
import { ResumeData } from "@/types/types";

interface ModernResumeProps {
  data: ResumeData;
}

const ModernResume = React.forwardRef<HTMLDivElement, ModernResumeProps>(
  ({ data }, ref) => {
    return (
      <div
        ref={ref}
        className="print:w-[210mm] print:h-[200mm] w-full h-auto px-[20mm] py-[15mm] box-border bg-white text-black"
      >
        {/* Header */}
        <header className="border-b border-gray-300 pb-4 mb-6">
          <h1 className="text-4xl font-bold">{data.fullName}</h1>
          <div className="text-sm text-gray-600">
            <p>{data.email} | {data.phone}</p>
            <p>
              <a href={data.linkedin} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>{" "}
              |{" "}
              <a href={data.github} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </p>
          </div>
        </header>

        {/* Summary */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-1">Summary</h2>
          <p className="text-gray-700 text-sm">{data.summary}</p>
        </section>

        {/* Experience */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Work Experience</h2>
          {data.workExperience.map((exp, i) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between items-center">
                <h3 className="text-md font-bold text-gray-800">
                  {exp.position} – <span className="font-normal">{exp.company}</span>
                </h3>
                <span className="text-sm text-gray-500">
                  {exp.startDate} – {exp.endDate}
                </span>
              </div>
              <p className="text-sm text-gray-700 mt-1">{exp.description}</p>
            </div>
          ))}
        </section>

        {/* Skills */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Skills</h2>
          <ul className="flex flex-wrap gap-2 text-sm text-gray-700">
            {data.skills.map((skill, i) => (
              <li
                key={i}
                className="bg-gray-200 rounded-full px-3 py-1 text-sm"
              >
                {skill}
              </li>
            ))}
          </ul>
        </section>
      </div>
    );
  }
);

ModernResume.displayName = "ModernResume";
export default ModernResume;
