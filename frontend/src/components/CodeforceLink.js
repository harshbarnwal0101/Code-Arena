import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function CodeforceLink() {
  const { user, linkCodeforces } = useAuth();
  const [codeforcesId, setCodeforcesId] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLinking(true);

    try {
      if (!codeforcesId.trim()) {
        throw new Error('Please enter a Codeforces handle');
      }
      
      await linkCodeforces(codeforcesId.trim());
      setCodeforcesId('');
      // Redirect to profile page after successful linking
      navigate('/profile');
    } catch (error) {
      console.error('Linking error:', error);
      setError(error.message);
    } finally {
      setIsLinking(false);
    }
  };

  if (user?.codeforcesId) {
    return (
      <div className="text-white">
        CF: {user.codeforcesId}
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex items-center">
        <input
          type="text"
          value={codeforcesId}
          onChange={(e) => setCodeforcesId(e.target.value)}
          placeholder="Codeforces Handle"
          className="px-2 py-1 rounded mr-2 text-black"
          disabled={isLinking}
        />
        <button
          type="submit"
          disabled={isLinking}
          className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-600"
        >
          {isLinking ? 'Linking...' : 'Link'}
        </button>
      </form>
      {error && <div className="text-red-500 mt-2 text-sm">{error}</div>}
    </div>
  );
}

export default CodeforceLink; 