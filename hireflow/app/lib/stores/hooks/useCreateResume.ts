import { QueryClient, useMutation } from "@tanstack/react-query";
import { createResume } from "../../action";
import { ResumeData } from "@/types/types";

export const useCreateResume = (resume: ResumeData, userId: string) => {
    const queryClient = new QueryClient();
    return useMutation({
        mutationFn: () => createResume(resume, userId) ,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resumes', userId] })
        }
    })
}

