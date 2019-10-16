const keys = require('../keys');

module.exports = function(email) {
    return {
        to: email,
        from: keys.EMAIL_FROM,
        subject: 'User registration',
        html: `
            <h1>Hello in SHooop</h1>
            <p>You successfuly create an acount</p>
            <p>Your email for login is <strong>${email}</strong></p>
            <hr>
            <p>Let's go to <a href="${keys.BASE_URL}/auth/login#login">Shooop</a></p>
        `
    }
}