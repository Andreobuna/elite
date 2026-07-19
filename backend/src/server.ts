import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

const port = env.port;

app.listen(port, () => {
  logger.info(`Elite X Shop API listening on port ${port} [${env.nodeEnv}]`);
});
