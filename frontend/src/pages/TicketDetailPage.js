import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiService from '../api/apiService';

const getYoutubeThumbnail = (videoUrl) => {
  try {
    const url = new URL(videoUrl);
    const videoId = url.hostname === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v');
    if (videoId) return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  } catch (e) { console.error("無効なYouTube URLです:", videoUrl); }
  return 'https://placehold.co/320x180/e2e8f0/e2e8f0?text=Image';
};

const getResourceIcon = (type) => {
  if (type.includes('動画')) return '🎬';
  if (type.includes('記事')) return '📝';
  if (type.includes('ドキュメント')) return '📄';
  if (type.includes('チュートリアル')) return '🎓';
  return '🔗';
};

const TicketDetailPage = () => {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    const fetchTicketDetail = async () => {
      try {
        const response = await apiService.get(`/tickets/${id}`);
        setTicket(response.data);
      } catch (error) {
        toast.error('チケット詳細の読み込みに失敗しました。');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTicketDetail();
  }, [id]);

  if (loading) {
    return <div className="text-center text-gray-500 mt-10">読み込み中...</div>;
  }

  if (!ticket) {
    return <div className="text-center text-red-500 mt-10">チケットが見つかりませんでした。</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link to="/tickets" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          マイチケット一覧に戻る
        </Link>
      </div>
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
        <div className="mb-6 pb-4 border-b border-slate-200">
          <h2 className="text-3xl font-bold text-gray-800">{ticket.topic}</h2>
          <p className="text-sm text-gray-500 mt-1">
            保存日: {new Date(ticket.created_at).toLocaleString('ja-JP')}
          </p>
        </div>

        <div className="space-y-4">
          {ticket.resources && ticket.resources.length > 0 ? (
            ticket.resources.map((item, index) => (
              <a key={index} href={item.url} target="_blank" rel="noopener noreferrer" className="block bg-slate-50 p-4 rounded-xl hover:bg-slate-100 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-32 hidden sm:block">
                    <img
                      src={getYoutubeThumbnail(item.url)}
                      alt={item.title}
                      className="w-full h-auto object-cover rounded-lg"
                      onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/320x180/e2e8f0/e2e8f0?text=Image'; }}
                    />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center mb-2">
                      <span className="text-xl mr-2">{getResourceIcon(item.type)}</span>
                      <span className="text-xs font-semibold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">{item.type}</span>
                    </div>
                    <p className="font-semibold text-slate-800 hover:text-blue-600 text-base">
                      {item.title}
                    </p>
                  </div>
                </div>
              </a>
            ))
          ) : (
            <p className="text-center text-gray-500 py-10">このチケットにはリソースが保存されていません。</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPage;
