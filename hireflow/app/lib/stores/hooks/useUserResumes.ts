import { useQuery } from "@tanstack/react-query";
import { databases } from "../../appwrite";
import { Query } from "appwrite";

export const useUserResumes = (userId: string) => {
    return useQuery({
        queryKey: ['resume', userId],
        queryFn: async () => {
            const res =  await databases.listDocuments(
                process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
                [ Query.equal('userId', userId) ]
            )
            return res.documents.map((doc) => ({
                ...doc,
                // workExperience: JSON.parse(doc.workExperience),
                // skills: JSON.parse(doc.skills),
                // coverLetterData: doc.coverLetterdata ? JSON.parse(doc.coverLetterdata) : null
            }))
        },
        staleTime: 1000 * 60 * 3
    })
}
