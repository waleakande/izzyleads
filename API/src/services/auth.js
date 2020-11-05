import { Container, Service } from 'typedi';
import jwt from 'jsonwebtoken';
import config from 'config';
import argon2 from 'argon2';
import { randomBytes } from 'crypto';
import MailerInstance from './mailer';
import user from '../models/user';

@Service()
export default class AuthService {
  constructor() {
    this.mailer = Container.get(MailerInstance);
    this.userModel = Container.get('userModel');
    this.logger = Container.get('logger');
    this.eventDispatcher = Container.get('schedulers');
  }

  generateRandomBytes(length = 10) {
    return randomBytes(length).toString('hex');
  }

  async SignUp(userInputDTO) {
    try {
      const salt = this.generateSalt();
      this.logger.silly('Hashing password');
      const hashedPassword = await argon2.hash(userInputDTO.password, { salt });
      this.logger.silly('Creating user db record');
      const userRecord = await this.userModel.create({
        ...userInputDTO,
        salt: salt.toString('hex'),
        password: hashedPassword,
        emailVerificationToken: this.generateRandomBytes(),
        emailVerified: userInputDTO.superAdmin ? true : false,
      });
      this.logger.silly('Generating JWT');
      const token = this.generateToken(userRecord);

      if (!userRecord) {
        throw new Error('User cannot be created');
      }
      this.logger.silly('Sending welcome email to %s', userRecord.email);
      const { delivered } = await this.mailer.SendWelcomeEmail(userRecord);
      delivered &&
        this.logger.silly('Welcome email sent to %s', userRecord.email);
      this.eventDispatcher.userOnUserSignUp({ user: userRecord });

      /**
       * @TODO This is not the best way to deal with this
       * There should exist a 'Mapper' layer
       * that transforms data from layer to layer
       * but that's too over-engineering for now
       */
      const user = userRecord.toObject();
      // const caslUtils = Container.get('caslUtils');

      // const modifiedUser = caslUtils.fieldsPicker(this.userModel, user, 'read');
      return { user: user, token };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async SendForgotEmail(email) {
    const userRecord = await this.userModel.findOne({ email });
    if (!userRecord) {
      const err = new Error('Email is not registered');
      err['status'] = 403;
      throw err;
    }

    const resetToken = this.generateRandomBytes();
    const user = await this.userModel.findOneAndUpdate(
      { email },
      {
        $set: {
          resetPasswordToken: resetToken,
        },
      },
      { new: true, useFindAndModify: false },
    );
    const { delivered } = await this.mailer.SendForgotEmail(user);
    delivered && this.logger.silly('Passoword reset email sent to %s', email);
    return { status: 'Password reset email sent' };
  }

  generateSalt(len = 32) {
    return randomBytes(len);
  }

  async ResetPassword({ email, token, password }) {
    const userRecord = await this.userModel.findOne({ email });
    if (!userRecord) {
      const err = new Error('Email is not registered');
      err['status'] = 403;
      throw err;
    }

    if (userRecord.resetPasswordToken != token) {
      const err = new Error('Token is not valid');
      err['status'] = 403;
      throw err;
    }

    const salt = this.generateSalt(31);
    const hashedPassword = await argon2.hash(password, { salt });
    await this.userModel.findOneAndUpdate(
      { email },
      {
        $set: {
          resetPasswordToken: undefined,
          password: hashedPassword,
        },
      },
      { new: true, useFindAndModify: false },
    );
    return { status: 'Password reset successful.' };
  }

  async SignIn(email, password) {
    const userRecord = await this.userModel.findOne({ email });
    if (!userRecord) {
      const err = new Error('Email is not registered');
      err['status'] = 403;
      throw err;
    }

    if (!userRecord.emailVerified) {
      const err = new Error('Email is not verified');
      err['status'] = 403;
      throw err;
    }
    /**
     * We use verify from argon2 to prevent 'timing based' attacks
     */
    this.logger.silly('Checking password');
    const validPassword = await argon2.verify(userRecord.password, password);
    if (validPassword) {
      this.logger.silly('Password is valid!');
      this.logger.silly('Generating JWT');
      const token = this.generateToken(userRecord);

      const user = userRecord.toObject();
      Reflect.deleteProperty(user, 'password');
      Reflect.deleteProperty(user, 'salt');
      /**
       * Easy as pie, you don't need passport.js anymore :)
       */
      return { user, token };
    }

    throw new Error('Invalid Password');
  }

  async ConfirmRegistration(email, emailVerificationToken) {
    const userRecord = await this.userModel.findOne({ email });
    if (!userRecord) {
      throw new Error('User not registered');
    }

    if (userRecord.emailVerified) {
      const err = new Error('Account is verified');
      err['status'] = 403;
      throw err;
    }
    if (userRecord.emailVerificationToken != emailVerificationToken) {
      const err = new Error('Token is not valid');
      err['status'] = 403;
      throw err;
    }
    /**
     * We use verify from argon2 to prevent 'timing based' attacks
     */
    this.logger.silly('Verifying account %s', email);
    await this.userModel.findOneAndUpdate(
      { email },
      {
        $set: {
          emailVerificationToken: undefined,
          emailVerified: true,
          emailVerifiedAt: Date.now(),
        },
      },
    );

    return { status: 'Account verified' };
  }

  async ResendConfirmEmail(email) {
    const userRecord = await this.userModel.findOne({ email });
    if (!userRecord) {
      throw new Error('User not registered');
    }

    if (userRecord.emailVerified) {
      const err = new Error('Account is verified');
      err['status'] = 403;
      throw err;
    }

    const emailVerificationToken = this.generateRandomBytes();

    /**
     * We use verify from argon2 to prevent 'timing based' attacks
     */
    this.logger.silly('Resending verification email: %s', email);
    const user = await this.userModel.findOneAndUpdate(
      { email },
      {
        $set: {
          emailVerificationToken: emailVerificationToken,
          emailVerified: false,
        },
      },
      { new: true, useFindAndModify: false },
    );

    const { delivered } = await this.mailer.ResendConfirmEmail(user);
    delivered &&
      this.logger.silly('Resent confirm email sent to %s', user.email);

    return { status: `Resent confirm email to ${email}` };
  }

  generateToken(user) {
    const today = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() + 60);

    /**
     * A JWT means JSON Web Token, so basically it's a json that is _hashed_ into a string
     * The cool thing is that you can add custom properties a.k.a metadata
     * Here we are adding the userId, role and name
     * Beware that the metadata is public and can be decoded without _the secret_
     * but the client cannot craft a JWT to fake a userId
     * because it doesn't have _the secret_ to sign it
     * more information here: https://softwareontheroad.com/you-dont-need-passport
     */
    this.logger.silly(`Sign JWT for userId: ${user._id}`);
    return jwt.sign(
      {
        _id: user._id, // We are gonna use this in the middleware 'isAuth'
        role: user.role,
        name: user.name,
        exp: exp.getTime() / 1000,
      },
      config.get('jwtSecret'),
    );
  }
}
