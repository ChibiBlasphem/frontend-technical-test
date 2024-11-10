import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Flex, StackDivider, VStack } from "@chakra-ui/react";
import { createMemeComment } from "../../api";
import { useAuthToken } from "../../contexts/authentication";
import { Loader } from "../../components/loader";
import { Fragment } from "react";
import { jwtDecode } from "jwt-decode";
import { useMemesFeedQuery } from "../../queries/useMemesFeedQuery";
import { MemeItem } from "../../components/meme-item";
import { useUserQuery } from "../../queries/useUserQuery";
import { useInView } from "react-intersection-observer";

export const MemeFeedPage: React.FC = () => {
  const queryClient = useQueryClient();
  const token = useAuthToken();
  const {
    isLoading,
    data: memesPages,
    isFetching,
    fetchNextPage,
    hasNextPage,
  } = useMemesFeedQuery();
  const { data: user } = useUserQuery(jwtDecode<{ id: string }>(token).id);
  const { mutate } = useMutation({
    mutationFn: async (data: { memeId: string; content: string }) => {
      await createMemeComment(token, data.memeId, data.content);
    },
  });

  const { ref: sentinelRef } = useInView({
    onChange(inView) {
      if (inView && !isFetching && hasNextPage) {
        fetchNextPage();
      }
    },
  });

  if (isLoading) {
    return <Loader data-testid="meme-feed-loader" />;
  }

  return (
    <Flex width="full" height="full" justifyContent="center" overflowY="auto">
      <VStack
        p={4}
        width="full"
        maxWidth={800}
        divider={<StackDivider border="gray.200" />}
      >
        {memesPages?.pages.map((memes, i) => (
          <Fragment key={i}>
            {memes.results.map((meme) => (
              <MemeItem
                key={meme.id}
                meme={meme}
                user={user}
                onSubmitComment={(memeId, content) => {
                  mutate(
                    { memeId, content: content },
                    {
                      onSuccess: () => {
                        queryClient.invalidateQueries({
                          queryKey: ["memeComments", memeId],
                        });
                      },
                    }
                  );
                }}
              />
            ))}
          </Fragment>
        ))}
        {isFetching && <Loader />}
        {hasNextPage && <Flex ref={sentinelRef} p={4} />}
      </VStack>
    </Flex>
  );
};

export const Route = createFileRoute("/_authentication/")({
  component: MemeFeedPage,
});
