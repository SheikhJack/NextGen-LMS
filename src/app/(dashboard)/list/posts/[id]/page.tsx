import CloudinaryImage from '@/components/CloudinaryImage';
import { getPostBySlug } from '@/lib/actions';

interface SinglePostPageProps {
  params: {
    slug: string;
  };
}

export default async function SinglePostPage({ params }: SinglePostPageProps) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600">The post you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
          
          <div className="flex items-center space-x-4 text-gray-600 mb-6">
            <span>By {post.author}</span>
            <span>•</span>
            <time dateTime={post.createdAt}>
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
          </div>

          {post.excerpt && (
            <p className="text-xl text-gray-700 italic mb-6">{post.excerpt}</p>
          )}
        </header>

        {/* Featured Image */}
        {post.imageUrl && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <CloudinaryImage
              src={post.imageUrl}
              alt={post.title}
              width={800}
              height={400}
              className="w-full h-auto object-cover"
              priority
            />
          </div>
        )}

        {/* Content */}
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </article>
  );
}

// Generate static params for SSG
export async function generateStaticParams() {
  // You might want to fetch all post slugs here
  // const posts = await getPosts(1, 100, 'PUBLISHED');
  // return posts.posts.map((post) => ({ slug: post.slug }));
  
  return []; // Return empty array for dynamic generation
}

export async function generateMetadata({ params }: SinglePostPageProps) {
  const post = await getPostBySlug(params.slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  // Use excerpt or create a description from content
  const description = post.excerpt || 
    post.content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .substring(0, 160) // Limit to 160 characters
      .trim() + '...';

  return {
    title: post.title,
    description: description,
    openGraph: {
      title: post.title,
      description: description,
      images: post.imageUrl ? [post.imageUrl] : [],
      type: 'article',
      publishedTime: post.publishedAt,
    },
  };
}