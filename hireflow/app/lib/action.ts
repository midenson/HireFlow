'use server'

import { ResumeData } from "@/types/types";
import { databases } from "./appwrite";
import { ID, Permission, Role } from "appwrite";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function generateQuestions(prompt: string) {
  if (!OPENROUTER_API_KEY) {
    console.error('Missing OpenRouter API key');
    throw new Error('Missing OpenRouter API key');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini', // try a model you’re sure works
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 512,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenRouter API Error:', response.status, errorText);
    throw new Error('AI request failed');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}


export async function generateFeedback(prompt:string) {
  if (!OPENROUTER_API_KEY) {
    console.log('missing api key...');
    throw new Error('missing api key detected...');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 1024
    })
  });

  if (!response.ok) {
    throw new Error("AI request failed");
  }

  const data = await response.json();
  return data.choices[0].message.content;
}


export const generateSummary = async (prompt: string) => {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'content-Type': 'application/json',
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 512,
        })
    });

    if (!response.ok) {
        throw new Error('AI request failed');
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

export const generateCoverLetter = async (prompt: string) => {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'content-Type': 'application/json',
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 512,
        })
    });

    if (!response.ok) {
        throw new Error('AI request failed');
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

export const createResume = async (resume: ResumeData, userId: string) => {
  return await databases.createDocument(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
    process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
    ID.unique(),
    {
      userId,
      fullName: resume.fullName,
      email: resume.email,
      phone: resume.phone,
      linkedin: resume.linkedin,
      github: resume.github,
      summary: resume.summary,
      workExperience: resume.workExperience.map((exp) => JSON.stringify(exp)),
      skills: resume.skills.map((s) => JSON.stringify(s)),
      coverLetterData: resume.coverLetterData?.map((cover) => JSON.stringify(cover))
    },
    [
      Permission.read(Role.any()),
      Permission.write(Role.any()),
      Permission.read(Role.guests()),
      Permission.write(Role.guests()),
    ]
  );
};