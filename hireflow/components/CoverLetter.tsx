import { ResumeData } from '@/types/types';
import React from 'react'

interface coverLetterProps {
  data: ResumeData
}
const CoverLetter = React.forwardRef<HTMLDivElement, coverLetterProps>(({ data }, ref) => {
    const coverLetterContent = data.coverLetterData?.[0]?.coverLetterContent || '';

 return (
      <div
        ref={ref}
        className="bg-white text-gray-900 font-serif w-[210mm] print:h-[180mm] mx-auto p-10 leading-relaxed text-[16px]"
      >
        <header className="mb-6">
          {/* <p className="text-sm">{fullName}</p>
          <p className="text-sm">{email} | {phone}</p>
          {linkedin && <p className="text-sm">{linkedin}</p>} */}
          {/* {address && <p className="text-sm">{address}</p>} */}
        </header>
        <pre className="whitespace-pre-wrap">{coverLetterContent}</pre>
      </div>
    );
})
CoverLetter.displayName = 'cover Letter'
export default CoverLetter