import { Box, Heading, VStack, Input, Textarea, Button, FormControl, FormLabel, FormErrorMessage, Tag } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TagsList from './TagsList.jsx';

export default function WorkCreate() {
  const [form, setForm] = useState({ title: '', description: '', tags: [] });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/tags')
      .then(res => res.json())
      .then(data => setTags(data.tags || []));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/works', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ...form, tags: form.tags || [] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create work');
      navigate(`/works/${data.work.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="lg" mx="auto" mt={8} p={8} borderWidth={1} borderRadius="lg" boxShadow="lg" bg="whiteAlpha.900">
      <Heading mb={6} color="purple.700">Create New Work</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel>Title</FormLabel>
            <Input name="title" value={form.title} onChange={handleChange} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Description</FormLabel>
            <Textarea name="description" value={form.description} onChange={handleChange} />
          </FormControl>
          <FormControl>
            <FormLabel>Tags</FormLabel>
            <TagsList onSelectTag={tag => {
              if (!form.tags) setForm({ ...form, tags: [tag.name] });
              else if (!form.tags.includes(tag.name)) setForm({ ...form, tags: [...form.tags, tag.name] });
            }} />
            <Box>
              {form.tags && form.tags.map(t => (
                <Tag key={t} colorScheme="purple" mr={1}>{t}</Tag>
              ))}
            </Box>
          </FormControl>
          {error && <FormErrorMessage color="red.500">{error}</FormErrorMessage>}
          <Button colorScheme="purple" type="submit" isLoading={loading}>Create</Button>
        </VStack>
      </form>
    </Box>
  );
}
