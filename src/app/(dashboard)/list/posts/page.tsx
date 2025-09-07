"use client"

import { useState } from 'react';
import BlogPostsGrid from '@/components/BlogPostGrid';
import EditPostModal from '@/components/EditPostModal';
import { BlogPost } from '@/components/BlogPostCard';
import CreatePostModal from '@/components/CreateModal';

export default function Home() {
  const [posts, setPosts] = useState<BlogPost[]>([
    {
      id: '1',
      title: 'Getting Started with Next.js',
      imageUrl: '/placeholder.jpg',
      intro: 'Learn how to build modern web applications with Next.js',
      description: 'Next.js is a React framework that enables server-side rendering and static site generation. It provides an excellent developer experience with features like file-based routing, API routes, and built-in CSS support.',
      createdAt: new Date().toISOString(),
      author: 'Jane Smith'
    },
    {
      id: '2',
      title: 'Getting Started with Next.js',
      imageUrl: '/placeholder.jpg',
      intro: 'Learn how to build modern web applications with Next.js',
      description: 'Next.js is a React framework that enables server-side rendering and static site generation. It provides an excellent developer experience with features like file-based routing, API routes, and built-in CSS support.',
      createdAt: new Date().toISOString(),
      author: 'Jane Smith'
    },
    {
      id: '3',
      title: 'Getting Started with Next.js',
      imageUrl: '/placeholder.jpg',
      intro: 'Learn how to build modern web applications with Next.js',
      description: 'Next.js is a React framework that enables server-side rendering and static site generation. It provides an excellent developer experience with features like file-based routing, API routes, and built-in CSS support.',
      createdAt: new Date().toISOString(),
      author: 'Jane Smith'
    },
    {
      id: '4',
      title: 'Getting Started with Next.js',
      imageUrl: '/placeholder.jpg',
      intro: 'Learn how to build modern web applications with Next.js',
      description: 'Next.js is a React framework that enables server-side rendering and static site generation. It provides an excellent developer experience with features like file-based routing, API routes, and built-in CSS support.',
      createdAt: new Date().toISOString(),
      author: 'Jane Smith'
    },

  ]);

  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const editingPost = editingPostId ? posts.find(p => p.id === editingPostId) : null;

  const handleCreate = () => {
    setCreateModalOpen(true);
  };

  const handleEdit = (postId: string) => {
    setEditingPostId(postId);
  };

  const handleSave = (updatedPost: BlogPost) => {
    setPosts(posts.map(post => post.id === updatedPost.id ? updatedPost : post));
    setEditingPostId(null);
  };

  const handleDelete = (postId: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      setPosts(posts.filter(post => post.id !== postId));
    }
  };

  const handleAddPost = (newPost: BlogPost) => {
    setPosts(prev => [...prev, newPost]);
    setCreateModalOpen(false);
  };

  return (
    <>
      <BlogPostsGrid
        posts={posts}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {editingPost && (
        <EditPostModal
          post={editingPost}
          onSave={handleSave}
          onClose={() => setEditingPostId(null)}
        />
      )}

      {isCreateModalOpen && (
        <CreatePostModal
          isOpen={isCreateModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onCreate={handleAddPost}
        />
      )}
    </>
  );
}