import { PostCard } from "./BlogPostCard";
import  Pagination  from './Pagination';
import { BlogPost } from "@/lib/types";

export interface PostsGridProps {
  posts:  BlogPost[];
  currentPage: number;
  totalCount: number;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPageChange: (newPage: number) => void;
  itemsPerPage?: number;
  onCreate: () => void;
  deletingPostId?: string | null;
}

const PostsGrid = ({
  posts,
  currentPage,
  totalCount,
  onEdit,
  onDelete,
  onPageChange,
  onCreate,
  itemsPerPage = 6,
  deletingPostId
}: PostsGridProps) => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Grid Layout */}
      <div className="grid grid-cols-1 gap-8 mb-8">
        {posts.map((post) => (
          <div key={post.id} className="flex justify-center">
            <PostCard 
              post={post} 
              onEdit={onEdit} 
              onDelete={onDelete} 
            />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalCount > itemsPerPage && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <Pagination
            page={currentPage}
            count={totalCount}
            
            
          />
        </div>
      )}
    </div>
  );
};

export default PostsGrid;
export { PostCard, Pagination };