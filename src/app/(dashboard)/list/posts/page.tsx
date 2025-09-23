'use client';

import { useState, useEffect } from 'react';
import BlogPostsGrid from '@/components/BlogPostGrid';
import EditPostModal from '@/components/EditPostModal';
import CreatePostModal from '@/components/CreateModal';
import { deletePost, getPosts } from '@/lib/actions';
import Loader from '@/components/Loader';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  imageUrl?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  author: string;
  createdAt: string;
  publishedAt?: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  const itemsPerPage = 6;

  const loadPosts = async (page: number = 1) => {
    setLoading(true);
    try {
      const result = await getPosts(page, itemsPerPage, 'PUBLISHED');
      setPosts(result.posts);
      setTotalCount(result.totalCount);
      setCurrentPage(page);
      toast.success(`Loaded ${result.posts.length} posts`);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(currentPage);
  }, []);

  const handleCreate = () => {
    setCreateModalOpen(true);
  };

  const handleEdit = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      setEditingPost(post);
      toast.info(`Editing: ${post.title}`);
    }
  };

  const handleDelete = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const promise = new Promise(async (resolve, reject) => {
      try {
        setDeletingPostId(postId);
        const result = await deletePost(postId);
        
        if (result.success) {
          await loadPosts(currentPage);
          resolve('Post deleted successfully');
        } else {
          reject(new Error(result.message || 'Failed to delete post'));
        }
      } catch (error) {
        reject(error);
      } finally {
        setDeletingPostId(null);
      }
    });

    toast.promise(promise, {
      loading: `Deleting "${post.title}"...`,
      success: () => {
        return `Post "${post.title}" has been deleted successfully`;
      },
      error: (error) => {
        return error.message || 'Failed to delete post';
      },
    });
  };

  const confirmDelete = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    toast.custom((t) => (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
        <div className="flex flex-col space-y-3">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-600 text-sm">!</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Delete Post</h3>
              <p className="text-sm text-gray-600 mt-1">
                Are you sure you want to delete "{post.title}"? This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => toast.dismiss(t)}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t);
                handleDelete(postId);
              }}
              className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              disabled={deletingPostId === postId}
            >
              {deletingPostId === postId ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    ), {
      duration: 10000, // 10 seconds
    });
  };

  const handlePageChange = (newPage: number) => {
    toast.info(`Loading page ${newPage}...`);
    loadPosts(newPage);
  };

  const handlePostSaved = (message?: string) => {
    loadPosts(currentPage);
    if (message) {
      toast.success(message);
    } else {
      toast.success('Post saved successfully!');
    }
  };

  const handleCreateSuccess = (message?: string) => {
    setCreateModalOpen(false);
    handlePostSaved(message || 'Post created successfully!');
  };

  const handleEditSuccess = (message?: string) => {
    setEditingPost(null);
    handlePostSaved(message || 'Post updated successfully!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg"><Loader /></div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <div className="text-center sm:text-left">
              <p className="text-lg text-gray-600">
                {totalCount > 0 
                  ? `Showing ${posts.length} of ${totalCount} posts` 
                  : 'No posts yet'
                }
              </p>
            </div>
            
            <Button 
              onClick={handleCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
              size="lg"
            >
              <Plus size={20} />
              Create New Post
            </Button>
          </div>

          {/* Posts Grid */}
          {posts.length > 0 ? (
            <BlogPostsGrid
              posts={posts}
              currentPage={currentPage}
              totalCount={totalCount}
              onEdit={handleEdit}
              onDelete={confirmDelete}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              onCreate={handleCreate}
              deletingPostId={deletingPostId}
            />
          ) : (
            <div className="text-center py-12">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-600 mb-6">Get started by creating your first blog post.</p>
                <Button 
                  onClick={handleCreate}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus size={16} className="mr-2" />
                  Create Your First Post
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {editingPost && (
        <EditPostModal
          post={editingPost}
          onSave={handleEditSuccess}
          onClose={() => setEditingPost(null)}
        />
      )}

      {isCreateModalOpen && (
        <CreatePostModal
          isOpen={isCreateModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </>
  );
}