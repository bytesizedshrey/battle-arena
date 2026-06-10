import express from 'express'
import runGraph from './ai/graph.ai.js'
import config from './config/config.js'

const app = express()

app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        keys: {
            google: !!config.GOOGLE_API_KEY,
            mistral: !!config.MISTRAL_API_KEY,
            cohere: !!config.COHERE_API_KEY
        }
    });
});


// Body parsing middleware
app.use(express.json())

// Custom CORS middleware to avoid installing cors package
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.get('/', async (req, res) => {
    try {
        const result = await runGraph('when is monaco gp gonna happen?')
        res.json(result)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'something exploded 💀' })
    }
})

app.post('/api/solve', async (req, res) => {
    try {
        const { problem } = req.body;
        if (!problem || typeof problem !== 'string') {
            return res.status(400).json({ message: 'Problem description is required and must be a string.' });
        }
        const result = await runGraph(problem);
        return res.json(result);
    } catch (error: any) {
        console.error('Error in /api/solve:', error);
        return res.status(500).json({ message: error?.message || 'something exploded 💀' });
    }
});

export default app