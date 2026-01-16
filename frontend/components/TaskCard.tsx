
import React from 'react';
import { Task, TaskStatus, User, TaskPriority } from '../types';
import { PRIORITY_COLORS , STATUS_COLORS} from '../constants';
import Button from './Button';

interface TaskCardProps {
  task: Task;
  users: User[];
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
  onAssign: (taskId: string, userId: string | null) => void;
  onNotAssign: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
  onClose: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onOpenDetails: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task,
  users, 
  onDelete, 
  onAssign, 
  onNotAssign,
  onToggleComplete,
  onClose,
  onEdit,
  onOpenDetails 
}) => {
  const assignee = users.find((u) => u.id === task.assigned_to);

  return (
    <div
      onClick={() => onOpenDetails(task)}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow group cursor-pointer"
    >
      <div className="flex justify-between items-start mb-3">
        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${PRIORITY_COLORS[task.priority]}`}>
          {TaskPriority[task.priority]}
        </span>
        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[task.status]}`}>
          {TaskStatus[task.status]}
        </span>
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors"
            title="Edit Task"
          >
            <i className="fas fa-edit"></i>
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete Task"
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </div>

      <div className="flex items-start space-x-3">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose(task.id);
          }}
          className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 transition-colors flex items-center justify-center ${
            task.status === TaskStatus.DONE 
              ? 'bg-green-500 border-green-500' 
              : 'border-gray-300 hover:border-indigo-500'
          }`}
        >
          {task.status === TaskStatus.DONE && <i className="fas fa-check text-[10px] text-white"></i>}
        </button>
        <div className="flex-1">
          <h3 className={`font-semibold text-gray-900 leading-tight ${task.status === TaskStatus.DONE ? 'line-through text-gray-400' : ''}`}>
            {task.title}
          </h3>
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
            {task.description || 'No description provided.'}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {assignee ? (
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-gray-600">{assignee.username}</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onNotAssign(task.id, null);
                }}
                className="text-gray-400 hover:text-red-500 text-[10px]"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          ) : (
            <div className="relative group/assign">
              <button 
                onClick={(e) => e.stopPropagation()}
              className="text-xs text-gray-400 hover:text-indigo-600 flex items-center space-x-1">
                <i className="fas fa-user-plus"></i>
                <span>Assign</span>
              </button>
              <div className="absolute bottom-full left-0 mb-2 hidden group-focus-within/assign:block bg-white shadow-lg border border-gray-200 rounded-lg py-2 w-48 z-10">
                <p className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase">Team Members</p>
               {users.map((user: { id: any; first_name: any; last_name: any; username: any; }) => (
                <button
                  key={user.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAssign(task.id, user.id);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <span className="text-sm">
                    {user.first_name || user.last_name
                      ? `${user.first_name} ${user.last_name}`.trim()
                      : user.username}
                  </span>
                </button>
              ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="text-[10px] text-gray-400 font-medium italic">
          {new Date(task.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
