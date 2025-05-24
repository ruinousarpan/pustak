import { Box, Heading, Text, VStack, Avatar, Button, HStack, Spinner, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

export default function UserProfile() {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/users/${username}`).then(res => res.json()),
      fetch(`/api/users/${username}/works`).then(res => res.json())
    ]).then(([userData, worksData]) => {
      setUser(userData.user || null);
      setWorks(worksData.works || []);
      setLoading(false);
    });
  }, [username]);

  if (loading) return <Spinner mt={8} />;
  if (!user) return <Text mt={8}>User not found.</Text>;

  return (
    <Box maxW="3xl" mx="auto" mt={8}>
      <HStack spacing={6} mb={6}>
        <Avatar size="xl" name={user.username} src={user.avatar_url} />
        <VStack align="start" spacing={1}>
          <Heading size="lg" color="purple.700">{user.displayName || user.display_name || user.username}</Heading>
          <Text color="gray.600">@{user.username}</Text>
          {user.country && <Text color="gray.600">{user.country}</Text>}
          <Text color="gray.600">{user.bio || 'No bio yet.'}</Text>
          <Button as={Link} to={`/users/${user.username}/edit`} size="sm" colorScheme="purple">Edit Profile</Button>
          <Button as={Link} to={`/users/${user.username}/follows`} size="sm" colorScheme="purple">Followers/Following</Button>
        </VStack>
      </HStack>
      <Tabs variant="enclosed">
        <TabList>
          <Tab>Works</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <VStack align="stretch" spacing={4}>
              {works.length === 0 && <Text>No works yet.</Text>}
              {works.map(work => (
                <Box key={work.id} p={4} borderWidth={1} borderRadius="md" boxShadow="sm" bg="whiteAlpha.900">
                  <Heading size="md" as={Link} to={`/works/${work.id}`} color="purple.600">{work.title}</Heading>
                  <Text color="gray.600">{work.description}</Text>
                </Box>
              ))}
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
