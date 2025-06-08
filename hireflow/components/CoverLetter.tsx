import { generateCoverLetter } from '@/app/lib/action';
import { ResumeData } from '@/types/types';
import React, { useState } from 'react'

interface coverLetterProps {
  data: ResumeData
}
const CoverLetter = React.forwardRef<HTMLDivElement, coverLetterProps>(({ data }, ref) => {
  const {
      fullName,
      email,
      phone,
      linkedin,
      address,
      recipientName = "Hiring Manager",
      recipientRole,
      targetCompany = "Company Name",
      coverLetterContent = "",
    } = data;
    const today = new Date().toLocaleDateString();

 return (
      <div
        ref={ref}
        className="bg-white text-gray-900 font-serif w-[210mm] min-h-[297mm] mx-auto p-10 leading-relaxed text-[16px]"
      >
        <header className="mb-6">
          <p className="text-sm">{fullName}</p>
          <p className="text-sm">{email} | {phone}</p>
          {linkedin && <p className="text-sm">{linkedin}</p>}
          {/* {address && <p className="text-sm">{address}</p>} */}
        </header>

        <div className="mb-6">
          <p className="text-sm">{today}</p>
          <p className="mt-4">
            {recipientName}
            {recipientRole && <>, {recipientRole}</>}
            <br />
            {targetCompany}
          </p>
        </div>

        <section className="whitespace-pre-wrap mb-6 text-[15px] leading-[1.7]">
          {coverLetterContent}
        </section>

        <footer className="mt-8">
          <p>Sincerely,</p>
          <p className="mt-2 font-semibold">{fullName}</p>
        </footer>
      </div>
    );
})
CoverLetter.displayName = 'cover Letter'
export default CoverLetter