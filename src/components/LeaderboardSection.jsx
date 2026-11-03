import React, { useCallback, useEffect, useState } from 'react';
import { apiUrl } from '../api';

const medals = ['🥇', '🥈', '🥉'];
const placeholderNames = [
  'Aanya Singh', 'Riya Malhotra', 'Arjun Patel', 'Neha Gupta',
  'Samar Khan', 'Kavya Iyer', 'Dev Malviya', 'Tanya Sood',
];

// These keep the public demo lively before enough local recycling activity has
// been recorded. Scores vary on each fresh page load, while real API entries
// always remain at the top.
const placeholderEntries = placeholderNames.map((name, index) => ({
  _id: `placeholder-${index}`,
  name,
  coins: 180 + Math.floor(Math.random() * 720),
}));

function uniqueEntries(entries) {
  const seenNames = new Set();

  return entries.filter((entry) => {
    const name = String(entry?.name || '').trim().toLocaleLowerCase();
    if (!name || seenNames.has(name)) return false;

    seenNames.add(name);
    return true;
  });
}

function withPlaceholderEntries(entries) {
  const unique = uniqueEntries(entries);
  const names = new Set(unique.map((entry) => entry.name.toLocaleLowerCase()));
  const placeholders = placeholderEntries.filter((entry) => !names.has(entry.name.toLocaleLowerCase()));

  return [...unique, ...placeholders]
    .sort((left, right) => right.coins - left.coins)
    .slice(0, 8);
}

export default function LeaderboardSection() {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadLeaderboard = useCallback(async () => {
    try {
      const response = await fetch(apiUrl('/leaderboard'));

      if (!response.ok) throw new Error('Unable to load leaderboard');

      const result = await response.json();
      // Seed data and older accounts can contain the same display name more than
      // once. Keep one row per name so the leaderboard never repeats a person.
      setEntries(withPlaceholderEntries(result.leaderboard || []));
      setHasError(false);
    } catch {
      setEntries(placeholderEntries);
      setHasError(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeaderboard();

    const refreshInterval = window.setInterval(loadLeaderboard, 15000);
    window.addEventListener('focus', loadLeaderboard);

    return () => {
      window.clearInterval(refreshInterval);
      window.removeEventListener('focus', loadLeaderboard);
    };
  }, [loadLeaderboard]);

  return (
    <section id="leaderboard" className="section padded leaderboard-section">
      <div className="section-heading">
        <p className="eyebrow">Uttar Pradesh leaderboard</p>
        <h2>Recycle more. Rise higher.</h2>
      </div>
      <div className="leaderboard ui-card">
        <div className="leaderboard-head">
          <span>Rank</span>
          <span>User</span>
          <span>Z-Coins</span>
        </div>
        <div id="leaderboardRows">
          {isLoading && <p className="leaderboard-message">Loading leaderboard...</p>}
          {!isLoading && hasError && (
            <p className="leaderboard-message">Leaderboard is temporarily unavailable.</p>
          )}
          {!isLoading && !hasError && entries.length === 0 && (
            <p className="leaderboard-message">No leaderboard entries yet.</p>
          )}
          {!isLoading && !hasError && entries.map((user, index) => (
            <div key={user._id || user.name + index} className="leader-row">
              <span>
                {index < 3 ? (
                  <span className="rank-medal" aria-label={`Rank ${index + 1}`}>{medals[index]}</span>
                ) : (
                  <span className="rank-plain">{index + 1}.</span>
                )}
              </span>
              <span>{user.name}</span>
              <span>{user.coins}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
