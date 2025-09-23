'use client';

import { BlogPost } from '@/lib/types';
import CloudinaryImage from './CloudinaryImage';

interface PostCard {
  id: string;
  title: string;
  imageUrl?: string;
  intro: string;
  description: string;
  createdAt: string;
  author: string;
  slug: string;
}

interface PostCardProps {
  post: BlogPost;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  deletingPostId?: string | null;
}

export function PostCard({ post, onEdit, onDelete, deletingPostId }: PostCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48 overflow-hidden">
        <CloudinaryImage
          src={post.imageUrl || '/placeholder.jpg'}
          alt={post.title}
          width={400}
          height={200}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 line-clamp-2">{post.title}</h3>
        <p className="text-gray-600 text-sm mb-2">
          By {post.author} • {new Date(post.createdAt).toLocaleDateString()}
        </p>
        <p className="text-gray-700 mb-4 line-clamp-3">{post.excerpt || post.content.substring(0, 150)}...</p>
        
        <div className="flex justify-between items-center">
          <a 
            href={`/blog/${post.slug}`}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Read More →
          </a>
          
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(post.id)}
              className="text-blue-600 hover:text-blue-800 text-sm px-3 py-1 border border-blue-600 rounded hover:bg-blue-50"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(post.id)}
              disabled={deletingPostId === post.id}
              className={`text-red-600 hover:text-red-800 text-sm px-3 py-1 border border-red-600 rounded transition-colors ${
                deletingPostId === post.id 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-red-50'
              }`}
            >
              {deletingPostId === post.id ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}