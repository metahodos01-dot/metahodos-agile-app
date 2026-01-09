import { db, auth } from './firebase';
import { collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore';

/**
 * Test Firestore connection
 * Creates a test document, reads it, then deletes it
 */
export async function testFirestore(): Promise<boolean> {
  try {
    console.log('🔥 Testing Firestore connection...');

    // Try to read from a collection (doesn't matter if empty)
    const testCollection = collection(db, '_test_connection');

    // Add a test document
    console.log('📝 Adding test document...');
    const docRef = await addDoc(testCollection, {
      message: 'Firebase connection test',
      timestamp: new Date().toISOString(),
    });
    console.log('✅ Test document created with ID:', docRef.id);

    // Read documents
    console.log('📖 Reading test documents...');
    const querySnapshot = await getDocs(testCollection);
    console.log('✅ Firestore read successful! Documents found:', querySnapshot.size);

    // Clean up - delete test document
    console.log('🗑️  Cleaning up test document...');
    await deleteDoc(docRef);
    console.log('✅ Test document deleted');

    console.log('✅ Firestore connection test PASSED!');
    return true;
  } catch (error) {
    console.error('❌ Firestore connection test FAILED:', error);
    return false;
  }
}

/**
 * Test Firebase Auth initialization
 */
export function testAuth(): boolean {
  try {
    console.log('🔥 Testing Firebase Auth...');
    console.log('✅ Firebase Auth initialized:', auth.app.name);
    console.log('✅ Current user:', auth.currentUser ? auth.currentUser.email : 'Not logged in');
    return true;
  } catch (error) {
    console.error('❌ Firebase Auth test FAILED:', error);
    return false;
  }
}

/**
 * Run all Firebase tests
 */
export async function runAllTests(): Promise<void> {
  console.log('\n🧪 Running Firebase Connection Tests...\n');

  // Test Auth
  const authTest = testAuth();

  // Test Firestore
  const firestoreTest = await testFirestore();

  console.log('\n📊 Test Results:');
  console.log('  Auth:', authTest ? '✅ PASS' : '❌ FAIL');
  console.log('  Firestore:', firestoreTest ? '✅ PASS' : '❌ FAIL');

  if (authTest && firestoreTest) {
    console.log('\n🎉 All Firebase tests PASSED! You are ready to proceed.\n');
  } else {
    console.log('\n⚠️  Some tests FAILED. Check the errors above.\n');
  }
}
