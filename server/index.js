require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const { registerUser, loginUser } = require('./auth');
const { authenticateToken, requireAdmin } = require('./authMiddleware');

// Entry point for the Express backend

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Pustak API!' });
});

app.get('/api/health', async (req, res) => {
  try {
    const result = await db.query('SELECT 1 + 1 AS result');
    res.json({ status: 'ok', db: result.rows[0].result });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

app.post('/api/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const user = await registerUser(email, password, name);
    res.status(201).json({ user });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already exists' });
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const result = await loginUser(email, password);
    if (!result) return res.status(401).json({ error: 'Invalid credentials' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('SELECT id, email, name, bio, avatar_url, role, created_at FROM users WHERE id = $1', [req.user.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Example admin-only route
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await db.query('SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new work (story, poem, novel, essay)
app.post('/api/works', authenticateToken, async (req, res) => {
  const { title, type, description, cover_url, nsfw, visibility } = req.body;
  if (!title || !type) return res.status(400).json({ error: 'Title and type are required' });
  try {
    const result = await db.query(
      `INSERT INTO works (user_id, title, type, description, cover_url, nsfw, visibility)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.user.id, title, type, description, cover_url, nsfw, visibility || 'public']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all published works (public)
app.get('/api/works', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT w.*, u.name as author_name FROM works w
       JOIN users u ON w.user_id = u.id
       WHERE w.status = 'published' AND w.visibility = 'public'
       ORDER BY w.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single work by ID (public if published, or owner)
app.get('/api/works/:id', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT w.*, u.name as author_name FROM works w
       JOIN users u ON w.user_id = u.id
       WHERE w.id = $1`,
      [req.params.id]
    );
    const work = result.rows[0];
    if (!work) return res.status(404).json({ error: 'Not found' });
    if (work.status !== 'published' && work.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    res.json(work);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a chapter to a work (novel)
app.post('/api/works/:workId/chapters', authenticateToken, async (req, res) => {
  const { title, content, order_index } = req.body;
  const workId = req.params.workId;
  // Only the owner or admin can add chapters
  const workResult = await db.query('SELECT * FROM works WHERE id = $1', [workId]);
  const work = workResult.rows[0];
  if (!work) return res.status(404).json({ error: 'Work not found' });
  if (work.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized' });
  }
  try {
    const result = await db.query(
      `INSERT INTO chapters (work_id, title, content, order_index)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [workId, title, content, order_index]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get chapters for a work (public if published, or owner/admin)
app.get('/api/works/:workId/chapters', authenticateToken, async (req, res) => {
  const workId = req.params.workId;
  const workResult = await db.query('SELECT * FROM works WHERE id = $1', [workId]);
  const work = workResult.rows[0];
  if (!work) return res.status(404).json({ error: 'Work not found' });
  if (work.status !== 'published' && work.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized' });
  }
  try {
    const result = await db.query(
      `SELECT * FROM chapters WHERE work_id = $1 ORDER BY order_index ASC, created_at ASC`,
      [workId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a work (owner/admin only)
app.patch('/api/works/:id', authenticateToken, async (req, res) => {
  const workId = req.params.id;
  const { title, description, cover_url, nsfw, visibility, status } = req.body;
  const workResult = await db.query('SELECT * FROM works WHERE id = $1', [workId]);
  const work = workResult.rows[0];
  if (!work) return res.status(404).json({ error: 'Work not found' });
  if (work.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized' });
  }
  try {
    const result = await db.query(
      `UPDATE works SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        cover_url = COALESCE($3, cover_url),
        nsfw = COALESCE($4, nsfw),
        visibility = COALESCE($5, visibility),
        status = COALESCE($6, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *`,
      [title, description, cover_url, nsfw, visibility, status, workId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a work (owner/admin only)
app.delete('/api/works/:id', authenticateToken, async (req, res) => {
  const workId = req.params.id;
  const workResult = await db.query('SELECT * FROM works WHERE id = $1', [workId]);
  const work = workResult.rows[0];
  if (!work) return res.status(404).json({ error: 'Work not found' });
  if (work.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized' });
  }
  try {
    await db.query('DELETE FROM works WHERE id = $1', [workId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a chapter (owner/admin only)
app.patch('/api/works/:workId/chapters/:chapterId', authenticateToken, async (req, res) => {
  const { workId, chapterId } = req.params;
  const { title, content, order_index } = req.body;
  // Check work ownership
  const workResult = await db.query('SELECT * FROM works WHERE id = $1', [workId]);
  const work = workResult.rows[0];
  if (!work) return res.status(404).json({ error: 'Work not found' });
  if (work.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized' });
  }
  try {
    const result = await db.query(
      `UPDATE chapters SET
        title = COALESCE($1, title),
        content = COALESCE($2, content),
        order_index = COALESCE($3, order_index),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4 AND work_id = $5
      RETURNING *`,
      [title, content, order_index, chapterId, workId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Chapter not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a chapter (owner/admin only)
app.delete('/api/works/:workId/chapters/:chapterId', authenticateToken, async (req, res) => {
  const { workId, chapterId } = req.params;
  // Check work ownership
  const workResult = await db.query('SELECT * FROM works WHERE id = $1', [workId]);
  const work = workResult.rows[0];
  if (!work) return res.status(404).json({ error: 'Work not found' });
  if (work.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized' });
  }
  try {
    await db.query('DELETE FROM chapters WHERE id = $1 AND work_id = $2', [chapterId, workId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a tag (admin only)
app.post('/api/tags', authenticateToken, requireAdmin, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Tag name required' });
  try {
    const result = await db.query('INSERT INTO tags (name) VALUES ($1) RETURNING *', [name]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Tag already exists' });
    res.status(500).json({ error: err.message });
  }
});

// Assign tags to a work (owner/admin only)
app.post('/api/works/:workId/tags', authenticateToken, async (req, res) => {
  const { tags } = req.body; // array of tag ids
  const workId = req.params.workId;
  if (!Array.isArray(tags) || tags.length === 0) return res.status(400).json({ error: 'Tags array required' });
  // Check work ownership
  const workResult = await db.query('SELECT * FROM works WHERE id = $1', [workId]);
  const work = workResult.rows[0];
  if (!work) return res.status(404).json({ error: 'Work not found' });
  if (work.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized' });
  }
  try {
    // Remove existing tags
    await db.query('DELETE FROM work_tags WHERE work_id = $1', [workId]);
    // Add new tags
    for (const tagId of tags) {
      await db.query('INSERT INTO work_tags (work_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [workId, tagId]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all tags
app.get('/api/tags', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM tags ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get works by tag
app.get('/api/tags/:tagId/works', async (req, res) => {
  const tagId = req.params.tagId;
  try {
    const result = await db.query(
      `SELECT w.*, u.name as author_name FROM works w
       JOIN users u ON w.user_id = u.id
       JOIN work_tags wt ON w.id = wt.work_id
       WHERE wt.tag_id = $1 AND w.status = 'published' AND w.visibility = 'public'
       ORDER BY w.created_at DESC`,
      [tagId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bookmark a work
app.post('/api/works/:id/bookmark', authenticateToken, async (req, res) => {
  const workId = req.params.id;
  try {
    await db.query(
      `INSERT INTO bookmarks (user_id, work_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [req.user.id, workId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove bookmark
app.delete('/api/works/:id/bookmark', authenticateToken, async (req, res) => {
  const workId = req.params.id;
  try {
    await db.query(
      `DELETE FROM bookmarks WHERE user_id = $1 AND work_id = $2`,
      [req.user.id, workId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's bookmarks
app.get('/api/bookmarks', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT w.*, u.name as author_name FROM bookmarks b
       JOIN works w ON b.work_id = w.id
       JOIN users u ON w.user_id = u.id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Like/react to a work
app.post('/api/works/:id/react', authenticateToken, async (req, res) => {
  const workId = req.params.id;
  const { type } = req.body; // like, heart, clap, fire
  try {
    await db.query(
      `INSERT INTO reactions (user_id, work_id, type) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
      [req.user.id, workId, type || 'like']
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove reaction
app.delete('/api/works/:id/react', authenticateToken, async (req, res) => {
  const workId = req.params.id;
  try {
    await db.query(
      `DELETE FROM reactions WHERE user_id = $1 AND work_id = $2`,
      [req.user.id, workId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get reactions for a work
app.get('/api/works/:id/reactions', async (req, res) => {
  const workId = req.params.id;
  try {
    const result = await db.query(
      `SELECT type, COUNT(*) as count FROM reactions WHERE work_id = $1 GROUP BY type`,
      [workId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a comment (with optional parent for threads)
app.post('/api/works/:id/comments', authenticateToken, async (req, res) => {
  const workId = req.params.id;
  const { content, parent_id } = req.body;
  if (!content) return res.status(400).json({ error: 'Content required' });
  try {
    const result = await db.query(
      `INSERT INTO comments (user_id, work_id, parent_id, content) VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, workId, parent_id || null, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get comments for a work (threaded)
app.get('/api/works/:id/comments', async (req, res) => {
  const workId = req.params.id;
  try {
    const result = await db.query(
      `SELECT * FROM comments WHERE work_id = $1 ORDER BY created_at ASC`,
      [workId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Follow a user
app.post('/api/users/:id/follow', authenticateToken, async (req, res) => {
  const followingId = req.params.id;
  if (parseInt(followingId) === req.user.id) return res.status(400).json({ error: 'Cannot follow yourself' });
  try {
    await db.query(
      `INSERT INTO follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [req.user.id, followingId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Unfollow a user
app.delete('/api/users/:id/follow', authenticateToken, async (req, res) => {
  const followingId = req.params.id;
  try {
    await db.query(
      `DELETE FROM follows WHERE follower_id = $1 AND following_id = $2`,
      [req.user.id, followingId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get followers of a user
app.get('/api/users/:id/followers', async (req, res) => {
  const userId = req.params.id;
  try {
    const result = await db.query(
      `SELECT u.id, u.name, u.avatar_url FROM follows f JOIN users u ON f.follower_id = u.id WHERE f.following_id = $1`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get users followed by a user
app.get('/api/users/:id/following', async (req, res) => {
  const userId = req.params.id;
  try {
    const result = await db.query(
      `SELECT u.id, u.name, u.avatar_url FROM follows f JOIN users u ON f.following_id = u.id WHERE f.follower_id = $1`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Report a work or comment (abuse/moderation)
app.post('/api/reports', authenticateToken, async (req, res) => {
  const { work_id, comment_id, reason } = req.body;
  if (!work_id && !comment_id) return res.status(400).json({ error: 'work_id or comment_id required' });
  if (!reason) return res.status(400).json({ error: 'Reason required' });
  try {
    const result = await db.query(
      `INSERT INTO reports (user_id, work_id, comment_id, reason) VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, work_id || null, comment_id || null, reason]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Get all reports
app.get('/api/admin/reports', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT r.*, u.email as reporter_email FROM reports r JOIN users u ON r.user_id = u.id ORDER BY r.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Update report status (approve/reject)
app.patch('/api/admin/reports/:id', authenticateToken, requireAdmin, async (req, res) => {
  const reportId = req.params.id;
  const { status } = req.body; // 'approved', 'rejected', etc.
  if (!status) return res.status(400).json({ error: 'Status required' });
  try {
    const result = await db.query(
      `UPDATE reports SET status = $1 WHERE id = $2 RETURNING *`,
      [status, reportId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Report not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// (Optional) Notification endpoints placeholder
// You can use a notifications table and polling for MVP, or integrate with a service later.
// Example: Get notifications for a user
// app.get('/api/notifications', authenticateToken, async (req, res) => {
//   // Fetch notifications for req.user.id
// });

// Monetization: Tip a writer (record a tip, no payment gateway integration here)
app.post('/api/works/:id/tip', authenticateToken, async (req, res) => {
  const workId = req.params.id;
  const { amount } = req.body;
  if (!amount || isNaN(amount) || amount <= 0) return res.status(400).json({ error: 'Valid amount required' });
  try {
    // For MVP, just record the tip. In production, integrate with payment gateway.
    await db.query(
      `INSERT INTO tips (user_id, work_id, amount) VALUES ($1, $2, $3)`,
      [req.user.id, workId, amount]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
