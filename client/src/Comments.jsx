import { Box, Heading, Text, VStack, Spinner, HStack, Avatar, Button } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

export default function Comments() {
  const { id: workId } = useParams();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/works/${workId}/comments`)
      .then(res => res.json())
      .then(data => {
        setComments(data.comments || []);
        setLoading(false);
      });
  }, [workId]);

  if (loading) return <Spinner mt={8} />;

  return (
    <Box mt={8}>
      <Heading size="md" mb={4} color="purple.700">Comments</Heading>
      <VStack align="stretch" spacing={4}>
        {comments.length === 0 && <Text>No comments yet.</Text>}
        {comments.map(comment => (
          <HStack key={comment.id} align="start" spacing={3} p={3} borderWidth={1} borderRadius="md" bg="whiteAlpha.900">
            <Avatar size="sm" name={comment.author_username} />
            <Box>
              <Text fontWeight="bold" color="purple.600">{comment.author_username}</Text>
              <Text fontSize="sm" color="gray.600">{new Date(comment.created_at).toLocaleString()}</Text>
              <Text mt={1}>{comment.content}</Text>
              {/* Threaded replies and actions can go here */}
            </Box>
          </HStack>
        ))}
      </VStack>
      <Button as={Link} to={`/works/${workId}/comments/new`} colorScheme="purple" mt={4}>Add Comment</Button>
    </Box>
  );
}
