import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

app.listen(PORT, () => {
  console.log(
    `[Mini Instagram Server] running in ${
      process.env.NODE_ENV || 'development'
    } mode on port ${PORT}`
  );
});
