import { config } from 'dotenv';

if ((process.env.NODE_ENV ?? 'development') !== 'production') {
  config();
}
