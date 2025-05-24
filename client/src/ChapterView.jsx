import { Box, Heading, Text, Spinner } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function ChapterView() {
  const { id: workId, chapterId } = useParams();
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/works/${workId}/chapters/${chapterId}`)
      .then(res => res.json())
      .then(data => {
        setChapter(data.chapter);
        setLoading(false);
      });
  }, [workId, chapterId]);

  if (loading) return <Spinner mt={12} />;
  if (!chapter) return <Text mt={12}>Chapter not found.</Text>;

  return (
    <Box maxW="3xl" mx="auto" mt={8}>
      <Heading mb={4} color="purple.700">{chapter.title}</Heading>
      <Text color="gray.600" mb={2}>{chapter.summary}</Text>
      <Box mt={6} p={4} bg="gray.50" borderRadius="md" whiteSpace="pre-wrap">
        {chapter.content}
      </Box>
    </Box>
  );
}
