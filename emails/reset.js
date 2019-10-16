const keys = require('../keys');

module.exports = function(email, token) {
    return {
        to: email,
        from: keys.EMAIL_FROM,
        subject: 'Reset password',
        html: `
            <h1>Hello in SHooop</h1>
            <p>If you want to reset password lead by link below</p>
            <hr>
            <p>Link for <a href="${keys.BASE_URL}/auth/changepass/${token}">reset password</a></p>
        `
    }
}