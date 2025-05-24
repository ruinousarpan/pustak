import { Box, Heading, VStack, Text, Spinner } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/bookmarks', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        setBookmarks(data.bookmarks || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <Spinner mt={12} />;

  return (
    <Box maxW="3xl" mx="auto" mt={8}>
      <Heading mb={6} color="purple.700">My Bookmarks</Heading>
      <VStack spacing={4} align="stretch">
        {bookmarks.length === 0 && <Text>No bookmarks yet.</Text>}
        {bookmarks.map(work => (
          <Box key={work.id} p={4} borderWidth={1} borderRadius="md" boxShadow="sm" bg="whiteAlpha.900">
            <Heading size="md" as={Link} to={`/works/${work.id}`} color="purple.600">{work.title}</Heading>
            <Text color="gray.600">by {work.author_username}</Text>
            <Text mt={2}>{work.description}</Text>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}
