import { useState } from 'react';
import { Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Textarea, FormControl, FormLabel, FormErrorMessage, useDisclosure, useToast } from '@chakra-ui/react';

export default function ReportWork({ workId }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/works/${workId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit report');
      toast({ title: 'Report submitted', status: 'success', duration: 2000, isClosable: true });
      setReason('');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button colorScheme="red" variant="outline" size="sm" onClick={onOpen} mb={2} ml={2}>Report</Button>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Report Work</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <FormControl isRequired isInvalid={!!error}>
                <FormLabel>Reason</FormLabel>
                <Textarea value={reason} onChange={e => setReason(e.target.value)} rows={4} />
                {error && <FormErrorMessage>{error}</FormErrorMessage>}
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="red" type="submit" isLoading={loading}>Submit</Button>
              <Button onClick={onClose} ml={3}>Cancel</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
}
