import Post from "../models/Post.js";

export const getPosts = async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
};

export const createPost = async (req, res) => {
  try {
    const post = new Post(req.body);
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a post
export const deletePost = async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.json({ message: "Post deleted" });
};
