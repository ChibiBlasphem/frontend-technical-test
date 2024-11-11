import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuthToken } from "../contexts/authentication";
import { getMemeComments } from "../api";

export const useMemeCommentsQuery = (
  memeId: string,
  { skip }: { skip: boolean }
) => {
  const token = useAuthToken();

  return useInfiniteQuery({
    queryKey: ["memeComments", memeId],
    queryFn: ({ pageParam }) => {
      return getMemeComments(token, memeId, pageParam);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _pages, lastPageParam) => {
      const pageCount = Math.ceil(lastPage.total / lastPage.pageSize);
      if (pageCount <= lastPageParam) {
        return undefined;
      }
      return lastPageParam + 1;
    },
    enabled: !skip,
  });
};
