import 'reflect-metadata'; // We need this in order to use @Decorators
import config from './config';
import express from 'express';
import Logger from './loader/logger';

(async () => {
    const app = express();
    const loaders = await import('./loader');
    await loaders.default(app);
    app.listen(config.api.port, () => Logger.info(`Listening on port ${config.api.port}`));
})();