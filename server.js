
import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';


// Configure environment variables
config();


// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const app = express();
const PORT = process.env.PORT || 3000;


// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(join(__dirname, 'public')));


// Store debate state
let debateState = {
    isActive: false,
    topic: '',
    timeLimit: 0,
    currentTurn: 1,
    messages: [],
    startTime: null
};


// Routes
app.post('/api/setup-debate', (req, res) => {
    const { topic, timeLimit } = req.body;
    debateState = {
        isActive: true,
        topic,
        timeLimit,
        currentTurn: 1,
        messages: [],
        startTime: new Date().getTime()
    };
    res.json({ status: 'success', debateState });
});


app.post('/api/submit-argument', (req, res) => {
    const { participant, argument } = req.body;
   
    if (!debateState.isActive) {
        return res.status(400).json({ error: 'Debate is not active' });
    }


    debateState.messages.push({
        id: Date.now(),
        participant,
        content: argument
    });
   
    debateState.currentTurn = debateState.currentTurn === 1 ? 2 : 1;
   
    res.json({ status: 'success', currentTurn: debateState.currentTurn });
});


app.get('/api/debate-status', (req, res) => {
    res.json(debateState);
});


app.post('/api/end-debate', async (req, res) => {
    if (!debateState.isActive) {
        return res.status(400).json({ error: 'Debate is not active' });
    }


    debateState.isActive = false;
   
    // Here you can integrate your AI judging logic
    const feedback = "AI feedback will be integrated here";
   
    res.json({ status: 'success', feedback });
});


// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
