# query-builder
🔍️ A query builder for Wikidata SPARQL queries

## Test system

You can test this query builder in https://query-builder-test.toolforge.org

## Development

The following examples use `docker` and `docker-compose` to ease creating a level playing field for development but they are not essential to this project.

### Installation

```sh
# Set up and modify the environment variables according to your preferences
cp .env.example .env

# ensure the node user uses your user id, so you own created files
docker-compose build --build-arg UID=$(id -u) --build-arg GID=$(id -g) node

# install npm dependencies
docker-compose run --rm node npm i
```

### Running npm

```sh
docker-compose run --rm node npm
```

### Starting the development server

```sh
docker-compose up dev
```

### Running browser tests


#### To run Cypress browser tests locally:

Run: `docker-compose run --rm node npm run test:cy`

Note: If you wish to run cypress in the browser (and not in a headless mode) for debugging purposes, run `npm run cypress:interactive` locally (no docker).
If cypress is not starting please double check that the port in the command is the same as the one your dev server is running on.

## Deploying to production

After merge, trigger a build job in [Wikimedia CI](https://integration.wikimedia.org/ci/job/wikidata-query-builder-build/) and once the patch in [deploy repo](https://gerrit.wikimedia.org/r/q/project:wikidata%252Fquery-builder%252Fdeploy) is created, force merge it.
It will by [synced to production](https://gerrit.wikimedia.org/r/plugins/gitiles/operations/puppet/+/9d52148c28c3391d32f0b83c8762f70e8af1ad15/modules/profile/templates/wdqs/httpd-query.wikidata.org.erb#24) by the puppet agent which is set to run every 30 minutes.
