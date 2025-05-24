import { Box, Heading, Text, VStack, Spinner, Stat, StatLabel, StatNumber, StatGroup } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        setStats(data.stats || null);
        setLoading(false);
      });
  }, []);

  if (loading) return <Spinner mt={8} />;
  if (!stats) return <Text mt={8}>No analytics data available.</Text>;

  return (
    <Box maxW="2xl" mx="auto" mt={8}>
      <Heading mb={6} color="purple.700">Admin Analytics</Heading>
      <StatGroup>
        <Stat>
          <StatLabel>Users</StatLabel>
          <StatNumber>{stats.users}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Works</StatLabel>
          <StatNumber>{stats.works}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Chapters</StatLabel>
          <StatNumber>{stats.chapters}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Comments</StatLabel>
          <StatNumber>{stats.comments}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Tips</StatLabel>
          <StatNumber>{stats.tips}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Reports</StatLabel>
          <StatNumber>{stats.reports}</StatNumber>
        </Stat>
      </StatGroup>
    </Box>
  );
}
