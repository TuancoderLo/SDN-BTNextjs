'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { protectedAPI, publicAPI } from '@/utils/api'
import { Star, MessageCircle, Send, Edit, Trash2, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface Comment {
  _id: string
  content: string
  rating?: number
  user: {
    _id: string
    name: string
    email: string
  }
  createdAt: string
  isApproved: boolean
}

interface CommentSectionProps {
  perfumeId: string
  isAdmin?: boolean
}

export default function CommentSection({ perfumeId, isAdmin = false }: CommentSectionProps) {
  const { isAuthenticated, backendUser } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [newRating, setNewRating] = useState(0)
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editRating, setEditRating] = useState(0)
  const currentUserId = backendUser?._id || ''

  useEffect(() => {
    fetchComments()
  }, [perfumeId])

  const fetchComments = async () => {
    try {
      setLoading(true)
      const response = await publicAPI.getPerfumeComments(perfumeId)
      setComments(response.data)
    } catch (error: any) {
      console.error('Error fetching comments:', error)
      toast.error('Failed to load comments')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error('Please log in to comment')
      return
    }

    if (!newComment.trim()) {
      toast.error('Please enter a comment')
      return
    }

    try {
      setSubmitting(true)
      await protectedAPI.addComment(perfumeId, {
        content: newComment.trim(),
        rating: newRating > 0 ? newRating : undefined
      })
      
      setNewComment('')
      setNewRating(0)
      fetchComments()
      toast.success('Comment added successfully')
      // Trigger rating update in PerfumeGrid
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('commentAdded', { detail: { perfumeId } }))
      }
    } catch (error: any) {
      console.error('Error adding comment:', error)
      if (error.response?.status === 400) {
        toast.error(error.response?.data?.message || 'You have already commented on this perfume.')
      } else {
        toast.error(error.response?.data?.message || 'Failed to add comment')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) {
      toast.error('Please enter a comment')
      return
    }

    try {
      await protectedAPI.updateComment(commentId, {
        content: editContent.trim(),
        rating: editRating > 0 ? editRating : undefined
      })
      
      setEditingComment(null)
      setEditContent('')
      setEditRating(0)
      fetchComments()
      toast.success('Comment updated successfully')
      // Trigger rating update in PerfumeGrid
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('commentAdded', { detail: { perfumeId } }))
      }
    } catch (error: any) {
      console.error('Error updating comment:', error)
      toast.error('Failed to update comment')
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      await protectedAPI.deleteComment(commentId)
      fetchComments()
      toast.success('Comment deleted successfully')
      // Trigger rating update in PerfumeGrid
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('commentAdded', { detail: { perfumeId } }))
      }
    } catch (error: any) {
      console.error('Error deleting comment:', error)
      toast.error('Failed to delete comment')
    }
  }

  const handleToggleApproval = async (commentId: string, isApproved: boolean) => {
    try {
      await protectedAPI.updateComment(commentId, { isApproved: !isApproved })
      fetchComments()
      toast.success(`Comment ${!isApproved ? 'approved' : 'unapproved'}`)
      // Trigger rating update in PerfumeGrid
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('commentAdded', { detail: { perfumeId } }))
      }
    } catch (error: any) {
      console.error('Error updating comment approval:', error)
      toast.error('Failed to update comment')
    }
  }

  const startEdit = (comment: Comment) => {
    setEditingComment(comment._id)
    setEditContent(comment.content)
    setEditRating(comment.rating || 0)
  }

  const cancelEdit = () => {
    setEditingComment(null)
    setEditContent('')
    setEditRating(0)
  }

  const renderStars = (rating: number, interactive: boolean = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRatingChange?.(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <Star
              className={`h-4 w-4 ${
                star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Comments</h3>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border-b border-gray-200 pb-4">
              <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const userAlreadyCommented = comments.some(c => c.user._id === currentUserId)

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <MessageCircle className="h-5 w-5" />
        Comments ({comments.length})
      </h3>

      {/* Add Comment Form (admins cannot comment) */}
      {isAuthenticated && !userAlreadyCommented && !isAdmin && (
        <form onSubmit={handleSubmitComment} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Comment
            </label>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts about this perfume..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating (Optional)
            </label>
            {renderStars(newRating, true, setNewRating)}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      )}
      {!isAuthenticated && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
          <p className="text-sm text-gray-700">You need to be logged in to post a comment.</p>
          <a
            href="/login"
            onClick={() => {
              if (typeof window !== 'undefined') {
                sessionStorage.setItem('returnTo', window.location.pathname + window.location.search)
              }
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
          >
            Login to comment
          </a>
        </div>
      )}
      {isAuthenticated && isAdmin && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
          Admin accounts cannot post comments.
        </div>
      )}
      {isAuthenticated && userAlreadyCommented && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg text-blue-700 text-sm">
          You have already posted a comment for this perfume. You can edit or delete your comment below.
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="border-b border-gray-200 pb-4 last:border-b-0">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{comment.user.name}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                  {!comment.isApproved && (
                    <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                      Pending Approval
                    </span>
                  )}
                </div>
                
                {(isAdmin || comment.user._id === currentUserId) && (
                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <button
                        onClick={() => handleToggleApproval(comment._id, comment.isApproved)}
                        className={`p-1 rounded ${
                          comment.isApproved 
                            ? 'text-green-600 hover:bg-green-100' 
                            : 'text-yellow-600 hover:bg-yellow-100'
                        }`}
                        title={comment.isApproved ? 'Unapprove' : 'Approve'}
                      >
                        {comment.isApproved ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                      </button>
                    )}
                    {comment.user._id === currentUserId && (
                      <button
                        onClick={() => startEdit(comment)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {editingComment === comment._id ? (
                <div className="space-y-3">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rating
                      </label>
                      {renderStars(editRating, true, setEditRating)}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditComment(comment._id)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {comment.rating && (
                    <div className="mb-2">
                      {renderStars(comment.rating)}
                    </div>
                  )}
                  <p className="text-gray-700">{comment.content}</p>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
