import {
  Avatar,
  Box,
  Button,
  Collapse,
  Flex,
  Icon,
  Input,
  LinkBox,
  LinkOverlay,
  Text,
  VStack,
} from "@chakra-ui/react";
import { format } from "timeago.js";
import { MemePicture } from "./meme-picture";
import { GetMemesResponse, GetUserByIdResponse } from "../api";
import { Fragment, useState } from "react";
import { CaretDown, CaretUp, Chat } from "@phosphor-icons/react";
import { useMemeCommentsQuery } from "../queries/useMemeCommentsQuery";
import { useQueryClient } from "@tanstack/react-query";
import { useUserQuery } from "../queries/useUserQuery";
import { CommentItem } from "./comment-item";
import { Loader } from "./loader";

export type MemeItemProps = {
  meme: GetMemesResponse["results"][number];
  user?: GetUserByIdResponse;
  onSubmitComment: (memeId: string, comment: string) => void;
};

export const MemeItem = ({ meme, user, onSubmitComment }: MemeItemProps) => {
  const queryClient = useQueryClient();
  const [isCommentSectionOpened, setCommentSectionOpened] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const {
    data: commentsPages,
    isFetching,
    hasNextPage,
    fetchNextPage,
  } = useMemeCommentsQuery(meme.id, {
    skip: !isCommentSectionOpened,
  });
  const { data: memeAuthor } = useUserQuery(meme.authorId);

  return (
    <VStack p={4} width="full" align="stretch">
      <Flex justifyContent="space-between" alignItems="center">
        <Flex>
          <Avatar
            borderWidth="1px"
            borderColor="gray.300"
            size="xs"
            name={memeAuthor?.username}
            src={memeAuthor?.pictureUrl}
          />
          <Text ml={2} data-testid={`meme-author-${meme.id}`}>
            {memeAuthor?.username}
          </Text>
        </Flex>
        <Text fontStyle="italic" color="gray.500" fontSize="small">
          {format(meme.createdAt)}
        </Text>
      </Flex>
      <MemePicture
        pictureUrl={meme.pictureUrl}
        texts={meme.texts}
        dataTestId={`meme-picture-${meme.id}`}
      />
      <Box>
        <Text fontWeight="bold" fontSize="medium" mb={2}>
          Description:{" "}
        </Text>
        <Box p={2} borderRadius={8} border="1px solid" borderColor="gray.100">
          <Text
            color="gray.500"
            whiteSpace="pre-line"
            data-testid={`meme-description-${meme.id}`}
          >
            {meme.description}
          </Text>
        </Box>
      </Box>
      <LinkBox as={Box} py={2} borderBottom="1px solid black">
        <Flex justifyContent="space-between" alignItems="center">
          <Flex alignItems="center">
            <LinkOverlay
              data-testid={`meme-comments-section-${meme.id}`}
              cursor="pointer"
              onClick={() => setCommentSectionOpened((isOpened) => !isOpened)}
              onMouseOver={() => {
                queryClient.prefetchQuery({
                  queryKey: ["memeComments", meme.id],
                  staleTime: 60 * 1000,
                });
              }}
            >
              <Text data-testid={`meme-comments-count-${meme.id}`}>
                {meme.commentsCount} comments
              </Text>
            </LinkOverlay>
            <Icon
              as={isCommentSectionOpened ? CaretUp : CaretDown}
              ml={2}
              mt={1}
            />
          </Flex>
          <Icon as={Chat} />
        </Flex>
      </LinkBox>
      <Collapse in={isCommentSectionOpened} animateOpacity>
        <Box mb={6}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (commentContent) {
                onSubmitComment(meme.id, commentContent);
              }
            }}
          >
            <Flex alignItems="center">
              <Avatar
                borderWidth="1px"
                borderColor="gray.300"
                name={user?.username}
                src={user?.pictureUrl}
                size="sm"
                mr={2}
              />
              <Input
                placeholder="Type your comment here..."
                onChange={(event) => {
                  setCommentContent(event.target.value);
                }}
                value={commentContent}
              />
            </Flex>
          </form>
        </Box>
        <VStack align="stretch" spacing={4}>
          {commentsPages?.pages.map((commentPage, i) => (
            <Fragment key={i}>
              {commentPage.results.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </Fragment>
          ))}
          {!isFetching && hasNextPage && (
            <Flex ps={10}>
              <Button size="xs" onClick={() => !isFetching && fetchNextPage()}>
                Load more comments
              </Button>
            </Flex>
          )}
          {isFetching && <Loader />}
        </VStack>
      </Collapse>
    </VStack>
  );
};
