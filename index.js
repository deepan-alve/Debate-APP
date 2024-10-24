// Import necessary modules
import readline from 'readline';
import { config } from 'dotenv';


// Load environment variables
config();


const ARLIAI_API_KEY = process.env.ARLIAI_API_KEY;


// Function to call the AI API for feedback
async function chatCompletion(messages) {
  const response = await fetch("https://api.arliai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${ARLIAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "model": "Meta-Llama-3.1-8B-Instruct",
      "messages": messages,
      "repetition_penalty": 1.2,
      "temperature": 0.6,
      "top_p": 0.85,
      "top_k": 30,
      "max_tokens": 300,
      "stream": false
    })
  });


  const data = await response.json();
  return data;
}


// Function for the two-user debate match with time limit
async function debateMatch(topic, timeLimit) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });


  let messages = [
    { "role": "system", "content": `You are an impartial judge. The topic is: ${topic}. You will judge based on arguments from two participants.` }
  ];


  console.log(`Today's debate topic: ${topic}`);
  console.log(`Participants have ${timeLimit} minutes to debate. Type 'exit' to end the debate early.`);


  const startTime = Date.now();
  const endTime = startTime + timeLimit * 60 * 1000; // Convert minutes to milliseconds


  while (Date.now() < endTime) {
    // Participant 1's argument
    const participant1Argument = await new Promise(resolve => {
      rl.question("Participant 1, your argument: ", resolve);
    });
    if (participant1Argument.toLowerCase() === 'exit') break;
    messages.push({ "role": "user", "content": `Participant 1: ${participant1Argument}` });


    // Participant 2's argument
    const participant2Argument = await new Promise(resolve => {
      rl.question("Participant 2, your argument: ", resolve);
    });
    if (participant2Argument.toLowerCase() === 'exit') break;
    messages.push({ "role": "user", "content": `Participant 2: ${participant2Argument}` });
  }


  console.log("Debate time is over.");


  rl.close();
  return messages;
}


// Function for AI to judge the debate and give scores
// Function for AI to judge the debate and give scores
async function judgeDebate(debateMessages) {
    const judgeMessages = [
      { "role": "system", "content": "You are an impartial debate judge. Score the debate between two participants based on their arguments, logic, and strength of their points. Keep the feedback concise." },
      { "role": "user", "content": "Here is the debate conversation. Please provide scores for both participants and a brief feedback." },
      { "role": "assistant", "content": JSON.stringify(debateMessages) }
    ];
 
    try {
      const response = await chatCompletion(judgeMessages);
 
      // Check if the response contains choices
      if (response && response.choices && response.choices.length > 0) {
        const judgeFeedback = response.choices[0].message.content;
        return judgeFeedback;
      } else {
        console.error("Unexpected response format:", response);
        return "Error: Could not retrieve feedback from the AI.";
      }
 
    } catch (error) {
      console.error("Error during API call:", error);
      return "Error: Failed to communicate with the AI API.";
    }
  }
 


// Main function to start the two-user debate
async function startDebate() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });


  // Prompt the users to input the debate topic
  const topic = await new Promise(resolve => {
    rl.question("Enter a debate topic: ", resolve);
  });


  // Prompt the users to input the time limit in minutes
  const timeLimit = await new Promise(resolve => {
    rl.question("Enter the time limit for the debate (in minutes): ", resolve);
  });


  let timeLimitInMinutes = parseFloat(timeLimit);
  if (isNaN(timeLimitInMinutes) || timeLimitInMinutes <= 0) {
    console.log("Invalid time limit. Defaulting to 5 minutes.");
    timeLimitInMinutes = 5;
  }


  // Start the debate between two participants
  const debateMessages = await debateMatch(topic, timeLimitInMinutes);


  // AI acts as judge and gives short feedback
  const feedback = await judgeDebate(debateMessages);
  console.log("Judge's Feedback:", feedback);


  rl.close();
}


// Start the debate session
startDebate();