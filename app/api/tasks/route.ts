// app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';

// 模拟数据库 - 在内存中存储任务
// 注意：实际生产环境应该用数据库，这里为了演示
let tasks = [
  { 
    id: 1, 
    text: '学习Serverless架构', 
    completed: true, 
    category: '学习', 
    priority: 1,
    createdAt: '2026-02-15T10:30:00Z'
  },
  { 
    id: 2, 
    text: '准备春节年货', 
    completed: false, 
    category: '生活', 
    priority: 2,
    createdAt: '2026-02-16T14:20:00Z'
  },
  { 
    id: 3, 
    text: '完成项目文档', 
    completed: false, 
    category: '工作', 
    priority: 1,
    createdAt: '2026-02-16T09:15:00Z'
  },
];

// 智能分类函数
function autoCategorize(text: string): string {
  const textLower = text.toLowerCase();
  if (textLower.includes('学习') || textLower.includes('读书') || textLower.includes('课程')) return '学习';
  if (textLower.includes('工作') || textLower.includes('项目') || textLower.includes('会议')) return '工作';
  if (textLower.includes('购物') || textLower.includes('买') || textLower.includes('年货')) return '生活';
  if (textLower.includes('健身') || textLower.includes('运动') || textLower.includes('健康')) return '健康';
  return '其他';
}

// 智能优先级函数
function calculatePriority(text: string): number {
  if (text.includes('重要') || text.includes('紧急') || text.includes('今天')) return 1;
  if (text.includes('尽快')) return 2;
  return 3;
}

// GET - 获取所有任务
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';
    
    console.log('GET请求收到，filter:', filter);
    
    let filteredTasks = [...tasks];
    
    if (filter === 'active') {
      filteredTasks = tasks.filter(task => !task.completed);
    } else if (filter === 'completed') {
      filteredTasks = tasks.filter(task => task.completed);
    }
    
    const completedCount = tasks.filter(task => task.completed).length;
    
    return NextResponse.json({
      success: true,
      data: filteredTasks,
      total: tasks.length,
      completed: completedCount,
      message: '获取任务成功'
    });
    
  } catch (error) {
    console.error('GET请求错误:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// POST - 创建新任务
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;
    
    if (!text || text.trim() === '') {
      return NextResponse.json(
        { success: false, error: '任务内容不能为空' },
        { status: 400 }
      );
    }
    
    const newTask = {
      id: Date.now(),
      text: text.trim(),
      completed: false,
      category: autoCategorize(text),
      priority: calculatePriority(text),
      createdAt: new Date().toISOString(),
    };
    
    tasks.push(newTask);
    
    console.log('创建新任务:', newTask);
    
    return NextResponse.json({
      success: true,
      data: newTask,
      message: '任务创建成功'
    }, { status: 201 });
    
  } catch (error) {
    console.error('POST请求错误:', error);
    return NextResponse.json(
      { success: false, error: '请求格式错误' },
      { status: 400 }
    );
  }
}

// PUT - 更新任务
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '0');
    const body = await request.json();
    
    console.log('更新任务:', { id, updates: body });
    
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) {
      return NextResponse.json(
        { success: false, error: '任务不存在' },
        { status: 404 }
      );
    }
    
    // 更新任务
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...body,
      id: tasks[taskIndex].id, // 保持ID不变
    };
    
    return NextResponse.json({
      success: true,
      data: tasks[taskIndex],
      message: '任务更新成功'
    });
    
  } catch (error) {
    console.error('PUT请求错误:', error);
    return NextResponse.json(
      { success: false, error: '更新失败' },
      { status: 400 }
    );
  }
}

// DELETE - 删除任务
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '0');
    
    console.log('删除任务:', id);
    
    const initialLength = tasks.length;
    tasks = tasks.filter(task => task.id !== id);
    
    if (tasks.length === initialLength) {
      return NextResponse.json(
        { success: false, error: '任务不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: '任务删除成功'
    });
    
  } catch (error) {
    console.error('DELETE请求错误:', error);
    return NextResponse.json(
      { success: false, error: '删除失败' },
      { status: 400 }
    );
  }
}