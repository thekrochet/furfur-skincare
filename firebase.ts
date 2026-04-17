import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromCache, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Test connection to Firestore
async function testConnection() {
  try {
    // Attempt to fetch a non-existent doc to trigger a server round-trip
    await getDocFromServer(doc(db, '_connection_test_', 'ping'));
    console.log("Firestore connection successful");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Firestore connection failed: The client is offline. Please check your Firebase configuration and database ID.");
    } else {
      console.warn("Firestore connection test finished (expected 404 is fine):", error);
    }
  }
}

testConnection();
