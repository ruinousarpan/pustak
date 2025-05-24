import { Box, Heading, Text, VStack, Avatar, Button, HStack, Spinner, Tabs, TabList, TabPanels, Tab, TabPanel, Input, FormControl, FormLabel, useToast, Autocomplete } from '@chakra-ui/react';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { COUNTRIES } from './countries.js';

export default function EditProfile() {
  const { username } = useParams();
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const toast = useToast();
  const fileInputRef = useRef();

  useEffect(() => {
    fetch(`/api/users/${username}`)
      .then(res => res.json())
      .then(data => {
        setBio(data.user?.bio || '');
        setAvatarUrl(data.user?.avatar_url || '');
        setDisplayName(data.user?.displayName || data.user?.display_name || '');
        setCountry(data.user?.country || '');
        setLoading(false);
      });
  }, [username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      const formData = new FormData();
      formData.append('bio', bio);
      formData.append('displayName', displayName);
      formData.append('country', country);
      if (fileInputRef.current.files[0]) {
        formData.append('avatar', fileInputRef.current.files[0]);
      }
      const res = await fetch(`/api/users/${username}/edit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to update profile');
      setSuccess(true);
      toast({ title: 'Profile updated', status: 'success', duration: 2000, isClosable: true });
    } catch (err) {
      toast({ title: err.message, status: 'error', duration: 2000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner mt={8} />;

  return (
    <Box maxW="lg" mx="auto" mt={8} p={8} borderWidth={1} borderRadius="lg" boxShadow="lg" bg="whiteAlpha.900">
      <Heading mb={6} color="purple.700">Edit Profile</Heading>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel>Bio</FormLabel>
            <Input value={bio} onChange={e => setBio(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel>Display Name</FormLabel>
            <Input value={displayName} onChange={e => setDisplayName(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel>Country</FormLabel>
            <Autocomplete
              value={country}
              onChange={val => setCountry(val)}
              placeholder="e.g. India"
              maxLength={56}
              openOnFocus
              options={COUNTRIES}
              filter={(inputValue, option) =>
                option.toLowerCase().startsWith(inputValue.toLowerCase())
              }
            />
          </FormControl>
          <FormControl>
            <FormLabel>Avatar</FormLabel>
            {avatarUrl && <Avatar src={avatarUrl} size="lg" mb={2} />}
            <Input type="file" accept="image/jpeg,image/png,image/gif,image/webp" ref={fileInputRef} onChange={e => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                if (!file.type.startsWith('image/')) {
                  toast({ title: 'Please select a valid image file.', status: 'error', duration: 2000, isClosable: true });
                  fileInputRef.current.value = '';
                  setAvatarUrl('');
                  return;
                }
                if (file.size > 2 * 1024 * 1024) { // 2MB limit
                  toast({ title: 'Image must be less than 2MB.', status: 'error', duration: 2000, isClosable: true });
                  fileInputRef.current.value = '';
                  setAvatarUrl('');
                  return;
                }
                const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
                if (!allowedTypes.includes(file.type)) {
                  toast({ title: 'Only JPG, PNG, GIF, or WEBP images allowed.', status: 'error', duration: 2000, isClosable: true });
                  fileInputRef.current.value = '';
                  setAvatarUrl('');
                  return;
                }
                const reader = new FileReader();
                reader.onload = (ev) => setAvatarUrl(ev.target.result);
                reader.readAsDataURL(file);
              } else {
                setAvatarUrl('');
              }
            }} />
          </FormControl>
          <Button colorScheme="gray" variant="outline" onClick={() => {
            setAvatarUrl('');
            fileInputRef.current.value = '';
          }} disabled={!avatarUrl} mb={2}>
            Remove Avatar
          </Button>
          <Button colorScheme="purple" type="submit" isLoading={loading}>Save</Button>
          {success && <Text color="green.600">Profile updated!</Text>}
        </VStack>
      </form>
    </Box>
  );
}
