import { useState } from 'react';
import axios from 'axios';

const API_URL = '/api';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  diagnosis: string;
  attendingDoctor: string;
  admissionDate: string;
  roomNumber?: string;
  bedNumber?: string;
  visitNote?: string;
  todos: Todo[];
  orders: Order[];
  clinicId: string;
  panelType: string;
}

interface Todo {
  id: string;
  description: string;
  completed: boolean;
}

interface Order {
  id: string;
  medication: string;
  dosage?: string;
  frequency?: string;
  notes?: string;
}

interface Props {
  patient: Patient;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: (id: string) => void;
  onTransfer: (id: string, panelType: string) => void;
  onUpdate: () => void;
  doctorColor?: string;
}

export default function PatientCard({ patient, isExpanded, onToggle, onDelete, onTransfer, onUpdate, doctorColor }: Props) {
  const [editingVisitNote, setEditingVisitNote] = useState(false);
  const [visitNote, setVisitNote] = useState(patient.visitNote || '');
  const [newTodo, setNewTodo] = useState('');
  const [newOrder, setNewOrder] = useState({ medication: '', dosage: '', frequency: '' });

  const token = localStorage.getItem('token');

  // Gün hesaplama: Yatış günü = 1. gün
  const days = Math.floor((Date.now() - new Date(patient.admissionDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const saveVisitNote = async () => {
    try {
      await axios.put(
        `${API_URL}/patients/${patient.id}?clinicId=${patient.clinicId}`,
        { visitNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingVisitNote(false);
      onUpdate();
    } catch (error) {
      console.error('Failed to save visit note:', error);
    }
  };

  const addTodo = async () => {
    if (!newTodo.trim()) return;
    try {
      await axios.post(
        `${API_URL}/todos/patient/${patient.id}?clinicId=${patient.clinicId}`,
        { description: newTodo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewTodo('');
      onUpdate();
    } catch (error) {
      console.error('Failed to add todo:', error);
    }
  };

  const toggleTodo = async (todoId: string, completed: boolean) => {
    try {
      await axios.put(
        `${API_URL}/todos/${todoId}?clinicId=${patient.clinicId}`,
        { completed: !completed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdate();
    } catch (error) {
      console.error('Failed to toggle todo:', error);
    }
  };

  const deleteTodo = async (todoId: string) => {
    try {
      await axios.delete(`${API_URL}/todos/${todoId}?clinicId=${patient.clinicId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onUpdate();
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  const addOrder = async () => {
    if (!newOrder.medication.trim()) return;
    try {
      await axios.post(
        `${API_URL}/orders/patient/${patient.id}?clinicId=${patient.clinicId}`,
        newOrder,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewOrder({ medication: '', dosage: '', frequency: '' });
      onUpdate();
    } catch (error) {
      console.error('Failed to add order:', error);
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      await axios.delete(`${API_URL}/orders/${orderId}?clinicId=${patient.clinicId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onUpdate();
    } catch (error) {
      console.error('Failed to delete order:', error);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/50 shadow-md overflow-hidden transition-all">
      {/* Card Header - Always Visible */}
      <button
        onClick={onToggle}
        className="w-full p-4 md:p-6 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {/* Room Number Badge (Doctor Color) */}
            <div className={`w-12 h-12 rounded-xl ${doctorColor || 'bg-gradient-to-br from-sky-600 to-sky-700'} flex items-center justify-center text-white font-bold shadow-lg`}>
              {patient.roomNumber || '?'}
            </div>
            <div>
              <h3 className="font-bold text-slate-900">
                {patient.firstName} {patient.lastName}
              </h3>
              <p className="text-sm text-slate-500">{patient.age} yaş • {patient.gender}</p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
              {days} gün
            </span>
            <svg
              className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 bg-slate-50 rounded-lg">
            <div className="text-xs text-slate-500">Tanı</div>
            <div className="font-semibold text-slate-900 text-sm truncate">{patient.diagnosis}</div>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg">
            <div className="text-xs text-slate-500">Yatak</div>
            <div className="font-semibold text-slate-900 text-sm">{patient.bedNumber || '-'}</div>
          </div>
        </div>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-slate-200 p-4 md:p-6 space-y-4 bg-slate-50/50" onClick={(e) => e.stopPropagation()}>
          {/* Doctor & Admission */}
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <span className="text-slate-500 w-24">Doktor:</span>
              <span className="font-semibold text-slate-900">{patient.attendingDoctor}</span>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-slate-500 w-24">Yatış:</span>
              <span className="text-slate-700">{new Date(patient.admissionDate).toLocaleDateString('tr-TR')}</span>
            </div>
          </div>

          {/* Visit Note (Editable) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-slate-700">Vizit Notu</div>
              {!editingVisitNote && (
                <button
                  onClick={() => setEditingVisitNote(true)}
                  className="text-xs text-sky-600 hover:text-sky-700"
                >
                  Düzenle
                </button>
              )}
            </div>
            {editingVisitNote ? (
              <div>
                <textarea
                  value={visitNote}
                  onChange={(e) => setVisitNote(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                  placeholder="Vizit notları..."
                />
                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    onClick={() => {
                      setEditingVisitNote(false);
                      setVisitNote(patient.visitNote || '');
                    }}
                    className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    İptal
                  </button>
                  <button
                    onClick={saveVisitNote}
                    className="px-4 py-1.5 text-sm bg-sky-600 text-white rounded-lg hover:bg-sky-700"
                  >
                    Kaydet
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-white rounded-lg text-sm text-slate-700 max-h-20 overflow-y-auto">
                {patient.visitNote || 'Henüz vizit notu yok'}
              </div>
            )}
          </div>

          {/* Todos (Editable) */}
          <div>
            <div className="text-xs font-semibold text-slate-700 mb-2">
              Yapılacaklar ({patient.todos.filter(t => !t.completed).length}/{patient.todos.length})
            </div>
            <div className="space-y-2 mb-2">
              {patient.todos.map((todo) => (
                <div key={todo.id} className="flex items-center space-x-2 group">
                  <button
                    onClick={() => toggleTodo(todo.id, todo.completed)}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      todo.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'
                    }`}
                  >
                    {todo.completed && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <span className={`flex-1 text-sm ${todo.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                    {todo.description}
                  </span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                placeholder="Yeni yapılacak..."
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                onClick={addTodo}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700"
              >
                +
              </button>
            </div>
          </div>

          {/* Orders (Editable) */}
          <div>
            <div className="text-xs font-semibold text-slate-700 mb-2">
              İlaç Orderları ({patient.orders.length})
            </div>
            <div className="space-y-2 mb-2">
              {patient.orders.map((order) => (
                <div key={order.id} className="flex items-start justify-between p-2 bg-white rounded-lg group">
                  <div className="flex-1 text-sm">
                    <div className="font-medium text-slate-900">{order.medication}</div>
                    {(order.dosage || order.frequency) && (
                      <div className="text-xs text-slate-500 mt-0.5">
                        {order.dosage && `💊 ${order.dosage}`}
                        {order.dosage && order.frequency && ' • '}
                        {order.frequency && `🕒 ${order.frequency}`}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => deleteOrder(order.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <input
                type="text"
                value={newOrder.medication}
                onChange={(e) => setNewOrder({ ...newOrder, medication: e.target.value })}
                placeholder="İlaç adı..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newOrder.dosage}
                  onChange={(e) => setNewOrder({ ...newOrder, dosage: e.target.value })}
                  placeholder="Doz..."
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <input
                  type="text"
                  value={newOrder.frequency}
                  onChange={(e) => setNewOrder({ ...newOrder, frequency: e.target.value })}
                  placeholder="Sıklık..."
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <button
                onClick={addOrder}
                className="w-full py-2 bg-sky-600 text-white rounded-lg text-sm hover:bg-sky-700 font-medium"
              >
                Order Ekle
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTransfer(patient.id, 'TAKIP');
              }}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              Takibe Al
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(patient.id);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Sil
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
