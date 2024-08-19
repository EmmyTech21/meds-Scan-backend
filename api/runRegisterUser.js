const { registerUser } = require('./registerUser');

const userId = 'appUser'; // Replace with the desired user ID

registerUser(userId).then(() => {
    console.log('User registration complete.');
}).catch((error) => {
    console.error(`Error registering user: ${error}`);
});