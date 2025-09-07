import Link from 'next/link';
import { useState } from 'react';

export interface BlogPost {
  id: string;
  title: string;
  imageUrl: string;
  intro: string;
  description: string;
  createdAt: string;
  author?: string;
}

interface BlogPostCardProps {
  post: BlogPost;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function BlogPostCard({ post, onEdit, onDelete }: BlogPostCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`w-[250px] h-[500px] border border-gray-200 rounded-t-lg overflow-hidden flex flex-col transition-all duration-300 ${
        isHovered ? 'shadow-lg -translate-y-1' : 'shadow-md'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="h-[150px] overflow-hidden">
        <img 
          src={post.imageUrl || '/placeholder.jpg'} 
          alt={post.title}
          className="w-full h-full object-cover rounded-t-lg"
        />
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{post.title}</h3>
        <p className="text-gray-700 font-medium mb-2 line-clamp-2">{post.intro}</p>
        <p className="text-gray-600 text-sm flex-grow line-clamp-4">{post.description}</p>

        {/* Footer */}
        <div className="mt-4 flex justify-between items-center">
          <span className="text-xs text-gray-500">
            {new Date(post.createdAt).toLocaleDateString()}
          </span>
          
          <div className="flex space-x-2">
            <Link 
              href={`/posts/${post.id}`}
              className="text-blue-500 text-sm hover:underline"
            >
              Read More
            </Link>
            
            {isHovered && (
              <>
                <button 
                  onClick={() => onEdit(post.id)}
                  className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                >
                  Edit
                </button>
                <button 
                  onClick={() => onDelete(post.id)}
                  className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}