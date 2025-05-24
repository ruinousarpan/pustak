import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react';

export default function Dashboard() {
  return (
    <Box maxW="2xl" mx="auto" mt={12} p={8} borderWidth={1} borderRadius="lg" boxShadow="lg" bg="whiteAlpha.900">
      <VStack spacing={6} align="stretch">
        <Heading size="lg" color="purple.700">Welcome to Pustak</Heading>
        <Text fontSize="lg" color="gray.700">
          This is your dashboard. More features coming soon!
        </Text>
        <Button colorScheme="purple" onClick={() => {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }}>
          Logout
        </Button>
      </VStack>
    </Box>
  );
}
