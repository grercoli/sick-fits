const nodemailer = require('nodemailer');

//transport is like a one way of sending email. Like you could have multiple transports
const transport = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

//si quisiera incluir algo relacionado a email templating aqui es donde lo haria

//function that we are gonna make to template is called make a nice email. It's gonna be a function that takes in some text and returns the litle template
const makeANiceEmail = text => `
    <div className="email" style="
        border: 1px solid black;
        padding: 20px;
        font-family: sans-serif;
        line-height: 2;
        font-size: 20px;
    ">
        <h2>Hello There!</h2>
        <p>${text}</p>
        <p>Greetings Wes Bos</p>
    </div>
`;


exports.transport = transport;
exports.makeANiceEmail = makeANiceEmail;