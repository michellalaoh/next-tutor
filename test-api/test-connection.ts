// Test MongoDB connection
// Run with: npx tsx test-api/test-connection.ts
// or: ts-node test-api/test-connection.ts

import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load environment variables from .env.local
function loadEnvFile() {
  try {
    const envPath = resolve(process.cwd(), '.env.local');
    const envFile = readFileSync(envPath, 'utf-8');
    const lines = envFile.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          // Remove quotes if present
          const cleanValue = value.replace(/^["']|["']$/g, '');
          process.env[key.trim()] = cleanValue;
        }
      }
    }
  } catch (error) {
    console.error('⚠️  Could not load .env.local file:', error instanceof Error ? error.message : error);
  }
}

loadEnvFile();

async function testConnection() {
  const MONGODB_URI = process.env.MONGODB_URI;

  console.log('🔍 Testing MongoDB connection...\n');

  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in .env.local');
    process.exit(1);
  }

  // Mask password in connection string for logging
  const maskedURI = MONGODB_URI.replace(/:([^:@]+)@/, ':****@');
  console.log('📝 Connection string:', maskedURI);
  console.log('📝 Starts with mongodb:// or mongodb+srv://:', 
    MONGODB_URI.startsWith('mongodb://') || MONGODB_URI.startsWith('mongodb+srv://'));
  console.log('');

  try {
    const opts: mongoose.ConnectOptions = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    };

    console.log('⏳ Attempting to connect...');
    await mongoose.connect(MONGODB_URI, opts);
    
    console.log('✅ Successfully connected to MongoDB!');
    console.log('📊 Connection state:', mongoose.connection.readyState);
    console.log('📊 Database name:', mongoose.connection.db?.databaseName);
    
    await mongoose.disconnect();
    console.log('✅ Disconnected successfully');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error('Error:', error instanceof Error ? error.message : error);
    
    if (error instanceof Error) {
      if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
        console.error('\n💡 Tip: Cannot resolve hostname. Check your connection string.');
      } else if (error.message.includes('authentication failed') || error.message.includes('bad auth')) {
        console.error('\n💡 Tip: Authentication failed. Check your username and password.');
        console.error('💡 Tip: Special characters in password must be URL-encoded (e.g., @ becomes %40)');
      } else if (error.message.includes('timeout')) {
        console.error('\n💡 Tip: Connection timeout. Possible issues:');
        console.error('   - Your IP is not whitelisted in MongoDB Atlas');
        console.error('   - Network/firewall blocking the connection');
        console.error('   - Wrong connection string');
      } else if (error.message.includes('IP')) {
        console.error('\n💡 Tip: IP whitelist issue. Add your IP to MongoDB Atlas Network Access.');
      }
    }
    
    process.exit(1);
  }
}

testConnection();

