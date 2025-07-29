import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiService from '../api/apiService';

const TicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await apiService.get('/tickets');
        setTickets(response.data);
      } catch (error) {
        toast.error('チケットの読み込みに失敗しました。');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const handleToggleComplete = async (e, ticketId) => {
    e.preventDefault(); // リンクへの遷移を防ぐ
    e.stopPropagation(); // 親要素へのイベント伝播を防ぐ

    const originalTickets = [...tickets];
    
    // UIを即時反映させる（楽観的更新）
    const updatedTickets = tickets.map(t =>
      t.id === ticketId ? { ...t, completed: !t.completed } : t
    );
    setTickets(updatedTickets);

    try {
      await apiService.patch(`/tickets/${ticketId}/toggle`);
      toast.success('ステータスを更新しました！');
    } catch (error) {
      toast.error('更新に失敗しました。');
      setTickets(originalTickets); // エラー時は元の状態に戻す
      console.error(error);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-500 mt-10">読み込み中...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">マイチケット</h2>
        {tickets.length > 0 ? (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div key={ticket.id} className={`flex items-center gap-4 p-4 rounded-xl transition-all shadow-sm ${ticket.completed ? 'bg-green-50 text-gray-500' : 'bg-slate-50 hover:bg-slate-100'}`}>
                <Link to={`/tickets/${ticket.id}`} className="flex-grow">
                  <h3 className={`font-semibold text-lg ${ticket.completed ? 'text-green-800 line-through' : 'text-blue-700'}`}>{ticket.topic}</h3>
                  <p className="text-sm mt-1">
                    保存日: {new Date(ticket.created_at).toLocaleString('ja-JP')}
                  </p>
                </Link>
                <button
                  onClick={(e) => handleToggleComplete(e, ticket.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                    ticket.completed
                      ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {ticket.completed ? '未完了に戻す' : '完了にする'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-xl">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">チケットがありません</h3>
            <p className="mt-1 text-sm text-gray-500">ホームページから新しい学習プランを保存しましょう。</p>
            <div className="mt-6">
              <Link to="/" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                プランを探す
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketsPage;
