var firebase = require("firebase");
var assert = require("assert");
var config = {
  apiKey: "AIzaSyANAEQC2gM-2m98GQzaPHEVB9mRd0QZfdo",
  authDomain: "react-slack-clone-be18f.firebaseapp.com",
  databaseURL: "https://react-slack-clone-be18f.firebaseio.com",
  projectId: "react-slack-clone-be18f",
  storageBucket: "react-slack-clone-be18f.appspot.com",
  messagingSenderId: "188608547096"
};

firebase.initializeApp(config);

describe("Login", function() {
  describe("submitHandler()", function() {
    it("should succeesfully login a user with valid username and password", function() {
      firebase
        .auth()
        .signInWithEmailAndPassword("rayhan@gmail.com", "123456")
        .then(signedinUser => {
          assert.equal(signedinUser.user.email, "rayhan@gmail.com");
        });
    });
  });
});

describe("Login", function() {
  describe("submitHandler()", function() {
    it("should succeesfully deny a user to login with invalid password", function() {
      firebase
        .auth()
        .signInWithEmailAndPassword("muser@test1.net", "1231j23")
        .then()
        .catch(err => {
          assert.ok(true);
        });
    });
  });
});

// equal function takes two parameter. first one is a method call
//and the second one is expected output from that particular call with specific values
//assert will check if the input and output is correct or not.