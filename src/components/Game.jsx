import React, { useState, useRef, useEffect } from 'react';
import useSound from 'use-sound';
import './Game.css';
import HowTo from './HowTo.jsx';
import CountdownTimer from './CountdownTimer.jsx';
import Leaderboard from './Leaderboard.jsx';

// Sound files
import soundClick from '/sounds/click.mp3';
import soundCorrect from '/sounds/correct.mp3';
import soundWrong from '/sounds/wrong.mp3';
import soundStart from '/sounds/start.mp3';
import soundFinish from '/sounds/finish.mp3';
import soundSave from '/sounds/start.mp3';

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function generateRandomDate() {
    const from = new Date(1900, 0, 1).getTime();
    const to = new Date(2100, 11, 31).getTime();
    return new Date(from + Math.random() * (to - from));
}

function Game() {
    const [screen, setScreen] = useState('menu');
    const [gameMode, setGameMode] = useState(null);
    const [challengeConfig, setChallengeConfig] = useState({ rounds: 0, duration: 60 });
    const [playerName, setPlayerName] = useState('');
    const [scoreSaved, setScoreSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [currentRound, setCurrentRound] = useState(1);
    const [currentDate, setCurrentDate] = useState(null);
    const [correctDayIndex, setCorrectDayIndex] = useState(null);
    const [message, setMessage] = useState("");
    const [isRoundFinished, setIsRoundFinished] = useState(false);
    const [userGuess, setUserGuess] = useState(null);
    const [feedback, setFeedback] = useState('');
    const roundStartTime = useRef(0);
    const challengeStartTime = useRef(0);
    const [lastRoundTime, setLastRoundTime] = useState(null);
    const [finalResults, setFinalResults] = useState({ totalTime: 0, correctAnswers: 0, totalGuesses: 0 });

    const [playClick] = useSound(soundClick, { volume: 0.5 });
    const [playCorrect] = useSound(soundCorrect, { volume: 0.6 });
    const [playWrong] = useSound(soundWrong, { volume: 0.6 });
    const [playStart] = useSound(soundStart, { volume: 0.7 });
    const [playFinish] = useSound(soundFinish, { volume: 0.7 });
    const [playSave] = useSound(soundSave, { volume: 0.7 });

    const setupGame = (mode, config) => {
        playStart();
        setGameMode(mode);
        setChallengeConfig(config);
        setCurrentRound(1);
        setFinalResults({ totalTime: 0, correctAnswers: 0, totalGuesses: 0 });
        setScoreSaved(false);
        setIsSaving(false);
        setPlayerName('');
        challengeStartTime.current = Date.now();
        startNewRound();
        setScreen('playing');
    };

    const startNewRound = () => {
        const newDate = generateRandomDate();
        setCurrentDate(newDate);
        setCorrectDayIndex(newDate.getDay());
        setIsRoundFinished(false);
        setLastRoundTime(null);
        setUserGuess(null);
        setFeedback('');
        if (gameMode === 'practice') {
            setMessage("What day of the week is it?");
        } else if (gameMode.startsWith('challenge')) {
            setMessage(`Date ${currentRound} of ${challengeConfig.rounds}`);
        } else {
            setMessage("Guess as fast as you can!");
        }
        roundStartTime.current = Date.now();
    };

    const handleGuess = (guessedIndex) => {
        if (isRoundFinished && gameMode !== 'time_attack') return;
        const wasCorrect = guessedIndex === correctDayIndex;
        if (wasCorrect) playCorrect();
        else {
            playWrong();
            if (gameMode !== 'time_attack') setFeedback('wrong');
        }
        setFinalResults(prev => ({
            ...prev,
            correctAnswers: prev.correctAnswers + (wasCorrect ? 1 : 0),
            totalGuesses: prev.totalGuesses + 1,
        }));
        if (gameMode === 'time_attack') {
            startNewRound();
        } else {
            const elapsed = (Date.now() - roundStartTime.current) / 1000;
            setLastRoundTime(elapsed);
            setUserGuess(guessedIndex);
            setFeedback(wasCorrect ? 'correct' : 'wrong');
            setMessage(wasCorrect ? `Correct! It was a ${DAYS_OF_WEEK[correctDayIndex]}.` : `Not quite. The correct day was ${DAYS_OF_WEEK[correctDayIndex]}.`);
            setIsRoundFinished(true);
        }
    };

    const handleNext = () => {
        playClick();
        if (gameMode === 'practice') {
            startNewRound();
        } else if (gameMode.startsWith('challenge')) {
            if (currentRound >= challengeConfig.rounds) {
                finishGame();
            } else {
                setCurrentRound(prev => prev + 1);
            }
        }
    };

    const finishGame = () => {
        playFinish();
        const totalChallengeTime = (Date.now() - challengeStartTime.current) / 1000;
        setFinalResults(prev => ({ ...prev, totalTime: totalChallengeTime }));
        setScreen('results');
    };

    const handleSaveScore = async () => {
        if (!playerName.trim()) {
            alert("Please enter a name!");
            return;
        }
        setIsSaving(true);
        playSave();
        try {
            const response = await fetch('/api/scores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: playerName.trim(),
                    mode: gameMode,
                    score: finalResults.correctAnswers,
                    time: finalResults.totalTime,
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save score.');
            }
            setScoreSaved(true);
        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        if (screen === 'playing' && gameMode.startsWith('challenge') && currentRound > 1) {
            startNewRound();
        }
    }, [currentRound]);

    const returnToMenu = () => {
        playClick();
        setScreen('menu');
        setGameMode(null);
    };
    
    // ... (rest of the file remains the same until the render logic)
    // --- RENDER LOGIC ---
    if (screen === 'leaderboard') return <Leaderboard onBack={returnToMenu} />;
    if (screen === 'howto') return <HowTo onBack={returnToMenu} />;

    if (screen === 'time_attack_setup') {
        // ... same as before
    }
    
    if (screen === 'menu') {
        return (
            <div className="game-container">
                <div className="menu-screen">
                    <h2>Day Guesser Challenge</h2>
                    <p>Select a game mode to begin.</p>
                    <div className="mode-selection">
                        <button onClick={() => setupGame('practice', { rounds: Infinity })}>Practice Mode</button>
                        <button onClick={() => setupGame('challenge_5', { rounds: 5 })}>5-Date Challenge</button>
                        <button onClick={() => setupGame('challenge_10', { rounds: 10 })}>10-Date Challenge</button>
                        <button onClick={() => { playClick(); setScreen('time_attack_setup'); }} className="time-attack-button">Time Attack Mode</button>
                        <button onClick={() => { playClick(); setScreen('leaderboard'); }} className="leaderboard-button">Leaderboard</button>
                        <button onClick={() => { playClick(); setScreen('howto'); }} className="how-to-button">How to Play</button>
                    </div>
                </div>
            </div>
        );
    }

    if (screen === 'results') {
        const isChallengeMode = gameMode.startsWith('challenge');
        return (
            <div className="game-container">
                <div className="results-screen">
                    <h2>{gameMode === 'time_attack' ? "Time's Up!" : "Challenge Complete!"}</h2>
                    {gameMode === 'time_attack' ? (
                        <>
                            <p>You guessed <span>{finalResults.correctAnswers}</span> dates correctly</p>
                            <p>out of {finalResults.totalGuesses} total attempts.</p>
                        </>
                    ) : (
                        <>
                            <p>You answered {finalResults.correctAnswers} out of {challengeConfig.rounds} correctly.</p>
                            <p>Total time: <span>{finalResults.totalTime.toFixed(2)} seconds</span></p>
                        </>
                    )}

                    {isChallengeMode && (
                        <div className="save-score-container">
                            {scoreSaved ? (
                                <p className="score-saved-message">Your score has been saved to the Hall of Fame!</p>
                            ) : (
                                <>
                                    <input
                                        type="text"
                                        placeholder="Enter your name to save score"
                                        className="name-input"
                                        value={playerName}
                                        onChange={(e) => setPlayerName(e.target.value)}
                                        maxLength="15"
                                        disabled={isSaving}
                                    />
                                    <button onClick={handleSaveScore} className="save-button" disabled={isSaving}>
                                        {isSaving ? 'Saving...' : 'Save to Leaderboard'}
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                    <button onClick={returnToMenu} className="menu-button">Back to Menu</button>
                </div>
            </div>
        );
    }
    
    // ... Playing screen render logic remains the same as the previous response ...
    return (
        <div className={`game-container ${feedback}`}>
            <div className="game-header">
                <button onClick={returnToMenu} className="back-button-ingame">‹ Menu</button>
                {gameMode === 'time_attack' && (
                    <>
                        <div className="score-display-ta">Correct: {finalResults.correctAnswers}</div>
                        <CountdownTimer duration={challengeConfig.duration} onTimeUp={finishGame} />
                    </>
                )}
            </div>
            <div className="date-display">
                {currentDate?.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            {(gameMode !== 'time_attack') && (
                <div className={`message-area ${feedback ? 'pop-in' : ''}`}>
                    <p>{message}</p>
                    {lastRoundTime && (<p className="time-display">Round time: {lastRoundTime.toFixed(2)} seconds.</p>)}
                </div>
            )}
            <div className={`day-buttons ${isRoundFinished && gameMode !== 'time_attack' ? 'answered' : ''}`}>
                {DAYS_OF_WEEK.map((day, index) => (
                    <button 
                        key={day} 
                        onClick={() => handleGuess(index)}
                        className={gameMode !== 'time_attack' ? getButtonClassName(index) : ''}
                        disabled={isRoundFinished && gameMode !== 'time_attack'}
                    >
                        {day}
                    </button>
                ))}
            </div>
            {isRoundFinished && gameMode !== 'time_attack' && (
                <div className="next-button-container pop-in-late">
                    <button onClick={handleNext} className="next-button">
                        {(gameMode.startsWith('challenge') && currentRound >= challengeConfig.rounds) ? 'Finish Challenge' : 'Next Date'}
                    </button>
                </div>
            )}
        </div>
    );
}

export default Game;