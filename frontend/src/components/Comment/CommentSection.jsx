import { useCallback, useEffect, useState } from "react";
import axios from "axios";

function CommentSection({ ticketId, currentUser = "User1" }) {
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const fetchComments = useCallback(() => {
    axios
      .get(`http://localhost:8080/api/tickets/${ticketId}/comments`)
      .then((res) => {
        setComments(res.data || []);
      })
      .catch((err) => {
        console.error("Comment fetch error:", err);
      });
  }, [ticketId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleAddComment = async () => {
    if (!newCommentText.trim()) {
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:8080/api/tickets/${ticketId}/comments`,
        {
          text: newCommentText.trim(),
          createdBy: currentUser
        }
      );
      setComments((current) => [...current, res.data]);
      setNewCommentText("");
    } catch (err) {
      console.error("Add comment error:", err);
      alert("Failed to add comment");
    }
  };

  const startEditing = (comment) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.text || "");
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditingText("");
  };

  const handleSaveEdit = async (commentId) => {
    if (!editingText.trim()) {
      return;
    }

    try {
      const res = await axios.put(
        `http://localhost:8080/api/tickets/${ticketId}/comments/${commentId}`,
        {
          text: editingText.trim(),
          actingUser: currentUser
        }
      );

      setComments((current) =>
        current.map((comment) => (comment.id === commentId ? res.data : comment))
      );
      cancelEditing();
    } catch (err) {
      console.error("Edit comment error:", err);
      alert("Failed to edit comment");
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await axios.delete(
        `http://localhost:8080/api/tickets/${ticketId}/comments/${commentId}`,
        {
          params: { actingUser: currentUser }
        }
      );

      setComments((current) =>
        current.filter((comment) => comment.id !== commentId)
      );
    } catch (err) {
      console.error("Delete comment error:", err);
      alert("Failed to delete comment");
    }
  };

  return (
    <div className="comments-section">
      <h4 className="comments-heading">Comments</h4>

      <div className="comment-form-row">
        <input
          type="text"
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          placeholder="Write a comment..."
          className="comment-input"
        />
        <button type="button" className="btn btn-upload" onClick={handleAddComment}>
          Add Comment
        </button>
      </div>

      {comments.length === 0 ? (
        <p className="comments-empty">No comments yet</p>
      ) : (
        <div className="comments-list">
          {comments.map((comment) => {
            const isOwner = comment.createdBy === currentUser;

            return (
              <div key={comment.id} className="comment-item">
                <div className="comment-meta">
                  <strong>{comment.createdBy}</strong>
                  <span>
                    {comment.createdAt
                      ? new Date(comment.createdAt).toLocaleString()
                      : ""}
                  </span>
                </div>

                {editingCommentId === comment.id ? (
                  <div className="comment-edit-row">
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="comment-input"
                    />
                    <button
                      type="button"
                      className="btn btn-upload"
                      onClick={() => handleSaveEdit(comment.id)}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="btn btn-neutral"
                      onClick={cancelEditing}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <p className="comment-text">{comment.text}</p>
                )}

                {isOwner && editingCommentId !== comment.id && (
                  <div className="comment-actions">
                    <button
                      type="button"
                      className="btn btn-neutral"
                      onClick={() => startEditing(comment)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-delete"
                      onClick={() => handleDelete(comment.id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CommentSection;
