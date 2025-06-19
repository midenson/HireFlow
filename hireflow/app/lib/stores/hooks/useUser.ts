import { useQuery } from "@tanstack/react-query";
import { account } from "../../appwrite";

export const useUser = () => {
    return useQuery({
        queryKey: ['user'],
        queryFn: async () => await account.get(),
        staleTime: 1000 * 60 * 5,
        retry: false
    })
}