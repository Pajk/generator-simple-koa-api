# API

## Scripts

### npm test

Cleans the db (by executing `db-test-reset.js`) and runs all tests. When env variable `FILE` is provided, it runs only one test file (recommended for development).

    FILE=test/profile.test.js npm test

### db-migrate

Migrate database to the latest migration. Connects to the DB configured in `.env`.

### npm run graph

Generates new `di_grap.jpg` from `di_graph.dot` file which is automatically generated on every start in development mode.

### db-rollback

Rollback one last migration. Connects to the DB configured in `.env`.

### db-test-reset

Rollback all migrations and then migrate the database to the latest version. Uses db configured in `.env-test`.

### npm run db-new your migration description

Generates UP and DOWN database migration files.

### npm run coverage

Same as `test` but will also generate tests code coverage and saves report in `/coverage` directory. Uses `istanbul` package.

### npm run lint

Checks the syntax.
