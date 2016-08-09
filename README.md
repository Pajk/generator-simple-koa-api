# Simple Koa API Yeoman Generator

```bash
npm install -g yo
npm install -g generator-simple-koa-api
mkdir myapi; cd myapi
yo simple-koa-api
# edit .env, .env-test, package.json if needed
npm install
node db-migrate.js # migrates the database to the last version
npm test # runs test suite using db configured in .env-test
npm start # runs the api, conntects to db from .env, ctrl+c to exit
npm run db-new your new db migration title # generate new database migration files
# start hacking!
```
