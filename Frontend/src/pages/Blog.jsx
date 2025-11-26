import { useState } from "react";
import api from "../apiInterceptor.js";
import { toast } from "react-toastify";
import { useEffect } from "react";

const Blog = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);
  const [blogs, setBlogs] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBtnLoading(true);

    const info = {
      title,
      description,
    };
    try {
      const { data } = await api.post(`/api/v1/blog/createBlog`, info);
      setBlogs((prev) => [...prev, data.data])
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setBtnLoading(false);
      setTitle("");
      setDescription("");
    }
  };

  const getAllBlog = async () => {
    const { data } = await api.get("/api/v1/blog/readBlog");
    setBlogs(data.data);
  };

  useEffect(() => {
    getAllBlog();
  }, []);

  return (
    <>
      <div className="max-w-5xl mx-auto mt-32">
        <h2 className="text-2xl font-semibold text-center mb-3">
          Welcome to my blog
        </h2>
        <form onSubmit={handleSubmit} className="mb-4">
          <label
            htmlFor="title"
            className="leading-7 text-sm text-gray-600 font-semibold"
          >
            Title
          </label>
          <input
            onChange={(e) => setTitle(e.target.value)}
            value={title}
            type="text"
            id="title"
            name="title"
            className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
            required
          />

          <label
            htmlFor="description"
            className="leading-7 text-sm text-gray-600 font-semibold"
          >
            Description
          </label>
          <input
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            type="text"
            id="description"
            name="description"
            required
            className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
          />
          <button
            disabled={btnLoading}
            type="submit"
            className="text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg w-full mt-4"
          >
            {btnLoading ? "Submitting" : "Submit"}
          </button>
        </form>
      </div>

      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-semibold mb-3 text-center">All blogs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {blogs.map((blog) => (
            <div key={blog._id} className="border border-gray-700 p-2">
              <h3 className="text-lg font-semibold">{blog.title}</h3>
              <p className="font-semibold text-gray-700">{blog.description}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Blog;
