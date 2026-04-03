require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const twilio = require('twilio');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

// Twilio Setup
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = accountSid && authToken ? twilio(accountSid, authToken) : null;
const whatsappFrom = process.env.TWILIO_PHONE_NUMBER; // e.g. "whatsapp:+14155238886"
const myPhone = process.env.MY_PHONE_NUMBER; // e.g. "whatsapp:+1234567890"

// Local Data Store
const dataFile = path.join(__dirname, 'data.json');
function loadData() {
  if (!fs.existsSync(dataFile)) return { [getTodayStr()]: 0 };
  const d = JSON.parse(fs.readFileSync(dataFile));
  if (typeof d === 'number') return { [getTodayStr()]: d }; // fallback
  return d;
}
function saveData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getTodayWater() {
  const data = loadData();
  const today = getTodayStr();
  return data[today] || 0;
}

function addWater(amount) {
  const data = loadData();
  const today = getTodayStr();
  data[today] = (data[today] || 0) + amount;
  saveData(data);
  return data[today];
}

// WhatsApp Sending Logic
async function sendWaterReminder() {
  if (!twilioClient) return console.log('❌ Twilio credentials not set!');
  
  const current = getTodayWater();
  const target = 4000;
  
  const emojis = ['💧', '🌊', '🌸', '🎀', '✨', '🥤'];
  const e = emojis[Math.floor(Math.random() * emojis.length)];
  
  const msg = `Hey gorgeous! ${e}\n\nTime for your 300ml of water!\nYou are currently at *${current}ml* / ${target}ml for today.\n\nReply with *"Drank"* once you've finished it!`;

  try {
    const message = await twilioClient.messages.create({
      body: msg,
      from: whatsappFrom,
      to: myPhone
    });
    console.log(`✅ Reminder sent: ${message.sid}`);
  } catch (error) {
    console.error('❌ Failed to send WhatsApp message:', error);
  }
}

// Cron Job: 14 reminders spread from 8 AM to 9 PM (inclusive)
// "0 8-21 * * *" means minute 0 of every hour from 8 to 21 (8 AM to 9 PM)
cron.schedule('0 8-21 * * *', () => {
  console.log('⏰ Hourly cron job working... Sending reminder.');
  sendWaterReminder();
});

// Test Endpoint to trigger immediate send
app.get('/test-push', (req, res) => {
  sendWaterReminder();
  res.send('Test push triggered! Check WhatsApp.');
});

// Twilio Webhook (When you reply to the WhatsApp message)
app.post('/webhook', (req, res) => {
  const incomingMsg = req.body.Body ? req.body.Body.trim().toLowerCase() : '';
  
  let replyText = "I didn't quite get that... Reply 'Drank' to log 300ml of water! 💧";

  if (incomingMsg.includes('drank') || incomingMsg.includes('done') || incomingMsg.includes('yes')) {
    const newTotal = addWater(300);
    replyText = `Yayy! 🎉 300ml logged!\n\nYour new total is *${newTotal}ml*. Only ${Math.max(4000 - newTotal, 0)}ml left to go! Keep glowing! 🎀`;
  }

  // Send TwiML response back to Twilio
  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message(replyText);
  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
});

// Endpoint for the React Native app to potentially fetch/sync later
app.get('/api/water', (req, res) => {
  res.json({ total: getTodayWater(), goal: 4000 });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n======================================`);
  console.log(`🌸 Water Agent is running on port ${PORT}!`);
  console.log(`⏰ Cron schedule: 8:00 AM to 9:00 PM`);
  console.log(`======================================\n`);
  
  if (!twilioClient) {
    console.log(`⚠️  WARNING: You need to set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env\n`);
  }
});
