import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import apiService from '../api/apiService';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("ログインフォームが送信されました。"); // 1. 送信イベントの確認

    if (!username || !password) {
      toast.error('ユーザー名とパスワードを入力してください。');
      return;
    }
    setLoading(true);
    try {
      console.log(`ユーザー名「${username}」でログインリクエストを送信します。`); // 2. API呼び出しの確認
      const response = await apiService.post('/login', { username, password });
      
      console.log("バックエンドからの応答:", response); // 3. 応答内容をログに出力

      if (response.data && response.data.access_token && response.data.user) {
        console.log("ログイン成功。認証情報を保存します。"); // 4. 成功時の処理を確認
        login(response.data.access_token, response.data.user);
        toast.success('ログインしました');
        console.log(`リダイレクト先: ${from}`); // 5. リダイレクト先を確認
        navigate(from, { replace: true });
      } else {
        console.error("応答の形式が正しくありません:", response.data); // 6. 予期せぬ応答をログに出力
        toast.error('サーバーから予期しない応答がありました。');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'ログインに失敗しました。サーバーが応答しないか、入力内容に誤りがあります。';
      console.error("ログイン失敗:", error.response || error); // 7. エラー詳細をログに出力
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto">
      <div className="w-full bg-white rounded-2xl shadow-xl md:mt-0 sm:max-w-md xl:p-0">
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
            AI学習ナビにログイン
          </h1>
          <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-900">ユーザー名</label>
              <input
                type="text"
                name="username"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5"
                placeholder="your_username"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">パスワード</label>
              <input
                type="password"
                name="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:bg-blue-300"
            >
              {loading ? '処理中...' : 'ログイン'}
            </button>
            <p className="text-sm font-light text-gray-500">
              アカウントをお持ちでないですか？{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:underline">
                新規登録
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
