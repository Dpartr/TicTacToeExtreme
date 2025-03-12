# TicTacToeExtreme

A feature-rich Tic Tac Toe game with advanced gameplay mechanics, including a 3x3 to 5x5 expansion feature and AI opponent.

## Recent Updates

- Added Firebase analytics to track visitor statistics
- Added a stats button to show site usage metrics
- Implemented game event tracking to analyze gameplay patterns

## Firebase Integration

The game now uses Firebase Firestore to track:
- Daily visitor counts
- Unique visitor counts
- Game events (starts, completions, phase transitions)

## Setup for Development

1. Clone this repository
2. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
3. Add a web app to your Firebase project
4. Enable Firestore Database in your Firebase project
5. Add the following secrets to your GitHub repository:
   - FIREBASE_API_KEY
   - FIREBASE_AUTH_DOMAIN
   - FIREBASE_PROJECT_ID
   - FIREBASE_STORAGE_BUCKET
   - FIREBASE_MESSAGING_SENDER_ID
   - FIREBASE_APP_ID

The GitHub workflow will automatically inject these secrets into the code during deployment.

## Firestore Security Rules

Make sure to configure the following security rules in your Firebase Firestore:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to metrics collection
    match /metrics/{document=**} {
      allow read: if true;
      allow write: if true;
    }
    // For tracking unique visitors
    match /visits/{document=**} {
      allow read: if false; // Keep visit data private
      allow write: if true; // Allow writing visit data
    }
    // For tracking game events
    match /events/{document=**} {
      allow read: if false; // Keep event data private
      allow write: if true; // Allow writing event data
    }
  }
}
```

## Local Development Without Firebase

For local development without Firebase, the code will gracefully handle the missing configuration by skipping analytics tracking.
