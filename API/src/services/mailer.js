import { Container, Service } from 'typedi';
import nodemailer from 'nodemailer';

@Service()
export default class MailerService {
  constructor() {
    this.emailClient = Container.get('emailClient');
    this.mailTransport = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });
  }

  async SendWelcomeEmail({ email, emailVerificationToken: code, name }) {
    /**
     * @TODO Call Mailchimp/Sendgrid or whatever
     */
    // Added example for sending mail from mailgun

    const confirmLink = `https://izzyleads.com/confirm?code=${code}&email=${email}`;
    const data = {
      from: 'Excited User <me@samples.mailgun.org>',
      to: email, //your email address
      subject: "Activate your IzzyLead's Account",
      text: `Hi ${name} \n, Welcome to IzzyLeads. \n To confirm your account, use the code ${code} on the confirmation page. \nYou can use this link directly: ${confirmLink}.\nThank you\n\nThe IzzyLeads Team`,
      html: `Hi <strong>${name}</strong>,<br/><br/> Welcome to IzzyLeads.<br/>To confirm your account, use the code <strong>${code}</strong> on the confirmation page. <br/><a href="${confirmLink}" target="_blank">You can use this link directly</a>.<br/><br/>Thank you<br/><br/><em>The IzzyLeads Team<em/>`,
    };

    return this.sendMail(data);
  }
  async ResendConfirmEmail({ email, emailVerificationToken: code, name }) {
    const confirmLink = `https://izzyleads.com/confirm?code=${code}&email=${email}`;
    const data = {
      from: 'Izzy Leads <noreply@izzyleads.com>',
      to: email,
      subject: "Activate your IzzyLead's Account",
      text: `Hi ${name},\n Welcome to IzzyLeads. \n To confirm your account, use the code ${code} on the confirmation page. \nYou can use this link directly: ${confirmLink}.\nThank you\n\nThe IzzyLeads Team`,
      html: `Hi <strong>${name}</strong>,<br/><br/> Welcome to IzzyLeads.<br/>To confirm your account, use the code <strong>${code}</strong> on the confirmation page. <br/><a href="${confirmLink}" target="_blank">You can use this link directly</a>.<br/><br/>Thank you<br/><br/><em>The IzzyLeads Team<em/>`,
    };

    return this.sendMail(data);
  }
  async SendForgotEmail(user) {
    const { email, name, resetPasswordToken } = user;
    const confirmLink = `https://izzyleads.com/reset?code=${resetPasswordToken}&email=${email}`;
    const data = {
      from: 'Izzy Leads <noreply@izzyleads.com>',
      to: email,
      subject: "Reset your IzzyLead's Account",
      text: `Hi ${name},\n You have requested to reset your password.\nUse the code ${resetPasswordToken} on the confirmation page.\nYou can use this link directly: ${confirmLink}.\n\n\nIf you did not make this request, kindly ignore this.\n\nThank you\n\nThe IzzyLeads Team`,
      html: `Hi <strong>${name}</strong>,<br/><br/>You have requested to reset your password.<br/>Use the code  <strong>${resetPasswordToken}</strong> on the confirmation page.<br/><a href="${confirmLink}" target="_blank">You can use this link directly</a>.<br/><br/><strong>If you did not make this request, kindly ignore this.</strong><br/><br/>Thank you<br/><br/><em>The IzzyLeads Team<em/>`,
    };

    return this.sendMail(data);
  }
  sendMail(data) {
    this.mailTransport.sendMail(data);
    return { delivered: 1, status: 'ok' };
  }
  StartEmailSequence(sequence, user) {
    if (!user.email) {
      throw new Error('No email provided');
    }
    // @TODO Add example of an email sequence implementation
    // Something like
    // 1 - Send first email of the sequence
    // 2 - Save the step of the sequence in database
    // 3 - Schedule job for second email in 1-3 days or whatever
    // Every sequence can have its own behavior so maybe
    // the pattern Chain of Responsibility can help here.
    return { delivered: 1, status: 'ok' };
  }
}
