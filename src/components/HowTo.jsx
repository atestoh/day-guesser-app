import React from 'react';
import './HowTo.css'; // We'll create this file next

function HowTo({ onBack }) { // We receive the 'onBack' function as a prop
  return (
    <div className="how-to-container">
      <div className="how-to-content">
        <h2 className="how-to-title">The Secret Method</h2>
        <p className="how-to-subtitle">
          Learn to calculate the day of the week for any date in your head.
        </p>

        <div className="divider" />

        <p>
          Welcome, challenger! You're about to learn the secret used by mental
          calculators to find the day of the week for any date instantly. It's
          called the <strong>Doomsday Algorithm</strong>. It looks complex at
          first, but with a little practice, it becomes second nature.
        </p>
        <p>
          The core idea is simple: for any year, a set of easy-to-remember dates
          all fall on the <em>exact same day of the week</em>. This special day
          is called the <strong>Doomsday</strong>. If you can find the Doomsday
          for a year, you can find any other day.
        </p>
        <p>
          Let's do this in 4 steps. Our example will be{' '}
          <strong>August 22, 1995</strong>.
        </p>

        <div className="divider" />

        <h3>Step 1: Find the Century's "Anchor Day"</h3>
        <p>
          Every century has a special "anchor day" that acts as our starting
          point. The pattern repeats every 400 years, but you only really need
          to remember one or two!
        </p>
        <table className="how-to-table">
          <thead>
            <tr>
              <th>Century</th>
              <th>Anchor Day</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>1700s</td><td>Sunday</td></tr>
            <tr><td>1800s</td><td>Friday</td></tr>
            <tr><td><strong>1900s</strong></td><td><strong>Wednesday</strong></td></tr>
            <tr><td>2000s</td><td>Tuesday</td></tr>
            <tr><td>2100s</td><td>Sunday</td></tr>
          </tbody>
        </table>
        <p>
          To make the math easier, let's think of days as numbers: <br />
          <code>Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6</code>
        </p>
        <p>
          For our example, <strong>1995</strong>, the anchor day is{' '}
          <strong>Wednesday</strong>, so our starting number is <strong>3</strong>.
        </p>

        <div className="divider" />

        <h3>Step 2: Calculate the Year's Doomsday</h3>
        <p>
          This is the most "math-y" part, but it's just simple arithmetic. We'll
          use the last two digits of the year. For <strong>1995</strong>, we
          use <strong>95</strong>.
        </p>
        <ol>
          <li>
            <strong>"How many 12s?"</strong> How many times does 12 go fully into 95?
            <br />
            <code>95 / 12 = 7</code> (ignore the remainder). Our first number is{' '}
            <strong>7</strong>.
          </li>
          <li>
            <strong>"What's the remainder?"</strong> What is the remainder from that
            division?
            <br />
            <code>95 % 12 = 11</code>. Our second number is <strong>11</strong>.
          </li>
          <li>
            <strong>"How many 4s in the remainder?"</strong> How many times does 4 go
            into the remainder (11)?
            <br />
            <code>11 / 4 = 2</code> (ignore the new remainder). Our third number is{' '}
            <strong>2</strong>.
          </li>
        </ol>
        <p>Now, add your <strong>Anchor Day</strong> and these three numbers:</p>
        <code className="formula">3 + 7 + 11 + 2 = 23</code>
        <p>Finally, find the remainder of this sum when divided by 7:</p>
        <code className="formula">23 % 7 = 2</code>
        <p>
          The number <strong>2</strong> corresponds to <strong>Tuesday</strong>.
          This is it! The Doomsday for <strong>1995</strong> is{' '}
          <strong>Tuesday</strong>.
        </p>

        <div className="divider" />

        <h3>Step 3: Know the Monthly Doomsdays</h3>
        <h4>Method 1: The "Even Months" Rule</h4>
        <p>
          For the even-numbered months, the Doomsday is the same as the month's
          number: <strong>4/4, 6/6, 8/8, 10/10, 12/12</strong>.
        </p>
        <h4>Method 2: Mnemonic Pairs for Odd Months</h4>
        <p>
          Remember the phrase: <em>"I work from 9 to 5 at the 7-Eleven."</em>
          <br />
          This gives you: <strong>9/5 & 5/9</strong>, and{' '}
          <strong>7/11 & 11/7</strong>.
        </p>
        <h4>The "Leftovers" - March & The First Two</h4>
        <ul>
            <li><strong>March:</strong> Pi Day! <strong>3/14</strong> is always a Doomsday.</li>
            <li><strong>January & February:</strong> In a <strong>normal year</strong>, it's Jan 3rd & Feb 7th. In a <strong>LEAP year</strong>, they get "bumped" to Jan 4th & Feb 8th.</li>
        </ul>
        <p>For our example, we now know <strong>August 8th</strong> was a Tuesday.</p>
        
        <div className="divider" />

        <h3>Step 4: Count to Your Target Date</h3>
        <p>We want to find the day for <strong>August 22, 1995</strong>.</p>
        <ul>
            <li>We know from Step 3 that <strong>August 8th</strong> is a Doomsday (a Tuesday).</li>
            <li>Our target date is <strong>August 22nd</strong>.</li>
        </ul>
        <p>How many days are between them? <code>22 - 8 = 14</code> days.</p>
        <p>Since 14 is a perfect multiple of 7 (2 weeks), the day of the week doesn't change. August 22nd, 1995 was also a <strong>Tuesday</strong>.</p>
        
        <div className="divider" />

        <h3>Practice Makes Perfect!</h3>
        <p>This method seems long written down, but the steps become lightning-fast with practice. Try it on birthdays, historical dates, or use the "Practice Mode" in this app to train your new mental superpower!</p>

      </div>
      <button onClick={onBack} className="menu-button">
        Back to Menu
      </button>
    </div>
  );
}

export default HowTo;