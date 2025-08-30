import express from "express";
import Blog from "../models/Blog.js";

const router = express.Router();

// @desc   Get all blog posts
// @route  GET /api/blogs
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ date: -1 }); // newest first
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @desc   Create a new blog post
// @route  POST /api/blogs
router.post("/", async (req, res) => {
  try {
    const { title, content, author, tags } = req.body;
    const blog = new Blog({ title, content, author, tags });
    await blog.save();
    res.status(201).json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @desc   Get single blog by ID
// @route  GET /api/blogs/:id
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
