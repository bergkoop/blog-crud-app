const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DB_PATH = path.join(__dirname, "data", "db.json");
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function readDb() {
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

function writeDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

// Blogs

app.get("/api/blogs", (req, res) => {
  res.json(readDb().blogs);
});

app.get("/api/blogs/:id", (req, res) => {
  const blog = readDb().blogs.find((b) => b.id === req.params.id);
  if (!blog) return res.status(404).json({ error: "blog not found" });
  res.json(blog);
});

// Posts

app.get("/api/posts", (req, res) => {
  const db = readDb();
  const { blogId } = req.query;
  const posts = blogId ? db.posts.filter((p) => p.blogId === blogId) : db.posts;
  res.json(posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

app.get("/api/posts/:id", (req, res) => {
  const post = readDb().posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "post not found" });
  res.json(post);
});

app.post("/api/posts", (req, res) => {
  const { blogId, type, title, body, tags } = req.body;
  if (!blogId || !type) {
    return res.status(400).json({ error: "blogId and type are required" });
  }
  const db = readDb();
  if (!db.blogs.some((b) => b.id === blogId)) {
    return res.status(400).json({ error: "unknown blogId" });
  }
  const post = {
    id: "post-" + crypto.randomUUID(),
    blogId,
    type,
    title: title || "",
    body: body || "",
    tags: Array.isArray(tags) ? tags : [],
    notes: 0,
    createdAt: new Date().toISOString(),
  };
  db.posts.push(post);
  writeDb(db);
  res.status(201).json(post);
});

app.put("/api/posts/:id", (req, res) => {
  const db = readDb();
  const post = db.posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "post not found" });
  const { title, body, tags, type } = req.body;
  if (title !== undefined) post.title = title;
  if (body !== undefined) post.body = body;
  if (tags !== undefined) post.tags = tags;
  if (type !== undefined) post.type = type;
  writeDb(db);
  res.json(post);
});

app.delete("/api/posts/:id", (req, res) => {
  const db = readDb();
  const index = db.posts.findIndex((p) => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "post not found" });
  const [removed] = db.posts.splice(index, 1);
  writeDb(db);
  res.json(removed);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`blog-crud-app running at http://localhost:${PORT}`);
});
