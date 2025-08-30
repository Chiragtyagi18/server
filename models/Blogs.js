import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    default: "Anonymous",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  tags: {
    type: [String],
    default: [],
  },
});

const Blog = mongoose.model("Blog", blogSchema);
export default Blog;



