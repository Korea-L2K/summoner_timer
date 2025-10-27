// Auto-detect environment: use localhost for development, production URL for deployed
const SOCKET_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000'
  : 'https://summoner-timer.onrender.com'; // Update with your actual Render URL

window.socket = io(SOCKET_URL);
