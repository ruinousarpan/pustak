import { HStack, IconButton, Text, Tooltip, useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { FaHeart, FaFire, FaHandsClapping, FaThumbsUp } from 'react-icons/fa6';

const reactionTypes = [
  { type: 'like', icon: FaThumbsUp, label: 'Like' },
  { type: 'heart', icon: FaHeart, label: 'Heart' },
  { type: 'clap', icon: FaHandsClapping, label: 'Clap' },
  { type: 'fire', icon: FaFire, label: 'Fire' },
];

export default function Reactions({ workId }) {
  const [counts, setCounts] = useState({});
  const [userReaction, setUserReaction] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetch(`/api/works/${workId}/reactions`)
      .then(res => res.json())
      .then(data => {
        setCounts(data.counts || {});
        setUserReaction(data.userReaction || null);
      });
  }, [workId]);

  const handleReact = async (type) => {
    const method = userReaction === type ? 'DELETE' : 'POST';
    const res = await fetch(`/api/works/${workId}/reactions`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: method === 'POST' ? JSON.stringify({ type }) : undefined,
    });
    if (res.ok) {
      setUserReaction(userReaction === type ? null : type);
      // Refresh counts
      const data = await res.json();
      setCounts(data.counts || {});
      toast({
        title: userReaction === type ? 'Reaction removed' : `Reacted with ${type}`,
        status: 'success',
        duration: 1200,
        isClosable: true,
      });
    }
  };

  return (
    <HStack spacing={4} mt={2} mb={4}>
      {reactionTypes.map(({ type, icon: Icon, label }) => (
        <Tooltip key={type} label={label}>
          <IconButton
            aria-label={label}
            icon={<Icon />}
            colorScheme={userReaction === type ? 'purple' : 'gray'}
            variant={userReaction === type ? 'solid' : 'outline'}
            onClick={() => handleReact(type)}
          />
        </Tooltip>
      ))}
      {reactionTypes.map(({ type }) => (
        <Text key={type} fontSize="sm" color="gray.600">
          {counts[type] || 0}
        </Text>
      ))}
    </HStack>
  );
}
