'use client';

import { useState } from 'react';

export default function CreatePostModal({ isOpen, onClose, onCreate }: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (post: Post) => void;
}) {
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    intro: '',
    description: '',
    author: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    const newPost = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString(),
    };
    onCreate(newPost);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Create New Post</h2>

        <input
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded"
        />

        <input
          name="imageUrl"
          placeholder="Image URL"
          value={formData.imageUrl}
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded"
        />

        <input
          name="intro"
          placeholder="Intro"
          value={formData.intro}
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded"
        />

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded h-24"
        />

        <input
          name="author"
          placeholder="Author"
          value={formData.author}
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded"
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

type Post = {
  id: string;
  title: string;
  imageUrl: string;
  intro: string;
  description: string;
  createdAt: string;
  author: string;
};