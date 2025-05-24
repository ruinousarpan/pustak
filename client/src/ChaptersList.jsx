import { Box, Heading, VStack, Text, Button, Spinner } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function ChaptersList() {
  const { id: workId } = useParams();
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/works/${workId}/chapters`)
      .then(res => res.json())
      .then(data => {
        setChapters(data.chapters || []);
        setLoading(false);
      });
  }, [workId]);

  if (loading) return <Spinner />;

  return (
    <Box mt={8}>
      <Heading size="md" mb={4} color="purple.700">Chapters</Heading>
      <VStack align="stretch" spacing={3}>
        {chapters.length === 0 && <Text>No chapters yet.</Text>}
        {chapters.map(chap => (
          <Box key={chap.id} p={3} borderWidth={1} borderRadius="md" bg="whiteAlpha.900">
            <Heading size="sm" as={Link} to={`/works/${workId}/chapters/${chap.id}`} color="purple.600">{chap.title}</Heading>
            <Text color="gray.500">{chap.summary}</Text>
          </Box>
        ))}
      </VStack>
      <Button as={Link} to={`/works/${workId}/chapters/new`} colorScheme="purple" mt={4}>Add Chapter</Button>
    </Box>
  );
}
