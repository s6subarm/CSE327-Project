import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import 'firebase/storage'

var config = {
    apiKey: 'AIzaSyANAEQC2gM-2m98GQzaPHEVB9mRd0QZfdo',
    authDomain: 'react-slack-clone-be18f.firebaseapp.com',
    databaseURL: 'https://react-slack-clone-be18f.firebaseio.com',
    projectId: 'react-slack-clone-be18f',
    storageBucket: 'react-slack-clone-be18f.appspot.com',
    messagingSenderId: '188608547096'
}
firebase.initializeApp(config)

export default firebase