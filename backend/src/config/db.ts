import mongoose from 'mongoose';

// Declare global isMockDb property
declare global {
  var isMockDb: boolean;
}

export const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/enterprise_lms';

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000, // Fail quickly if mongo is offline
    });
    global.isMockDb = false;
    console.log('==================================================');
    console.log('🟢 MongoDB connected successfully.');
    console.log('==================================================');
  } catch (error: any) {
    global.isMockDb = true;
    console.log('==================================================');
    console.log('⚠️  MongoDB Connection Failed: ', error.message);
    console.log('💡 Falling back to In-Memory Demo Database Mode.');
    console.log('   All data modifications will persist in memory.');
    console.log('==================================================');
  }
};
