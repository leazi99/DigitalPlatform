// Run it with `npm run dev:api`, or `npm start` after `npm run build` to serve
// the built site and the API from one process on one port.

import { config } from "./env.js";
import { app } from "./app.js";

app.listen(config.port, () => {
  console.log(`\n  Digital World API — http://localhost:${config.port}`);
  console.log(`  database: ${config.dbFile}`);
  console.log("");
});
