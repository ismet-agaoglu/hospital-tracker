import { useState } from 'react';
import axios from 'axios';
import { formatGender } from '../utils/helpers';

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
  onClose: () => void;
  onUpdate: () => void;
}

export default function PatientDetailModal({ patient, onClose, onUpdate }: Props) {
  const [activeTab, setActiveTab] = useState<'info' | 'todos' | 'orders'>('info');
  const [newTodo, setNewTodo] = useState('');
  const [newOrder, setNewOrder] = useState({ medication: '', dosage: '', frequency: '', notes: '' });
  const [editingVisitNote, setEditingVisitNote] = useState(false);
  const [visitNote, setVisitNote] = useState(patient.visitNote || '');

  const token = localStorage.getItem('token');

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
      setNewOrder({ medication: '', dosage: '', frequency: '', notes: '' });
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pb-20 md:pb-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[calc(100vh-140px)] md:max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 to-emerald-600 px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                {patient.firstName} {patient.lastName}
              </h2>
              <div className="flex items-center space-x-4 text-sky-100">
                <span>{patient.age} yaş</span>
                <span>•</span>
                <span>{formatGender(patient.gender)}</span>
                <span>•</span>
                <span>Oda {patient.roomNumber || '-'}, Yatak {patient.bedNumber || '-'}</span>
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

        {/* Tabs */}
        <div className="border-b border-slate-200 bg-slate-50">
          <div className="flex space-x-8 px-8">
            {[
              { id: 'info', label: 'Genel Bilgiler', icon: '📋' },
              { id: 'todos', label: 'Yapılacaklar', icon: '✅', count: patient.todos.length },
              { id: 'orders', label: 'İlaç Orderları', icon: '💊', count: patient.orders.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative py-4 font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'text-sky-700'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="px-2 py-0.5 bg-sky-100 text-sky-700 rounded-full text-xs font-medium">
                      {tab.count}
                    </span>
                  )}
                </span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-700" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-180px)]">
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Basic Info Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="text-sm text-slate-500 mb-1">Tanı</div>
                  <div className="font-semibold text-slate-900">{patient.diagnosis}</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="text-sm text-slate-500 mb-1">Takip Eden Doktor</div>
                  <div className="font-semibold text-slate-900">{patient.attendingDoctor}</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="text-sm text-slate-500 mb-1">Yatış Tarihi</div>
                  <div className="font-semibold text-slate-900">
                    {new Date(patient.admissionDate).toLocaleDateString('tr-TR')}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="text-sm text-slate-500 mb-1">Oda / Yatak</div>
                  <div className="font-semibold text-slate-900">
                    {patient.roomNumber || '-'} / {patient.bedNumber || '-'}
                  </div>
                </div>
              </div>

              {/* Visit Note */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-slate-900">Vizit Notu</h3>
                  {!editingVisitNote && (
                    <button
                      onClick={() => setEditingVisitNote(true)}
                      className="px-4 py-2 text-sky-700 hover:bg-sky-50 rounded-lg transition-colors"
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
                      rows={6}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                      placeholder="Vizit notlarını buraya yazın..."
                    />
                    <div className="flex justify-end space-x-2 mt-3">
                      <button
                        onClick={() => {
                          setEditingVisitNote(false);
                          setVisitNote(patient.visitNote || '');
                        }}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        İptal
                      </button>
                      <button
                        onClick={saveVisitNote}
                        className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                      >
                        Kaydet
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl text-slate-700 whitespace-pre-wrap">
                    {patient.visitNote || 'Henüz vizit notu eklenmemiş.'}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'todos' && (
            <div className="space-y-4">
              {/* Add Todo */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                  placeholder="Yeni yapılacak ekle..."
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <button
                  onClick={addTodo}
                  className="px-6 py-3 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors"
                >
                  Ekle
                </button>
              </div>

              {/* Todo List */}
              <div className="space-y-2">
                {patient.todos.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    Henüz yapılacak eklenmemiş
                  </div>
                ) : (
                  patient.todos.map((todo) => (
                    <div
                      key={todo.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <button
                          onClick={() => toggleTodo(todo.id, todo.completed)}
                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
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
                        <span className={`flex-1 ${todo.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                          {todo.description}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* Add Order Form */}
              <div className="p-6 bg-slate-50 rounded-xl space-y-3">
                <h4 className="font-semibold text-slate-900 mb-3">Yeni İlaç Order</h4>
                <input
                  type="text"
                  value={newOrder.medication}
                  onChange={(e) => setNewOrder({ ...newOrder, medication: e.target.value })}
                  placeholder="İlaç adı *"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <div className="grid md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newOrder.dosage}
                    onChange={(e) => setNewOrder({ ...newOrder, dosage: e.target.value })}
                    placeholder="Doz (örn: 500mg)"
                    className="px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <input
                    type="text"
                    value={newOrder.frequency}
                    onChange={(e) => setNewOrder({ ...newOrder, frequency: e.target.value })}
                    placeholder="Sıklık (örn: 3x1)"
                    className="px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <input
                  type="text"
                  value={newOrder.notes}
                  onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
                  placeholder="Notlar (opsiyonel)"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <button
                  onClick={addOrder}
                  className="w-full py-3 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors font-semibold"
                >
                  Order Ekle
                </button>
              </div>

              {/* Orders List */}
              <div className="space-y-3">
                {patient.orders.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    Henüz ilaç orderı eklenmemiş
                  </div>
                ) : (
                  patient.orders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 bg-white border border-slate-200 rounded-xl hover:border-sky-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-slate-900 text-lg mb-2">
                            {order.medication}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-slate-600">
                            {order.dosage && <span>💊 {order.dosage}</span>}
                            {order.frequency && <span>🕒 {order.frequency}</span>}
                          </div>
                          {order.notes && (
                            <div className="mt-2 text-sm text-slate-500">
                              📝 {order.notes}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => deleteOrder(order.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
