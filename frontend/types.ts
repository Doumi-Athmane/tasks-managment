
export enum TaskStatus {
  TODO = 1,
  IN_PROGRESS = 2,
  DONE = 3,
  DELETED = 4
}

export enum TaskPriority {
  MINOR = 4,
  LOW = 3,
  MEDIUM = 2,
  HIGH = 1,
  CRITICAL = 0
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to: number | null;
  assigned_to_name?: string;
  created_at: string;
  comments?: TaskComment[];
  history?: TaskHistory[];
}

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}

export interface TaskComment {
  id: string;
  commented_by: string;
  comment: string;
  commented_at: string;
}

export interface TaskHistory {
    id : number;
    changed_at : string;
    previous_status : TaskStatus;
    new_status : TaskStatus;
    task : number;
    changed_by : string;
    assigned_to : string | null;
}


export interface TaskAction {
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'ASSIGN' | 'COMPLETE';
  payload: any;
}

export function userLabel(u: User) {
  return u.first_name || u.last_name
    ? `${u.first_name} ${u.last_name}`.trim()
    : u.username;
}
