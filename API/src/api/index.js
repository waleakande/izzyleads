import { Router } from 'express';
import auth from './routes/auth';
import roles from './routes/roles';
import categories from './routes/categories';
// import user from './routes/user';

// guaranteed to get dependencies
export default () => {
  const app = Router();
  auth(app);
  roles(app);
  categories(app);

  return app;
};
