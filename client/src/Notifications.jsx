import { Box, Heading, Text, VStack, Spinner, List, ListItem, ListIcon } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { MdNotificationsActive } from 'react-icons/md';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notifications', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        setNotifications(data.notifications || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <Spinner mt={8} />;

  return (
    <Box maxW="2xl" mx="auto" mt={8}>
      <Heading mb={6} color="purple.700">Notifications</Heading>
      <VStack spacing={4} align="stretch">
        {notifications.length === 0 && <Text>No notifications yet.</Text>}
        <List spacing={3}>
          {notifications.map(n => (
            <ListItem key={n.id} p={3} borderWidth={1} borderRadius="md" bg="whiteAlpha.900">
              <ListIcon as={MdNotificationsActive} color="purple.500" />
              {n.message}
              <Text fontSize="sm" color="gray.500" ml={6}>{new Date(n.created_at).toLocaleString()}</Text>
            </ListItem>
          ))}
        </List>
      </VStack>
    </Box>
  );
}
