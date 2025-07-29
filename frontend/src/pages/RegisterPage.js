import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiService from '../api/apiService';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('ユーザー名とパスワードを入力してください。');
      return;
    }
    if (password.length < 6) {
      toast.error('パスワードは6文字以上で設定してください。');
      return;
    }
    setLoading(true);
    try {
      await apiService.post('/register', { username, password });
      toast.success('ユーザー登録が完了しました！ログインしてください。');
      navigate('/login');
    } catch (error) {
      if (error.response && error.response.status === 409) {
        toast.error('このユーザー名は既に使用されています。');
      } else {
        toast.error('ユーザー登録に失敗しました。');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto">
      <div className="w-full bg-white rounded-2xl shadow-xl md:mt-0 sm:max-w-md xl:p-0">
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
            アカウントを作成
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
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">パスワード (6文字以上)</label>
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
              {loading ? '処理中...' : 'アカウント作成'}
            </button>
            <p className="text-sm font-light text-gray-500">
              すでにアカウントをお持ちですか？{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:underline">
                ログイン
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
