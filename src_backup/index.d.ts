export interface Task {
  id: number;
  name: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  updatedAt: string;
  originalName: string;
  originalPriority?: string;
}
