import React, { useState, useEffect } from 'react';

// A simple, reusable countdown timer component
function CountdownTimer({ duration, onTimeUp }) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    // Exit early if time is up
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    // Set up the interval
    const intervalId = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);

    // Clean up the interval on component unmount or when time is up
    return () => clearInterval(intervalId);
  }, [timeLeft, onTimeUp]);

  // Format the time for display (e.g., 60 -> 1:00)
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="countdown-timer">
      {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
    </div>
  );
}

export default CountdownTimer;