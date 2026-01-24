import { createReducer, on } from '@ngrx/store';
import { initialCommentsState, commentsAdapter } from './comments.state';
import * as CommentsActions from './comments.actions';

export const commentsReducer = createReducer(
  initialCommentsState,

  // Load Comments
  on(CommentsActions.loadComments, (state, { issueId }) => ({
    ...state,
    loading: true,
    error: null,
    currentIssueId: issueId
  })),

  on(CommentsActions.loadCommentsSuccess, (state, { comments, totalCount }) =>
    commentsAdapter.setAll(comments, {
      ...state,
      loading: false,
      error: null,
      totalCount
    })
  ),

  on(CommentsActions.loadCommentsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Create Comment
  on(CommentsActions.createComment, (state, { issueId }) => ({
    ...state,
    submitting: true,
    submittingForIssueId: issueId,
    error: null
  })),

  on(CommentsActions.createCommentSuccess, (state, { comment }) => {
    // Check if this response is for the current in-flight submission
    const isCurrentSubmission = comment.issueId === state.submittingForIssueId;
    // Check if this comment belongs to the currently viewed issue
    const isCurrentIssue = comment.issueId === state.currentIssueId;

    // Stale response from different issue - don't modify state at all
    // (another submission for the current issue may still be pending)
    if (!isCurrentSubmission) {
      return state;
    }

    // Response is for current submission but user navigated away - only reset submission state
    if (!isCurrentIssue) {
      return {
        ...state,
        submitting: false,
        submittingForIssueId: null,
        error: null
      };
    }

    // Normal case: add comment to the current issue's list
    const isTopLevelComment = !comment.parentCommentId;
    // Only clear replyingToCommentId if it matches the completed reply operation
    // Prevents closing a newly-opened reply form when a previous reply request completes
    const shouldClearReplyForm = comment.parentCommentId === state.replyingToCommentId;
    return commentsAdapter.addOne(comment, {
      ...state,
      submitting: false,
      submittingForIssueId: null,
      error: null,
      replyingToCommentId: shouldClearReplyForm ? null : state.replyingToCommentId,
      totalCount: state.totalCount + 1,
      formResetCounter: isTopLevelComment ? state.formResetCounter + 1 : state.formResetCounter
    });
  }),

  on(CommentsActions.createCommentFailure, (state, { error, issueId }) => {
    // Stale failure from different issue - don't modify state at all
    if (issueId !== state.submittingForIssueId) {
      return state;
    }
    // Only show error if user is still on the same issue
    const showError = issueId === state.currentIssueId;
    return {
      ...state,
      submitting: false,
      submittingForIssueId: null,
      error: showError ? error : null
    };
  }),

  // Update Comment
  on(CommentsActions.updateComment, (state) => ({
    ...state,
    submitting: true,
    error: null
  })),

  on(CommentsActions.updateCommentSuccess, (state, { commentId, content, updatedAt }) => {
    // Only clear editingCommentId if it matches the completed edit operation
    // Prevents closing a newly-opened edit form when a previous edit request completes
    const shouldClearEditForm = commentId === state.editingCommentId;
    return commentsAdapter.updateOne(
      {
        id: commentId,
        changes: { content, updatedAt, isEdited: true }
      },
      {
        ...state,
        submitting: false,
        error: null,
        editingCommentId: shouldClearEditForm ? null : state.editingCommentId
      }
    );
  }),

  on(CommentsActions.updateCommentFailure, (state, { error }) => ({
    ...state,
    submitting: false,
    error
  })),

  // Delete Comment
  on(CommentsActions.deleteComment, (state) => ({
    ...state,
    submitting: true,
    error: null
  })),

  on(CommentsActions.deleteCommentSuccess, (state, { commentId }) =>
    commentsAdapter.updateOne(
      {
        id: commentId,
        changes: { isDeleted: true, content: '' }
      },
      {
        ...state,
        submitting: false,
        error: null
      }
    )
  ),

  on(CommentsActions.deleteCommentFailure, (state, { error }) => ({
    ...state,
    submitting: false,
    error
  })),

  // Vote Helpful
  // Idempotent: only increment count if not already voted (prevents race condition duplicates)
  on(CommentsActions.voteHelpfulSuccess, (state, { commentId }) => {
    const comment = state.entities[commentId];
    if (!comment || comment.hasVoted) return state;

    return commentsAdapter.updateOne(
      {
        id: commentId,
        changes: {
          hasVoted: true,
          helpfulCount: comment.helpfulCount + 1
        }
      },
      state
    );
  }),

  // Remove Vote
  // Idempotent: only decrement count if currently voted (prevents race condition duplicates)
  on(CommentsActions.removeVoteSuccess, (state, { commentId }) => {
    const comment = state.entities[commentId];
    if (!comment || !comment.hasVoted) return state;

    return commentsAdapter.updateOne(
      {
        id: commentId,
        changes: {
          hasVoted: false,
          helpfulCount: Math.max(0, comment.helpfulCount - 1)
        }
      },
      state
    );
  }),

  // UI State
  on(CommentsActions.setEditingComment, (state, { commentId }) => ({
    ...state,
    editingCommentId: commentId,
    replyingToCommentId: null // Clear reply when editing
  })),

  on(CommentsActions.setReplyingToComment, (state, { commentId }) => ({
    ...state,
    replyingToCommentId: commentId,
    editingCommentId: null // Clear edit when replying
  })),

  on(CommentsActions.setSortBy, (state, { sortBy, sortDescending }) => ({
    ...state,
    sortBy,
    sortDescending
  })),

  on(CommentsActions.clearComments, () => initialCommentsState)
);
