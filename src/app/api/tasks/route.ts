// app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
    
    // 构建查询
    let query = supabase.from('tasks').select('*');
    
    if (filter === 'active') {
      query = query.eq('completed', false);
    } else if (filter === 'completed') {
      query = query.eq('completed', true);
    }
    
    // 按创建时间降序排序
    query = query.order('created_at', { ascending: false });
    
    const { data: tasks, error } = await query;
    
    if (error) {
      console.error('Supabase查询错误:', error);
      return NextResponse.json(
        { success: false, error: '数据库查询失败' },
        { status: 500 }
      );
    }
    
    // 获取统计信息
    const { count: total } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true });
    
    const { count: completed } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('completed', true);
    
    return NextResponse.json({
      success: true,
      data: tasks || [],
      total: total || 0,
      completed: completed || 0,
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
      text: text.trim(),
      completed: false,
      category: autoCategorize(text),
      priority: calculatePriority(text),
    };
    
    const { data, error } = await supabase
      .from('tasks')
      .insert([newTask])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase插入错误:', error);
      return NextResponse.json(
        { success: false, error: '创建任务失败' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data,
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
    const id = searchParams.get('id');
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少任务ID' },
        { status: 400 }
      );
    }
    
    const { data, error } = await supabase
      .from('tasks')
      .update(body)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase更新错误:', error);
      return NextResponse.json(
        { success: false, error: '更新任务失败' },
        { status: 500 }
      );
    }
    
    if (!data) {
      return NextResponse.json(
        { success: false, error: '任务不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data,
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
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少任务ID' },
        { status: 400 }
      );
    }
    
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Supabase删除错误:', error);
      return NextResponse.json(
        { success: false, error: '删除任务失败' },
        { status: 500 }
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