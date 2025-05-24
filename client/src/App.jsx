import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react'
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import Register from './Register.jsx';
import Login from './Login.jsx';
import Dashboard from './Dashboard.jsx';
import WorksList from './WorksList.jsx';
import WorkCreate from './WorkCreate.jsx';
import WorkView from './WorkView.jsx';
import ChapterCreate from './ChapterCreate.jsx';
import ChapterView from './ChapterView.jsx';
import Bookmarks from './Bookmarks.jsx';
import CommentCreate from './CommentCreate.jsx';
import Follows from './Follows.jsx';
import TipWork from './TipWork.jsx';
import Notifications from './Notifications.jsx';
import Analytics from './Analytics.jsx';
import AdminReports from './AdminReports.jsx';
import UserProfile from './UserProfile.jsx';
import EditProfile from './EditProfile.jsx';

import './App.css'

function RequireAuth({ children }) {
  const token = localStorage.getItem('token');
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <Box as="nav" p={4} bg="purple.600" color="white" mb={8}>
        <VStack direction="row" spacing={4} align="start">
          <Link to="/">Home</Link>
          <Link to="/works">Works</Link>
          <Link to="/bookmarks">Bookmarks</Link>
          <Link to="/notifications">Notifications</Link>
          <Link to="/analytics">Admin Analytics</Link>
          <Link to="/admin-reports">Moderation Reports</Link>
          <Link to="/register">Register</Link>
          <Link to="/login">Login</Link>
        </VStack>
      </Box>
      <Routes>
        <Route path="/" element={
          <Box minH="100vh" bgGradient="linear(to-br, teal.50, purple.50)" py={24} px={4}>
            <VStack spacing={8} maxW="lg" mx="auto" bg="whiteAlpha.900" p={10} borderRadius="xl" boxShadow="lg">
              <Heading size="2xl" color="purple.700">Pustak</Heading>
              <Text fontSize="xl" color="gray.700" textAlign="center">
                Write freely. Read endlessly.<br />
                <span style={{ fontSize: '1.1em', color: '#805ad5' }}>
                  The open-source home for writers & readers.
                </span>
              </Text>
              <Button colorScheme="purple" size="lg" as={Link} to="/register">
                Get Started
              </Button>
              <Text fontSize="sm" color="gray.500">
                © {new Date().getFullYear()} Pustak. Open Source. Community Driven.
              </Text>
            </VStack>
          </Box>
        } />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        } />
        <Route path="/works" element={<WorksList />} />
        <Route path="/works/new" element={
          <RequireAuth>
            <WorkCreate />
          </RequireAuth>
        } />
        <Route path="/works/:id" element={<WorkView />} />
        <Route path="/works/:id/chapters/new" element={
          <RequireAuth>
            <ChapterCreate />
          </RequireAuth>
        } />
        <Route path="/works/:id/chapters/:chapterId" element={<ChapterView />} />
        <Route path="/bookmarks" element={
          <RequireAuth>
            <Bookmarks />
          </RequireAuth>
        } />
        <Route path="/works/:id/comments/new" element={
          <RequireAuth>
            <CommentCreate />
          </RequireAuth>
        } />
        <Route path="/users/:username/follows" element={
          <RequireAuth>
            <Follows />
          </RequireAuth>
        } />
        <Route path="/works/:id/tip" element={
          <RequireAuth>
            <TipWork />
          </RequireAuth>
        } />
        <Route path="/notifications" element={
          <RequireAuth>
            <Notifications />
          </RequireAuth>
        } />
        <Route path="/analytics" element={
          <RequireAuth>
            <Analytics />
          </RequireAuth>
        } />
        <Route path="/admin-reports" element={
          <RequireAuth>
            <AdminReports />
          </RequireAuth>
        } />
        <Route path="/users/:username" element={<UserProfile />} />
        <Route path="/users/:username/edit" element={
          <RequireAuth>
            <EditProfile />
          </RequireAuth>
        } />
      </Routes>
    </Router>
  );
}

export default App
