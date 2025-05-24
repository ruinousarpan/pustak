import { Box, Tag, TagLabel, Wrap, WrapItem, Spinner, Button } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function TagsList({ onSelectTag }) {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetch('/api/tags')
      .then(res => res.json())
      .then(data => {
        setTags(data.tags || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <Spinner />;

  return (
    <Box mb={4}>
      <Wrap>
        {tags.map(tag => (
          <WrapItem key={tag.id}>
            <Tag
              size="lg"
              colorScheme="purple"
              variant="subtle"
              cursor="pointer"
              onClick={() => {
                if (onSelectTag) onSelectTag(tag);
                else navigate(`/works?tag=${encodeURIComponent(tag.name)}`);
              }}
            >
              <TagLabel>{tag.name}</TagLabel>
            </Tag>
          </WrapItem>
        ))}
      </Wrap>
      <Button mt={2} size="sm" onClick={() => navigate('/works')}>Clear Filter</Button>
    </Box>
  );
}
