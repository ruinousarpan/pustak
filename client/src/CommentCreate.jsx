import { Box, Heading, VStack, Textarea, Button, FormControl, FormLabel, FormErrorMessage } from '@chakra-ui/react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function CommentCreate() {
  const { id: workId } = useParams();
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/works/${workId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add comment');
      navigate(`/works/${workId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="lg" mx="auto" mt={8} p={8} borderWidth={1} borderRadius="lg" boxShadow="lg" bg="whiteAlpha.900">
      <Heading mb={6} color="purple.700">Add Comment</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel>Comment</FormLabel>
            <Textarea value={content} onChange={e => setContent(e.target.value)} rows={5} />
          </FormControl>
          {error && <FormErrorMessage color="red.500">{error}</FormErrorMessage>}
          <Button colorScheme="purple" type="submit" isLoading={loading}>Submit</Button>
        </VStack>
      </form>
    </Box>
  );
}
