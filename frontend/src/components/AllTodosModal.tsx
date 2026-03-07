import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = '/api';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  todos: Todo[];
  clinicId: string;
}

interface Todo {
  id: string;
  description: string;
  completed: boolean;
  patientId: string;
}

interface Props {
  patients: Patient[];
  onClose: () => void;
  onUpdate: () => void;
}

export default function AllTodosModal({ patients, onClose, onUpdate }: Props) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');

  const token = localStorage.getItem('token');

  const allTodos = patients.flatMap(p =>
    p.todos.map(t => ({
      ...t,
      patientName: `${p.firstName} ${p.lastName}`,
      clinicId: p.clinicId,
    }))
  );

  const filteredTodos = allTodos.filter(t => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const toggleTodo = async (todoId: string, clinicId: string, completed: boolean) => {
    try {
      await axios.put(
        `${API_URL}/todos/${todoId}?clinicId=${clinicId}`,
        { completed: !completed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdate();
    } catch (error) {
      console.error('Failed to toggle todo:', error);
    }
  };

  const pendingCount = allTodos.filter(t => !t.completed).length;
  const completedCount = allTodos.filter(t => t.completed).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 to-emerald-600 px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Tüm Yapılacaklar</h2>
              <div className="flex items-center space-x-4 text-sm text-sky-100">
                <span>Bekleyen: {pendingCount}</span>
                <span>•</span>
                <span>Tamamlanan: {completedCount}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="border-b border-slate-200 bg-slate-50">
          <div className="flex space-x-8 px-8">
            {[
              { id: 'pending', label: 'Bekleyen', count: pendingCount },
              { id: 'completed', label: 'Tamamlanan', count: completedCount },
              { id: 'all', label: 'Tümü', count: allTodos.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`relative py-4 font-semibold transition-colors ${
                  filter === tab.id
                    ? 'text-sky-700'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span>{tab.label}</span>
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full text-xs font-medium">
                    {tab.count}
                  </span>
                </span>
                {filter === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-700" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-240px)]">
          {filteredTodos.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              {filter === 'pending' ? 'Bekleyen görev yok' : filter === 'completed' ? 'Tamamlanan görev yok' : 'Henüz görev eklenmemiş'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-start justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-start space-x-3 flex-1">
                    <button
                      onClick={() => toggleTodo(todo.id, todo.clinicId, todo.completed)}
                      className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                        todo.completed
                          ? 'bg-emerald-500 border-emerald-500'
                          : 'border-slate-300 hover:border-sky-500'
                      }`}
                    >
                      {todo.completed && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1">
                      <div className={`font-medium ${todo.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {todo.description}
                      </div>
                      <div className="text-sm text-slate-500 mt-1">
                        👤 {todo.patientName}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
