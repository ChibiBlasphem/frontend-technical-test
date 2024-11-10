import { useInfiniteQuery } from "@tanstack/react-query";
import { getMemes } from "../api";
import { useAuthToken } from "../contexts/authentication";

export const useMemesFeedQuery = () => {
  const token = useAuthToken();

  return useInfiniteQuery({
    queryKey: ["memes"],
    queryFn: async ({ pageParam }) => {
      return getMemes(token, pageParam);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _pages, lastPageParam) => {
      const pageCount = Math.ceil(lastPage.total / lastPage.pageSize);
      if (pageCount === lastPageParam) {
        return undefined;
      }
      return lastPageParam + 1;
    },
  });
};
