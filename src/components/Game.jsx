import React, { useState, useRef, useEffect } from 'react';
import useSound from 'use-sound';
import './Game.css';
import HowTo from './HowTo'; // Import the new component

// Sound files from the public folder
import soundClick from '/sounds/click.mp3';
import soundCorrect from '/sounds/correct.mp3';
import soundWrong from '/sounds/wrong.mp3';
import soundStart from '/sounds/start.mp3';
import soundFinish from '/sounds/finish.mp3';

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function generateRandomDate() {
    const from = new Date(1900, 0, 1).getTime();
    const to = new Date(2100, 11, 31).getTime();
    return new Date(from + Math.random() * (to - from));
}

function Game() {
    // --- MASTER GAME STATE ---
    const [screen, setScreen] = useState('menu'); // 'menu', 'playing', 'results', 'howto'
    
    // --- GAME CONFIGURATION ---
    const [gameMode, setGameMode] = useState(null);
    const [totalRounds, setTotalRounds] = useState(0);

    // --- IN-GAME STATE ---
    const [currentRound, setCurrentRound] = useState(1);
    const [currentDate, setCurrentDate] = useState(null);
    const [correctDayIndex, setCorrectDayIndex] = useState(null);
    const [message, setMessage] = useState("");
    const [isRoundFinished, setIsRoundFinished] = useState(false);
    
    // --- Animation & Feedback State ---
    const [userGuess, setUserGuess] = useState(null);
    const [feedback, setFeedback] = useState(''); // 'correct', 'wrong', or ''

    // --- TIMER & SCORING STATE ---
    const roundStartTime = useRef(0);
    const challengeStartTime = useRef(0);
    const [lastRoundTime, setLastRoundTime] = useState(null);
    const [finalResults, setFinalResults] = useState({ totalTime: 0, correctAnswers: 0 });

    // --- SOUND EFFECTS HOOKS ---
    const [playClick] = useSound(soundClick, { volume: 0.5 });
    const [playCorrect] = useSound(soundCorrect, { volume: 0.6 });
    const [playWrong] = useSound(soundWrong, { volume: 0.6 });
    const [playStart] = useSound(soundStart, { volume: 0.7 });
    const [playFinish] = useSound(soundFinish, { volume: 0.7 });

    // --- GAME ACTIONS ---
    const setupAndStartGame = (mode, rounds) => {
        playStart();
        setGameMode(mode);
        setTotalRounds(rounds);
        setCurrentRound(1);
        setFinalResults({ totalTime: 0, correctAnswers: 0 });
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
        } else {
            setMessage(`Date ${currentRound} of ${totalRounds}`);
        }
        roundStartTime.current = Date.now();
    };

    const handleGuess = (guessedIndex) => {
        if (isRoundFinished) return;
        const roundEndTime = Date.now();
        const elapsed = (roundEndTime - roundStartTime.current) / 1000;
        setLastRoundTime(elapsed);
        setUserGuess(guessedIndex);

        const wasCorrect = guessedIndex === correctDayIndex;
        if (wasCorrect) {
            playCorrect();
            setFeedback('correct');
            setMessage(`Correct! It was a ${DAYS_OF_WEEK[correctDayIndex]}.`);
        } else {
            playWrong();
            setFeedback('wrong');
            setMessage(`Not quite. The correct day was ${DAYS_OF_WEEK[correctDayIndex]}.`);
        }
        if (gameMode.startsWith('challenge')) {
            setFinalResults(prev => ({ ...prev, correctAnswers: prev.correctAnswers + (wasCorrect ? 1 : 0) }));
        }
        setIsRoundFinished(true);
    };

    const handleNext = () => {
        playClick();
        if (gameMode === 'practice') {
            startNewRound();
        } else {
            if (currentRound >= totalRounds) {
                playFinish();
                const challengeEndTime = Date.now();
                const totalChallengeTime = (challengeEndTime - challengeStartTime.current) / 1000;
                setFinalResults(prev => ({ ...prev, totalTime: totalChallengeTime }));
                setScreen('results');
            } else {
                setCurrentRound(prev => prev + 1);
            }
        }
    };

    useEffect(() => {
        if (screen === 'playing' && gameMode.startsWith('challenge') && currentRound > 1) {
            startNewRound();
        }
    }, [currentRound, gameMode, screen]);

    const returnToMenu = () => {
        playClick();
        setScreen('menu');
        setGameMode(null);
    };

    const getButtonClassName = (index) => {
        if (!isRoundFinished) return '';
        if (index === correctDayIndex) return 'correct-answer';
        if (index === userGuess) return 'wrong-answer';
        return 'other-button';
    };

    // --- RENDER LOGIC ---
    
    if (screen === 'howto') {
        return <HowTo onBack={returnToMenu} />;
    }

    if (screen === 'menu') {
        return (
            <div className="game-container">
                <div className="menu-screen">
                    <h2>Day Guesser Challenge</h2>
                    <p>Select a game mode or learn the secret method.</p>
                    <div className="mode-selection">
                        <button onClick={() => setupAndStartGame('practice', Infinity)}>Practice Mode</button>
                        <button onClick={() => setupAndStartGame('challenge_5', 5)}>5-Date Challenge</button>
                        <button onClick={() => setupAndStartGame('challenge_10', 10)}>10-Date Challenge</button>
                        <button onClick={() => { playClick(); setScreen('howto'); }} className="how-to-button">How to Play</button>
                    </div>
                </div>
            </div>
        );
    }

    if (screen === 'results') {
        const averageTime = totalRounds > 0 ? (finalResults.totalTime / totalRounds).toFixed(2) : 0;
        return (
            <div className="game-container">
                <div className="results-screen">
                    <h2>Challenge Complete!</h2>
                    <p>You answered {finalResults.correctAnswers} out of {totalRounds} correctly.</p>
                    <p>Total time: <span>{finalResults.totalTime.toFixed(2)} seconds</span></p>
                    <p>Average time per date: <span>{averageTime} seconds</span></p>
                    <button onClick={returnToMenu} className="menu-button">Back to Menu</button>
                </div>
            </div>
        );
    }

    // This is the 'playing' screen
    return (
        <div className={`game-container ${feedback}`}>
            <button onClick={returnToMenu} className="back-button-ingame">‹ Menu</button>
            <div className="date-display">
                {currentDate?.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className={`message-area ${feedback ? 'pop-in' : ''}`}>
                <p>{message}</p>
                {lastRoundTime && (
                    <p className="time-display">Round time: {lastRoundTime.toFixed(2)} seconds.</p>
                )}
            </div>
            {!isRoundFinished ? (
                <div className="day-buttons">
                    {DAYS_OF_WEEK.map((day, index) => (
                        <button key={day} onClick={() => handleGuess(index)}>{day}</button>
                    ))}
                </div>
            ) : (
                <div className="day-buttons answered">
                    {DAYS_OF_WEEK.map((day, index) => (
                        <button key={day} className={getButtonClassName(index)} disabled>{day}</button>
                    ))}
                </div>
            )}
            {isRoundFinished && (
                <div className="next-button-container pop-in-late">
                    <button onClick={handleNext} className="next-button">
                        {(gameMode.startsWith('challenge') && currentRound >= totalRounds) ? 'Finish Challenge' : 'Next Date'}
                    </button>
                </div>
            )}
        </div>
    );
}

export default Game;