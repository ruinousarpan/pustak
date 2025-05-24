import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react'

import './App.css'

function App() {
  return (
    <Box minH="100vh" bgGradient="linear(to-br, teal.50, purple.50)" py={24} px={4}>
      <VStack spacing={8} maxW="lg" mx="auto" bg="whiteAlpha.900" p={10} borderRadius="xl" boxShadow="lg">
        <Heading size="2xl" color="purple.700">Pustak</Heading>
        <Text fontSize="xl" color="gray.700" textAlign="center">
          Write freely. Read endlessly.<br />
          <span style={{ fontSize: '1.1em', color: '#805ad5' }}>
            The open-source home for writers & readers.
          </span>
        </Text>
        <Button colorScheme="purple" size="lg" as="a" href="#" isDisabled>
          Get Started (Coming Soon)
        </Button>
        <Text fontSize="sm" color="gray.500">
          © {new Date().getFullYear()} Pustak. Open Source. Community Driven.
        </Text>
      </VStack>
    </Box>
  )
}

export default App
