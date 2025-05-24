import { Box, Heading, Text, VStack, Spinner, HStack, Avatar, Button } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

export default function Follows() {
  const { username } = useParams();
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/users/${username}/followers`).then(res => res.json()),
      fetch(`/api/users/${username}/following`).then(res => res.json())
    ]).then(([followersData, followingData]) => {
      setFollowers(followersData.followers || []);
      setFollowing(followingData.following || []);
      setLoading(false);
    });
  }, [username]);

  if (loading) return <Spinner mt={8} />;

  return (
    <Box mt={8}>
      <Heading size="md" mb={4} color="purple.700">Followers</Heading>
      <VStack align="stretch" spacing={2} mb={6}>
        {followers.length === 0 && <Text>No followers yet.</Text>}
        {followers.map(user => (
          <HStack key={user.id} spacing={3}>
            <Avatar size="sm" name={user.username} />
            <Text fontWeight="bold">{user.username}</Text>
          </HStack>
        ))}
      </VStack>
      <Heading size="md" mb={4} color="purple.700">Following</Heading>
      <VStack align="stretch" spacing={2}>
        {following.length === 0 && <Text>Not following anyone yet.</Text>}
        {following.map(user => (
          <HStack key={user.id} spacing={3}>
            <Avatar size="sm" name={user.username} />
            <Text fontWeight="bold">{user.username}</Text>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
}
