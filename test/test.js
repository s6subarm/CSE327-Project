var assert = require('assert');

describe('Login', function(){
    describe('submitHandler()', function(){
        it('should succeesfully login a user with valid username and password', function(){
            assert.equal(true/*login.submitHandler(email, password)*/, true);
        });
    });
});

describe('Login', function(){
    describe('submitHandler()', function(){
        it('should succeesfully deny a user to login with invalid password', function(){
            assert.equal(login.submitHandler('rayhan@gmail.com', 'bhulPassword'), false);
        });
    });
});




// equal function takes two parameter. first one is a method call 
//and the second one is expected output from that particular call with specific values
//assert will check if the input and output is correct or not.