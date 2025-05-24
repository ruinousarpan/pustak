import { Box, Heading, Text, VStack, Spinner, Tag, Button, useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ChaptersList from './ChaptersList.jsx';
import Reactions from './Reactions.jsx';
import Comments from './Comments.jsx';
import ReportWork from './ReportWork.jsx';
import TipWork from './TipWork.jsx';

export default function WorkView() {
  const { id } = useParams();
  const [work, setWork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetch(`/api/works/${id}`)
      .then(res => res.json())
      .then(data => {
        setWork(data.work);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (work && work.id) {
      fetch(`/api/works/${work.id}/bookmark`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => res.json())
        .then(data => setBookmarked(data.bookmarked));
    }
  }, [work]);

  useEffect(() => {
    if (work && work.author_username) {
      fetch(`/api/users/${work.author_username}/follow`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => res.json())
        .then(data => setIsFollowing(data.following));
    }
  }, [work]);

  const handleBookmark = async () => {
    const method = bookmarked ? 'DELETE' : 'POST';
    const res = await fetch(`/api/works/${work.id}/bookmark`, {
      method,
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) {
      setBookmarked(!bookmarked);
      toast({
        title: bookmarked ? 'Bookmark removed' : 'Bookmarked!',
        status: 'success',
        duration: 1500,
        isClosable: true,
      });
    }
  };

  const handleFollow = async () => {
    const method = isFollowing ? 'DELETE' : 'POST';
    const res = await fetch(`/api/users/${work.author_username}/follow`, {
      method,
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) {
      setIsFollowing(!isFollowing);
      toast({
        title: isFollowing ? 'Unfollowed' : 'Followed',
        status: 'success',
        duration: 1200,
        isClosable: true,
      });
    }
  };

  if (loading) return <Spinner mt={12} />;
  if (!work) return <Text mt={12}>Work not found.</Text>;

  return (
    <Box maxW="3xl" mx="auto" mt={8}>
      <Heading mb={4} color="purple.700">{work.title}</Heading>
      <Text color="gray.600" mb={2}>by {work.author_username}</Text>
      <Text mb={6}>{work.description}</Text>
      <Box mb={4}>
        {work.tags && work.tags.map(tag => (
          <Tag key={tag} colorScheme="purple" mr={1}>{tag}</Tag>
        ))}
      </Box>
      <Button colorScheme={bookmarked ? 'gray' : 'purple'} variant={bookmarked ? 'outline' : 'solid'} onClick={handleBookmark} mb={4}>
        {bookmarked ? 'Remove Bookmark' : 'Bookmark'}
      </Button>
      <Button colorScheme={isFollowing ? 'gray' : 'purple'} variant={isFollowing ? 'outline' : 'solid'} onClick={handleFollow} mb={4} ml={2}>
        {isFollowing ? 'Unfollow Author' : 'Follow Author'}
      </Button>
      <ReportWork workId={work.id} />
      <Button as={Link} to={`/works/${work.id}/tip`} colorScheme="yellow" variant="outline" size="sm" mb={2} ml={2}>
        Send Tip
      </Button>
      <Reactions workId={work.id} />
      <ChaptersList />
      <Comments />
      {/* Tags, reactions, comments, etc. will go here */}
    </Box>
  );
}
