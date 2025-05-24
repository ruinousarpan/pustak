import { Box, Heading, VStack, Input, Textarea, Button, FormControl, FormLabel, FormErrorMessage } from '@chakra-ui/react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function ChapterCreate() {
  const { id: workId } = useParams();
  const [form, setForm] = useState({ title: '', summary: '', content: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/works/${workId}/chapters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create chapter');
      navigate(`/works/${workId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="lg" mx="auto" mt={8} p={8} borderWidth={1} borderRadius="lg" boxShadow="lg" bg="whiteAlpha.900">
      <Heading mb={6} color="purple.700">Add Chapter</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel>Title</FormLabel>
            <Input name="title" value={form.title} onChange={handleChange} />
          </FormControl>
          <FormControl>
            <FormLabel>Summary</FormLabel>
            <Input name="summary" value={form.summary} onChange={handleChange} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Content</FormLabel>
            <Textarea name="content" value={form.content} onChange={handleChange} rows={10} />
          </FormControl>
          {error && <FormErrorMessage color="red.500">{error}</FormErrorMessage>}
          <Button colorScheme="purple" type="submit" isLoading={loading}>Create</Button>
        </VStack>
      </form>
    </Box>
  );
}
