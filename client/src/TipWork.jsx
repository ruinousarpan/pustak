import { Box, Heading, Text, VStack, Spinner, Input, Button, FormControl, FormLabel, FormErrorMessage, useToast } from '@chakra-ui/react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

export default function TipWork() {
  const { id: workId } = useParams();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const res = await fetch(`/api/works/${workId}/tip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send tip');
      setSuccess(true);
      toast({ title: 'Tip sent!', status: 'success', duration: 2000, isClosable: true });
      setAmount('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box mt={8} maxW="sm" mx="auto" p={6} borderWidth={1} borderRadius="lg" boxShadow="lg" bg="whiteAlpha.900">
      <Heading mb={4} size="md" color="purple.700">Send a Tip</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <FormControl isRequired isInvalid={!!error}>
            <FormLabel>Amount</FormLabel>
            <Input type="number" min="1" step="1" value={amount} onChange={e => setAmount(e.target.value)} />
            {error && <FormErrorMessage>{error}</FormErrorMessage>}
          </FormControl>
          <Button colorScheme="purple" type="submit" isLoading={loading}>Send Tip</Button>
          {success && <Text color="green.600">Thank you for supporting the author!</Text>}
        </VStack>
      </form>
    </Box>
  );
}
