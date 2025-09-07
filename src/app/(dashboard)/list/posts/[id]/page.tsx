import { useRouter } from 'next/router';
import { BlogPost }  from '@/components/BlogPostCard';

interface SinglePostPageProps {
  post: BlogPost;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function SinglePostPage({ post, onEdit, onDelete }: SinglePostPageProps) {
  const router = useRouter();

  if (!post) {
    return <div className="text-center py-8">Post not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{post.title}</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(post.id)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(post.id)}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Image */}
      <div className="h-96 overflow-hidden rounded-lg mb-6">
        <img
          src={post.imageUrl || '/placeholder.jpg'}
          alt={post.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Meta */}
      <div className="flex space-x-4 text-gray-600 text-sm mb-6">
        <span>By {post.author || 'Unknown'}</span>
        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
      </div>

      {/* Content */}
      <div className="prose max-w-none">
        <p className="text-lg text-gray-800 mb-4">{post.intro}</p>
        <p className="text-gray-700">{post.description}</p>
      </div>
    </div>
  );
}

export async function getServerSideProps(context: any) {
  // In a real app, you would fetch the post data here
  // const res = await fetch(`/api/posts/${context.params.id}`);
  // const post = await res.json();

  const mockPost: BlogPost = {
    id: context.params.id,
    title: "Sample Post",
    imageUrl: "/placeholder.jpg",
    intro: "This is a sample blog post introduction",
    description: "This is the full description of the blog post. It contains all the details and content that wasn't shown in the preview. It can be multiple paragraphs long and contain various formatting.",
    createdAt: new Date().toISOString(),
    author: "John Doe"
  };

  return {
    props: {
      post: mockPost
    }
  };
}