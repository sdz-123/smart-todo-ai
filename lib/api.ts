// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '/api';

export interface Task {
  id: string;  // 从number改为string（UUID）
  text: string;
  completed: boolean;
  category: string;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  total?: number;
  completed?: number;
}

// 获取任务列表
export async function getTasks(filter: 'all' | 'active' | 'completed' = 'all'): Promise<ApiResponse<Task[]>> {
  try {
    const response = await fetch(`${API_BASE}/tasks?filter=${filter}`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('获取任务失败:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '网络请求失败' 
    };
  }
}

// 创建任务
export async function createTask(text: string): Promise<ApiResponse<Task>> {
  try {
    const response = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('创建任务失败:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '网络请求失败' 
    };
  }
}

// 更新任务
export async function updateTask(id: string, updates: Partial<Task>): Promise<ApiResponse<Task>> {
  try {
    const response = await fetch(`${API_BASE}/tasks?id=${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('更新任务失败:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '网络请求失败' 
    };
  }
}

// 删除任务
export async function deleteTask(id: string): Promise<ApiResponse<void>> {
  try {
    const response = await fetch(`${API_BASE}/tasks?id=${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('删除任务失败:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '网络请求失败' 
    };
  }
}