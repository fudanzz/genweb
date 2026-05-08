import { createServer } from './server.azure.js';

const app = createServer();
app.listen(3000, () => console.log('Server has started!'));
