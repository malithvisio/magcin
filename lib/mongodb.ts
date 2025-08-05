import mongoose from 'mongoose';

const MONGODB_URI =
  'mongodb+srv://visioinnovation:M9ksbouITVUmbzGC@cluster0.coggulq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

let isConnected = false;

async function connectDB() {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Export both function names for compatibility
export const connectToDatabase = connectDB;
export default connectDB;
