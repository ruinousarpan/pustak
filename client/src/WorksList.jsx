import { Box, Heading, Button, VStack, Text, Spinner } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import TagsList from './TagsList.jsx';

export default function WorksList() {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Get tag from query string
  const params = new URLSearchParams(location.search);
  const tag = params.get('tag');

  useEffect(() => {
    let url = '/api/works';
    if (tag) url += `?tag=${encodeURIComponent(tag)}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setWorks(data.works || []);
        setLoading(false);
      });
  }, [tag]);

  return (
    <Box maxW="3xl" mx="auto" mt={8}>
      <Heading mb={6} color="purple.700">All Works {tag && `- #${tag}`}</Heading>
      <TagsList />
      <Button as={Link} to="/works/new" colorScheme="purple" mb={6}>Create New Work</Button>
      {loading ? <Spinner /> : (
        <VStack spacing={4} align="stretch">
          {works.length === 0 && <Text>No works found.</Text>}
          {works.map(work => (
            <Box key={work.id} p={4} borderWidth={1} borderRadius="md" boxShadow="sm" bg="whiteAlpha.900">
              <Heading size="md" as={Link} to={`/works/${work.id}`} color="purple.600">{work.title}</Heading>
              <Text color="gray.600">by {work.author_username}</Text>
              <Text mt={2}>{work.description}</Text>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
}
