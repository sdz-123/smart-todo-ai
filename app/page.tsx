// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { getTasks, createTask, updateTask, deleteTask, Task } from '@/lib/api';

export default function SmartTodoApp() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [stats, setStats] = useState({ total: 0, completed: 0 });

  // 加载任务
  const loadTasks = async () => {
    setLoading(true);
    try {
      const result = await getTasks(filter);
      if (result.success && result.data) {
        setTasks(result.data);
        setStats({
          total: result.total || 0,
          completed: result.completed || 0,
        });
      } else {
        console.error('加载失败:', result.error);
      }
    } catch (error) {
      console.error('加载失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载
  useEffect(() => {
    loadTasks();
  }, [filter]);

  // 添加任务
  const handleAddTask = async () => {
    if (!input.trim() || adding) return;
    
    setAdding(true);
    try {
      const result = await createTask(input);
      if (result.success) {
        setInput('');
        loadTasks(); // 重新加载列表
      } else {
        alert(result.error || '添加失败');
      }
    } catch (error) {
      console.error('添加失败:', error);
      alert('添加失败，请检查网络连接');
    } finally {
      setAdding(false);
    }
  };

  // 切换完成状态
  const handleToggleTask = async (id: number, completed: boolean) => {
    const result = await updateTask(id, { completed: !completed });
    if (result.success) {
      loadTasks();
    } else {
      alert(result.error || '更新失败');
    }
  };

  // 删除任务
  const handleDeleteTask = async (id: number) => {
    if (!confirm('确定删除这个任务吗？')) return;
    
    const result = await deleteTask(id);
    if (result.success) {
      loadTasks();
    } else {
      alert(result.error || '删除失败');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !adding) {
      handleAddTask();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            🎯 智能待办助手
          </h1>
          <p className="text-gray-600">基于Serverless架构的智能任务管理</p>
          <p className="text-sm text-gray-500 mt-2">
            API端点: /api/tasks | 当前使用: {filter}
          </p>
        </header>

        {/* 添加任务区域 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="输入任务，自动智能分类..."
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={adding}
            />
            <button
              onClick={handleAddTask}
              disabled={adding || !input.trim()}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {adding ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  添加中...
                </span>
              ) : '添加任务'}
            </button>
          </div>
          
          <div className="text-sm text-gray-500">
            <span className="font-medium">智能提示：</span>
            输入包含"学习"、"工作"、"购物"、"健康"等关键词，自动分类和设置优先级
          </div>
        </div>

        {/* 过滤器 */}
        <div className="flex gap-2 mb-6">
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              disabled={loading}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {f === 'all' && '全部任务'}
              {f === 'active' && '待完成'}
              {f === 'completed' && '已完成'}
            </button>
          ))}
        </div>

        {/* 任务列表 */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              加载任务中...
            </div>
          ) : tasks.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              📝 暂无任务，开始添加你的第一个待办事项吧！
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleTask(task.id, task.completed)}
                      className="h-5 w-5 text-blue-600 rounded cursor-pointer"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <span className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                          {task.text}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                          task.priority === 1
                            ? 'bg-red-100 text-red-800'
                            : task.priority === 2
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {task.priority === 1 ? '高优先级' : task.priority === 2 ? '中优先级' : '低优先级'}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                          task.category === '工作'
                            ? 'bg-blue-100 text-blue-800'
                            : task.category === '学习'
                            ? 'bg-purple-100 text-purple-800'
                            : task.category === '生活'
                            ? 'bg-green-100 text-green-800'
                            : task.category === '健康'
                            ? 'bg-pink-100 text-pink-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {task.category}
                        </span>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        创建于：{new Date(task.createdAt).toLocaleDateString('zh-CN')} {new Date(task.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                      title="删除任务"
                    >
                      🗑️
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 统计信息 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 shadow">
            <div className="text-gray-500 text-sm">总任务数</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow">
            <div className="text-gray-500 text-sm">已完成</div>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow">
            <div className="text-gray-500 text-sm">完成率</div>
            <div className="text-2xl font-bold text-blue-600">
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
            </div>
          </div>
        </div>

        {/* 操作指南 */}
        <div className="mt-8 p-4 bg-blue-50 rounded-xl">
          <h3 className="font-medium text-blue-800 mb-2">🎯 当前已实现的功能：</h3>
          <ul className="text-sm text-blue-600 space-y-1">
            <li>✅ 完整的Serverless API（GET/POST/PUT/DELETE）</li>
            <li>✅ 智能分类和优先级自动识别</li>
            <li>✅ 实时数据同步（通过API）</li>
            <li>✅ 加载状态和错误处理</li>
            <li>✅ 响应式设计</li>
          </ul>
        </div>
      </div>
    </div>
  );
}