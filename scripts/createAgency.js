/*
 Temporary script to create a sample agency document in Firestore.
 Usage (recommended):
 1. Install firebase-admin: npm install firebase-admin
 2. Obtain a service account JSON from your Firebase project.
 3. Set the environment variable pointing to the JSON file: 
    PowerShell (Windows): $env:GOOGLE_APPLICATION_CREDENTIALS = 'C:\path\to\serviceAccountKey.json'
    cmd (Windows): set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\serviceAccountKey.json
    Bash (mac/linux): export GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
 4. Run: node scripts/createAgency.js

 NOTE: This is a temporary helper. Remove it after use.
*/

const admin = require('firebase-admin');

if (!admin.apps.length) {
  try {
    admin.initializeApp();
  } catch (err) {
    console.error('Failed to initialize firebase-admin. Make sure GOOGLE_APPLICATION_CREDENTIALS is set to your service account JSON.');
    console.error(err);
    process.exit(1);
  }
}

const db = admin.firestore();

async function createAgency() {
  const docId = 'ag_9283712';
  const data = {
    agencyId: docId,
    agencyName: 'Elite Estates',
    inviteCode: 'ELITE928',
    isVerified: true,
    createdAt: Date.now(),
    agencyOwner: {
      agentId: 'agent_uid',
      email: 'owner@gmail.com',
      name: 'Kaustubh',
    },
    details: {
      about: 'Luxury property specialists',
      phone: '+91XXXXXXXXXX',
      email: 'contact@elite.com',
      address: 'Mumbai, India',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      logoUrl: '',
      bannerUrl: '',
      website: '',
      gpsLocation: { lat: 0, lng: 0 },
    },
    agents: [
      {
        agentId: 'uid123',
        email: 'agent@gmail.com',
        name: 'Rahul',
        joinedAt: Date.now(),
        status: 'accepted',
        listedProperties: [
          {
            propertyId: 'prop_123',
            propertyTitle: '2BHK Andheri',
            listedAt: Date.now(),
          },
        ],
      },
    ],
  };

  try {
    await db.collection('agencies').doc(docId).set(data, { merge: true });
    console.log('Agency document created/updated at agencies/' + docId);
  } catch (err) {
    console.error('Failed to write agency document:', err);
    process.exit(1);
  }
}

createAgency().then(() => process.exit(0));
