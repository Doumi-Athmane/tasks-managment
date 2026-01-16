
import React, { useState, useEffect, useMemo } from 'react';
import { Task, TaskStatus, TaskPriority, User} from './types';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import Button from './components/Button';
import LoginPage from './components/LoginPage';
import TaskDetailsModal from './components/TaskDetails';

import { getTasks, createTask, updateTask, deleteTask , assignTask, unAssignTask, closeTask,  } from "./api/tasks";
import { getUsers } from "./api/users";
import { isAuthenticated } from "./auth/token";





const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => isAuthenticated());
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  

useEffect(() => {
  if (!isLoggedIn) {
    setUsers([]);
    setLoadingUsers(false);
    return;
  }

  setLoadingUsers(true);
  getUsers()
    .then(setUsers)
    .catch((e) => console.error("Failed to load users", e))
    .finally(() => setLoadingUsers(false));
}, [isLoggedIn]);



useEffect(() => {
  if (!isLoggedIn) {
    setTasks([]);
    return;
  }

  (async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (e) {
      console.error("Failed to load tasks", e);
    }
  })();
}, [isLoggedIn]);


  const handleLogin = (username: string) => {
    setIsLoggedIn(true);
    setCurrentUser(username);
    localStorage.setItem('taskflow_session', username);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      setIsLoggedIn(false);
      setCurrentUser(null);
      localStorage.removeItem('access_token');
    }
  };
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      return matchesSearch  && matchesStatus;
    });
  }, [tasks, searchQuery, filterStatus]);

  const handleCreateTask = async (newTaskData: Omit<Task, "id" | "createdAt">) => {
    try {
      const created = await createTask(newTaskData);
      setTasks((prev) => [created, ...prev]);
      setIsFormOpen(false);
    } catch (e) {
      console.error("Create failed", e);
      alert("Failed to create task");
    }
  };

  const handleUpdateTask = async (updatedData: Omit<Task, "id" | "createdAt">) => {
    if (!editingTask) return;
    try {
      const updated = await updateTask(editingTask.id, updatedData);
      setTasks(tasks.map(t => t.id === updated.id ? updated : t));
      setEditingTask(null);
    } catch (e) {
      console.error("Update failed", e);
      alert("Failed to update task");
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        const deleted = await deleteTask(id);
        setTasks(tasks.filter(t => t.id === deleted.id ? deleted : t));
      } catch (e) {
        console.error("Delete failed", e);
        alert("Failed to delete task");
      }
    }
  };

  const handleAssignTask = async (taskId: number, userId: number | null) => {
    try {
      const updated = await assignTask(taskId, userId);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    } catch (e) {
      console.error("Assign failed", e);
    }
  };

  const handleUnAssignTask = async (taskId: number) => {
    try {
      const updated = await unAssignTask(taskId);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (e) {
      console.error("Unassign failed", e);
    }
  };

  const handleCloseTask = async (taskId: number) => {
    try {
      const updated = await closeTask(taskId);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (e) {
      console.error("Close failed", e);
    }
  };

  const handleToggleComplete = async (taskId: number) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const nextStatus = task.status === TaskStatus.DONE ? TaskStatus.TODO : TaskStatus.DONE;

    try {
      const updated = await updateTask(taskId, { status: nextStatus });
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (e) {
      console.error("Toggle failed", e);
    }
  };



  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === TaskStatus.DONE).length,
    inProgress: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
    todo: tasks.filter(t => t.status === TaskStatus.TODO).length
  };

  const activeTaskDetails = useMemo(() => {
    if (!selectedTaskForDetails) return null;
    return tasks.find(t => t.id === selectedTaskForDetails.id) || null;
  }, [tasks, selectedTaskForDetails]);

  
  if (!isAuthenticated()) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen pb-20">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30 px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-indigo-200 shadow-lg">
              <i className="fas fa-layer-group text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Tasks manager</h1>
              <p className="text-xs text-gray-500 font-medium uppercase">Team Workspace</p>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input 
                type="text" 
                placeholder="Search tasks..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none text-sm"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="primary" onClick={() => setIsFormOpen(true)}>
              <i className="fas fa-plus mr-2"></i> New Task
            </Button>
            <div className="h-8 w-px bg-gray-200 mx-1"></div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-600 hover:bg-red-50"
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 mt-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Tasks', value: stats.total, color: 'bg-indigo-50', text: 'text-indigo-600' },
            { label: 'Completed', value: stats.completed, color: 'bg-green-50', text: 'text-green-600' },
            { label: 'In Progress', value: stats.inProgress, color: 'bg-yellow-50', text: 'text-yellow-600' },
            { label: 'To Do', value: stats.todo, color: 'bg-slate-50', text: 'text-slate-600' },
          ].map((stat, i) => (
            <div key={i} className={`${stat.color} p-4 rounded-2xl border border-white shadow-sm`}>
              <p className="text-xs font-semibold uppercase text-gray-500 mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.text}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters and Controls */}
        <div className="flex items-center space-x-4 mb-6 pb-4 border-b border-gray-200">
          <button 
            onClick={() => setFilterStatus('all')}
            className={`text-sm font-medium px-4 py-1.5 rounded-full transition-colors ${filterStatus === 'all' ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilterStatus(TaskStatus.DONE)}
            className={`text-sm font-medium px-4 py-1.5 rounded-full transition-colors ${filterStatus === TaskStatus.DONE ? 'bg-green-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
          >
            Completed
          </button>
          <button 
            onClick={() => setFilterStatus(TaskStatus.IN_PROGRESS)}
            className={`text-sm font-medium px-4 py-1.5 rounded-full transition-colors ${filterStatus === TaskStatus.IN_PROGRESS ? 'bg-yellow-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
          >
            In Progress
          </button>
          <button 
            onClick={() => setFilterStatus(TaskStatus.TODO)}
            className={`text-sm font-medium px-4 py-1.5 rounded-full transition-colors ${filterStatus === TaskStatus.TODO ? 'bg-yellow-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
          >
            To Do
          </button>
          <button 
            onClick={() => setFilterStatus(TaskStatus.DELETED)}
            className={`text-sm font-medium px-4 py-1.5 rounded-full transition-colors ${filterStatus === TaskStatus.DELETED ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
          >
            Deleted
          </button>

        </div>

        {/* Task Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.length > 0 ? (
            filteredTasks.map(task => (
              <TaskCard 
                key={task.id}
                task={task}
                users={users}
                onDelete={handleDeleteTask}
                onAssign={handleAssignTask}
                onUnAssign={handleUnAssignTask}
                onToggleComplete={handleToggleComplete}
                onClose={handleCloseTask}
                onUpdate={handleUpdateTask}
                onEdit={(t) => setEditingTask(t)}
                onOpenDetails={(t) => setSelectedTaskForDetails(t)}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
              <i className="fas fa-tasks text-gray-200 text-6xl mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-900">No tasks found</h3>
              <p className="text-gray-500 mt-1">Try changing your search or create a new task!</p>
              <Button variant="ghost" className="mt-4" onClick={() => setIsFormOpen(true)}>
                Add your first task
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Task Details Popup */}
      {activeTaskDetails && (
        <TaskDetailsModal 
          task={activeTaskDetails}
          currentUser={currentUser || 'Unknown'}
          onClose={() => setSelectedTaskForDetails(null)}
          //onAddComment={handleAddComment}
        />
      )}

      {/* Modals */}
      {(isFormOpen || editingTask) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 pt-8 pb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {editingTask ? 'Update the details of your task.' : 'Add a new task to your workspace.'}
              </p>
            </div>
            <div className="px-8 pb-8">
              <TaskForm 
                initialTask={editingTask || undefined}
                onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
                onCancel={() => {
                  setIsFormOpen(false);
                  setEditingTask(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Persistent Call to Action (Floating Action Button for Mobile) */}
      <div className="md:hidden fixed bottom-6 right-6">
        <button 
          onClick={() => setIsFormOpen(true)}
          className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-indigo-300 hover:scale-110 active:scale-95 transition-all"
        >
          <i className="fas fa-plus text-xl"></i>
        </button>
      </div>
    </div>
  );
};

export default App;
