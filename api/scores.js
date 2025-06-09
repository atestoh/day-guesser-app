import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
    // This API handles both GET (fetching scores) and POST (saving a new score)
    if (request.method === 'GET') {
        return handleGet(request, response);
    } else if (request.method === 'POST') {
        return handlePost(request, response);
    } else {
        return response.status(405).json({ message: 'Method Not Allowed' });
    }
}

async function handleGet(request, response) {
    try {
        // Create the table if it doesn't exist yet. This is safe to run every time.
        await sql`
            CREATE TABLE IF NOT EXISTS Scores (
                id SERIAL PRIMARY KEY,
                name VARCHAR(15) NOT NULL,
                mode VARCHAR(20) NOT NULL,
                score INT NOT NULL,
                time FLOAT NOT NULL,
                createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;

        // Fetch all scores, ordered by score (desc) and then time (asc)
        const { rows } = await sql`
            SELECT name, mode, score, time FROM Scores
            ORDER BY score DESC, time ASC;
        `;
        return response.status(200).json(rows);
    } catch (error) {
        // Ensure the response is always JSON, even for errors
        return response.status(500).json({ error: error.message });
    }
}

async function handlePost(request, response) {
    try {
        const { name, mode, score, time } = request.body;

        // Basic validation
        if (!name || !mode || score === undefined || time === undefined) {
            return response.status(400).json({ message: 'Missing required fields.' });
        }
        if (typeof name !== 'string' || name.length > 15 || name.length < 1) {
            return response.status(400).json({ message: 'Invalid name.' });
        }
        if (mode !== 'challenge_5' && mode !== 'challenge_10') {
            return response.status(400).json({ message: 'Invalid game mode for leaderboard.' });
        }

        await sql`
            INSERT INTO Scores (name, mode, score, time)
            VALUES (${name}, ${mode}, ${score}, ${time});
        `;
        return response.status(201).json({ message: 'Score saved successfully.' });
    } catch (error) {
        // Ensure the response is always JSON, even for errors
        return response.status(500).json({ error: error.message });
    }
}