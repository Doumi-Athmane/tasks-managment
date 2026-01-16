
import React, { useState , useEffect } from 'react';
import { Task, TaskComment, TaskHistory } from '../types';
import { historyTask, commentTask , commentsTask } from '../api/tasks';
import Button from './Button';
import { TaskStatus } from '../types';

interface TaskDetailsModalProps {
  task: Task;
  currentUser: string;
  onClose: () => void;
  onAddComment: (taskId: string, comment: string) => void;
}

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ 
  task, 
  currentUser, 
  onClose, 
  onAddComment 
}) => {
  const [activeTab, setActiveTab] = useState<'comments' | 'history'>('comments');
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<TaskComment[]>(task.comments || []);
  const [history, setHistory] = useState<TaskHistory[]>([]);


  const fetchComments = async () => {
    const data = await commentsTask(task.id);
    setComments(Array.isArray(data) ? data : []);
 };

const fetchHistory = async () => {
    const data = await historyTask(task.id);
    setHistory(Array.isArray(data) ? data : []);
    };

const handleCreateComment = async (newComment: string) => {
    try {
      const created = await commentTask(task.id, newComment);
      console.log("Created comment:", created);
      setComments((prev) => [created, ...prev]);
      setNewComment('');
    } catch (e) {
      console.error("Create failed dddd", e);
      alert("Failed to create comment");
    }
  };


  useEffect(() => {
    fetchComments();
    fetchHistory();
    }, [task.id, activeTab]);



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="px-8 pt-8 pb-4 flex justify-between items-start border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-black text-gray-900 leading-tight">
              {task.title}
            </h2>
            <p className="text-gray-500 text-sm mt-1 flex items-center">
              <i className="far fa-calendar-alt mr-2"></i>
              Created on {new Date(task.created_at).toLocaleDateString()}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('comments')}
            className={`flex-1 py-4 text-sm font-bold transition-all ${
              activeTab === 'comments' 
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <i className="far fa-comments mr-2"></i>
            Comments ({comments.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-4 text-sm font-bold transition-all ${
              activeTab === 'history' 
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <i className="fas fa-history mr-2"></i>
            History ({history.length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30">
          {activeTab === 'comments' ? (
            <div className="space-y-6">
              <form onSubmit={(e) => {
                e.preventDefault();
                handleCreateComment(newComment);
              }} className="mb-8">
                <div className="relative">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none shadow-sm"
                    rows={3}
                  />
                  <div className="absolute right-3 bottom-3">
                    <Button variant="primary" size="sm" type="submit" disabled={!newComment.trim()}>
                      <i className="fas fa-paper-plane mr-2"></i> Post
                    </Button>
                  </div>
                </div>
              </form>

              <div className="space-y-4">
                {comments.length > 0 ? (
                  comments.slice().reverse().map((comment) => (
                    <div key={comment.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 animate-in slide-in-from-bottom-2">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-gray-900">{comment.commented_by}</span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {new Date(comment.commented_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{comment.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <i className="far fa-comment-dots text-gray-200 text-4xl mb-3"></i>
                    <p className="text-gray-400 text-sm italic">No comments yet. Start the conversation!</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {history.length > 0 ? (
                history.slice().reverse().map((entry) => (
                  <div key={entry.id} className="flex items-start space-x-4 animate-in slide-in-from-left-2">
                    <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                      <i className="fas fa-circle-notch text-xs"></i>
                    </div>
                    <div className="flex-1 pb-4 border-b border-gray-100 last:border-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-bold">{entry.changed_by}</span> {entry.previous_status !== entry.new_status ? (
                          <>
                            changed status from <span className="font-medium">{TaskStatus[entry.previous_status]}</span> to <span className="font-medium">{TaskStatus[entry.new_status]}</span> {entry.assigned_to ? (
                            <>and assigned to <span className="font-medium">{entry.assigned_to}</span></> ) : null}
                          </>
                        ) : (
                          <>made an update</>
                        )}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium mt-1">
                        {new Date(entry.changed_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-400 text-sm italic">No history data available.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;
