import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import routes from '../api';
import config from 'config';
import { isCelebrate, Segments } from 'celebrate';
import { Container } from 'typedi';

export default ({ app }) => {
  /**
   * Health Check endpoints
   * @TODO Explain why they are here
   */
  app.get('/status', (req, res) => {
    res.status(200).end();
  });
  app.head('/status', (req, res) => {
    res.status(200).end();
  });

  // Useful if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
  // It shows the real origin IP in the heroku or Cloudwatch logs
  app.enable('trust proxy');

  // The magic package that prevents frontend developers going nuts
  // Alternate description:
  // Enable Cross Origin Resource Sharing to all origins by default
  app.use(cors());

  // Some sauce that always add since 2014
  // "Lets you use HTTP verbs such as PUT or DELETE in places where the client doesn't support it."
  // Maybe not needed anymore ?
  app.use(require('method-override')());

  // Middleware that transforms the raw string of req.body into json
  app.use(bodyParser.json());

  app.use(async function(req, res, next) {
    const roleModel = Container.get('roleModel');

    // Load all the roles
    const roleRecords = await roleModel.find({}).exec();
    const roles = {};
    // Map the roles to get their _id and name
    roleRecords.map(
      ({ _id, name }) => (roles[name.toString()] = _id.toString()),
    );
    req.supportedRoles = roles;
    next();
  });

  /**
   *  Populate paginate data
   *
   * We only want to ensure that limit and skip amount are not out of the range that our API can work with
   *
   * */
  app.use(async function(req, res, next) {
    const { limit, skip } = req.query;
    const paginateConfig = config.get('paginateConfig');
    let _limit = parseInt(limit || paginateConfig.limit);
    let _skip = parseInt(skip || 0);

    _limit = _limit <= paginateConfig.limit ? _limit : paginateConfig.limit;
    _skip = _skip <= paginateConfig.skip ? _skip : paginateConfig.skip;

    req.query.limit = _limit;
    req.query.skip = _skip;
    next();
  });

  // Load API routes
  app.use(config.get('apiPrefix'), routes());

  /// catch 404 and forward to error handler
  app.use((req, res, next) => {
    const err = new Error('Not Found');
    err['status'] = 404;
    next(err);
  });

  /// error handlers
  app.use((err, req, res, next) => {
    /**
     * Handle 401 thrown by express-jwt library
     */
    if (isCelebrate(err)) {
      return res
        .status(err.status || err.meta.source === Segments.BODY ? 422 : 422)
        .send({ message: err.message })
        .end();
    }
    return next(err);
  });
  app.use((err, req, res, next) => {
    /**
     * Handle 401 thrown by express-jwt library
     */
    if (err.name === 'UnauthorizedError') {
      return res
        .status(err.status)
        .send({ message: err.message })
        .end();
    }
    return next(err);
  });
  app.use((err, req, res, next) => {
    /**
     * Handle Conflicts thrown by express-jwt library
     */
    if (err.name === 'MongoError') {
      return res.status(err.code === 11000 ? 409 : 500).json({
        errors: {
          message: err.errmsg || 'Conflicting fields',
          stack: err.stack || undefined,
        },
      });
    }
    return next(err);
  });
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
      errors: {
        message: err.message || 'Server Error',
        stack: err.stack || undefined,
      },
    });
  });
};
