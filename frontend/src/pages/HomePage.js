import React, { useState } from 'react';
import toast from 'react-hot-toast';
import apiService from '../api/apiService';
import { useAuth } from '../context/AuthContext';

const getYoutubeThumbnail = (videoUrl) => {
  try {
    const url = new URL(videoUrl);
    const videoId = url.hostname === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v');
    if (videoId) return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  } catch (e) { console.error("無効なYouTube URLです:", videoUrl); }
  return 'https://placehold.co/320x180/e2e8f0/e2e8f0?text=Thumbnail';
};

const getResourceIcon = (type) => {
  if (type.includes('動画')) return '🎬';
  if (type.includes('記事')) return '📝';
  if (type.includes('ドキュメント')) return '📄';
  if (type.includes('チュートリアル')) return '🎓';
  return '🔗';
};

const HomePage = () => {
  const [interest, setInterest] = useState('');
  const [searchedTopic, setSearchedTopic] = useState('');
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!interest) {
      toast.error('学習したい分野を入力してください。');
      return;
    }
    setLoading(true);
    setContent(null);
    try {
      const res = await apiService.post('/generate', { interest });
      const parsedContent = res.data;
      if (parsedContent && Array.isArray(parsedContent.resources)) {
        setContent(parsedContent);
        setSearchedTopic(interest);
        if (parsedContent.resources.length === 0) {
          toast.success('有効なリソースは見つかりませんでしたが、検索は完了しました。');
        } else {
          toast.success('学習プランが生成されました！');
        }
      } else {
        toast.error('AIから予期しない形式の応答がありました。');
      }
    } catch (err) {
      toast.error('エラーが発生しました。詳細はコンソールを確認してください。');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTicket = async () => {
    if (!searchedTopic) {
      toast.error('保存するトピックがありません。先にコンテンツを生成してください。');
      return;
    }
    if (!content || !content.resources || content.resources.length === 0) {
      toast.error('保存するコンテンツがありません。');
      return;
    }

    // ★★★ ここからログを追加 ★★★
    const payload = {
      topic: searchedTopic,
      resources: content.resources,
    };
    console.log("--- [Saving Ticket] ---");
    console.log("Payload to be sent:", JSON.stringify(payload, null, 2));
    // ★★★ ここまでログを追加 ★★★

    try {
      await apiService.post('/tickets', payload);
      toast.success('この学習プランをチケットとして保存しました！');
    } catch (error) {
      console.error("チケット保存エラー:", error.response || error);
      const errorMessage = error.response?.data?.error || 'チケットの保存に失敗しました。ログインしているか確認してください。';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
          AI学習ナビ
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600">
          何を学びたいですか？ AIがあなたに最適な学習プランを提案します。
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
            className="w-full px-5 py-4 pr-28 border border-slate-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            placeholder="例：ReactのState管理"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute inset-y-1.5 right-1.5 flex items-center justify-center bg-blue-600 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-700 transition duration-300 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {loading ? '生成中...' : '生成'}
          </button>
        </form>
      </div>

      {loading && (
        <div className="text-center mt-12">
          <p className="text-slate-500">AIがプランを考えています...</p>
        </div>
      )}

      {content && content.resources && (
        <div className="mt-16 animate-fadeIn">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">おすすめ学習コンテンツ</h3>
            <div className="space-y-4">
              {content.resources.length > 0 ? (
                content.resources.map((item, index) => (
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
                <p className="text-center text-slate-500 py-10">有効な学習コンテンツが見つかりませんでした。</p>
              )}
            </div>
            {user && content.resources.length > 0 && (
              <div className="text-center mt-8 pt-6 border-t border-slate-200">
                <button
                  onClick={handleSaveTicket}
                  className="bg-green-600 text-white font-bold py-3 px-8 rounded-full hover:bg-green-700 transition duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                >
                  このプランをチケットとして保存
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
