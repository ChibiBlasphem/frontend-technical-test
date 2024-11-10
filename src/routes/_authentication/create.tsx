import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MemeEditor } from "../../components/meme-editor";
import { useMemo, useState } from "react";
import { MemePictureProps } from "../../components/meme-picture";
import { Plus, Trash } from "@phosphor-icons/react";
import { createMeme } from "../../api";
import { useAuthToken } from "../../contexts/authentication";
import { useMutation } from "@tanstack/react-query";

export const Route = createFileRoute("/_authentication/create")({
  component: CreateMemePage,
});

type Picture = {
  url: string;
  file: File;
};

function CreateMemePage() {
  const token = useAuthToken();
  const navigate = useNavigate();
  const [picture, setPicture] = useState<Picture | null>(null);
  const [description, setDescription] = useState<string>("");
  const [texts, setTexts] = useState<MemePictureProps["texts"]>([]);
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: { formData: FormData }) => {
      await createMeme(token, data.formData);
    },
  });

  const handleDrop = (file: File) => {
    setPicture({
      url: URL.createObjectURL(file),
      file,
    });
  };

  const handleAddCaptionButtonClick = () => {
    setTexts([
      ...texts,
      {
        content: `New caption ${texts.length + 1}`,
        x: Math.round(Math.random() * 400),
        y: Math.round(Math.random() * 225),
      },
    ]);
  };

  const handleDeleteCaptionButtonClick = (index: number) => {
    setTexts(texts.filter((_, i) => i !== index));
  };

  const handleChangeCaption = (index: number, key: string, content: string) => {
    setTexts(
      texts.map((text, i) => {
        if (i !== index) return text;
        return { ...text, [key]: content };
      })
    );
  };

  const handleMemeSubmit = () => {
    const formData = new FormData();
    if (!picture) {
      return;
    }

    formData.append("picture", picture.file);
    formData.append("description", description);

    for (let i = 0; i < texts.length; ++i) {
      formData.append(`texts[${i}][content]`, texts[i].content);
      formData.append(`texts[${i}][x]`, texts[i].x.toString());
      formData.append(`texts[${i}][y]`, texts[i].y.toString());
    }

    mutate(
      { formData },
      {
        onSuccess() {
          navigate({ to: "/" });
        },
      }
    );
  };

  const memePicture = useMemo(() => {
    if (!picture) {
      return undefined;
    }

    return {
      pictureUrl: picture.url,
      texts,
    };
  }, [picture, texts]);

  return (
    <Flex width="full" height="full">
      <Box flexGrow={1} height="full" p={4} overflowY="auto">
        <VStack spacing={5} align="stretch">
          <Box>
            <Heading as="h2" size="md" mb={2}>
              Upload your picture
            </Heading>
            <MemeEditor onDrop={handleDrop} memePicture={memePicture} />
          </Box>
          <Box>
            <Heading as="h2" size="md" mb={2}>
              Describe your meme
            </Heading>
            <Textarea
              placeholder="Type your description here..."
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
              }}
            />
          </Box>
        </VStack>
      </Box>
      <Flex
        flexDir="column"
        width="30%"
        minW="250"
        height="full"
        boxShadow="lg"
      >
        <Heading as="h2" size="md" mb={2} p={4}>
          Add your captions
        </Heading>
        <Box p={4} flexGrow={1} height={0} overflowY="auto">
          <VStack>
            {texts.map((text, index) => (
              <Flex width="full">
                <Flex direction="column" mr={1} gap={1}>
                  <Input
                    key={`text-value-${index}`}
                    value={text.content}
                    onChange={(event) => {
                      handleChangeCaption(index, "content", event.target.value);
                    }}
                  />
                  <Flex gap={1}>
                    <Input
                      key={`text-x-${index}`}
                      type="number"
                      value={text.x}
                      onChange={(event) => {
                        handleChangeCaption(index, "x", event.target.value);
                      }}
                    />
                    <Input
                      key={`text-y-${index}`}
                      type="number"
                      value={text.y}
                      onChange={(event) => {
                        handleChangeCaption(index, "y", event.target.value);
                      }}
                    />
                  </Flex>
                </Flex>
                <IconButton
                  onClick={() => handleDeleteCaptionButtonClick(index)}
                  aria-label="Delete caption"
                  icon={<Icon as={Trash} />}
                />
              </Flex>
            ))}
            <Button
              colorScheme="cyan"
              leftIcon={<Icon as={Plus} />}
              variant="ghost"
              size="sm"
              width="full"
              onClick={handleAddCaptionButtonClick}
              isDisabled={memePicture === undefined}
            >
              Add a caption
            </Button>
          </VStack>
        </Box>
        <HStack p={4}>
          <Button
            as={Link}
            to="/"
            colorScheme="cyan"
            variant="outline"
            size="sm"
            width="full"
          >
            Cancel
          </Button>
          <Button
            colorScheme="cyan"
            size="sm"
            width="full"
            color="white"
            isDisabled={memePicture === undefined || !description || isPending}
            onClick={handleMemeSubmit}
          >
            Submit
          </Button>
        </HStack>
      </Flex>
    </Flex>
  );
}
