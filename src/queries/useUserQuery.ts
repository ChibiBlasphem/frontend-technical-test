import { useQuery } from "@tanstack/react-query";
import { useAuthToken } from "../contexts/authentication";
import { getUserById } from "../api";

export const useUserQuery = (userId: string) => {
  const token = useAuthToken();
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      return await getUserById(token, userId);
    },
  });
};
