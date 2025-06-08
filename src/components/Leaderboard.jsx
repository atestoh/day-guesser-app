import React, { useState, useEffect } from 'react';
import './Leaderboard.css';

// Helper function to format time
const formatTime = (seconds) => {
    return `${seconds.toFixed(2)}s`;
};

// This function processes the raw data from the API
const processScores = (scores) => {
    let rank = 1;
    // The data is already sorted by the API, we just need to assign ranks
    return scores.map((score, index) => {
        if (index > 0) {
            const prevScore = scores[index - 1];
            if (score.score < prevScore.score || (score.score === prevScore.score && score.time > prevScore.time)) {
                rank = index + 1;
            }
        }
        return { ...score, rank };
    });
};

function Leaderboard({ onBack }) {
    const [scores, setScores] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchScores = async () => {
            try {
                const response = await fetch('/api/scores');
                if (!response.ok) {
                    throw new Error('Failed to fetch leaderboard data.');
                }
                const data = await response.json();
                setScores(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchScores();
    }, []);

    const scores5 = processScores(scores.filter(s => s.mode === 'challenge_5'));
    const scores10 = processScores(scores.filter(s => s.mode === 'challenge_10'));

    const renderTable = (data, title) => {
        if (isLoading) return <p className="loading-message">Loading Hall of Fame...</p>;
        if (error) return <p className="error-message">{error}</p>;
        
        return (
            <div className="leaderboard-table-container">
                <h3>{title}</h3>
                {data.length > 0 ? (
                    <table className="leaderboard-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Name</th>
                                <th>Score</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((entry, index) => (
                                <tr key={index}>
                                    <td>{entry.rank}</td>
                                    <td>{entry.name}</td>
                                    <td>{entry.score}</td>
                                    <td>{formatTime(entry.time)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="no-scores">No scores recorded for this mode yet.</p>
                )}
            </div>
        );
    };

    return (
        <div className="leaderboard-container">
            <h2 className="leaderboard-title">Hall of Fame</h2>
            <div className="leaderboards-wrapper">
                {renderTable(scores5, '5-Date Challenge')}
                {renderTable(scores10, '10-Date Challenge')}
            </div>
            <button onClick={onBack} className="menu-button">
                Back to Menu
            </button>
        </div>
    );
}

export default Leaderboard;