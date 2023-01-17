# Simple organization API

This API implements:

- authentication / authorization logic (JWT)
- simple organization logic (relation between boss and subordinates)

## Local run

Start docker:

```sh
docker-compose up -d
```

Install packages:

```sh
yarn install
```

Migrate database:

```sh
yarn migrate:dev
```

Start servicer:

```sh
yarn start
```

## Run tests

Start docker:

```sh
docker-compose up -d
```

Install packages

```sh
yarn install
```

Start tests:

```sh
yarn test
```
