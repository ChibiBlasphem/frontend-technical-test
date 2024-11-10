import { Avatar, Box, Flex, Text } from "@chakra-ui/react";
import { GetMemeCommentsResponse } from "../api";
import { useUserQuery } from "../queries/useUserQuery";
import { format } from "timeago.js";

export type CommentItemProps = {
  comment: GetMemeCommentsResponse["results"][number];
};

export const CommentItem = ({ comment }: CommentItemProps) => {
  const { data: commentAuthor } = useUserQuery(comment.authorId);

  return (
    <Flex>
      <Avatar
        borderWidth="1px"
        borderColor="gray.300"
        size="sm"
        name={commentAuthor?.username}
        src={commentAuthor?.pictureUrl}
        mr={2}
      />
      <Box p={2} borderRadius={8} bg="gray.50" flexGrow={1}>
        <Flex justifyContent="space-between" alignItems="center">
          <Flex>
            <Text
              data-testid={`meme-comment-author-${comment.memeId}-${comment.id}`}
            >
              {commentAuthor?.username}
            </Text>
          </Flex>
          <Text fontStyle="italic" color="gray.500" fontSize="small">
            {format(comment.createdAt)}
          </Text>
        </Flex>
        <Text
          color="gray.500"
          whiteSpace="pre-line"
          data-testid={`meme-comment-content-${comment.memeId}-${comment.id}`}
        >
          {comment.content}
        </Text>
      </Box>
    </Flex>
  );
};
