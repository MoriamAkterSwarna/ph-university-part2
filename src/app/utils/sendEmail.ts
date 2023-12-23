/* eslint-disable no-undef */
import nodemailer from 'nodemailer';
import config from '../config';

export const sendEmail = async (to: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: config.node_env === 'production',
    auth: {
      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
      user: 'moriam15-12880@diu.edu.bd',
      pass: 'tuuw qkhz fxfr igds',
    },
  });
  await transporter.sendMail({
    from: 'moriam15-12880@diu.edu.bd', // sender address
    to,
    subject: 'Change your password', // Subject line
    text: 'Reset password within 10 minutes....', // plain text body
    html,
  });
};
