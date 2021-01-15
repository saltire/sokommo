# React-Node-TypeScript boilerplate app

This is a starting point for a single-page React app running on a Node.js server,
with TypeScript on both ends.

Just clone the repo, edit the `name`, `description`, and other fields in `package.json` and
`package-lock.json`, and build from there.

## Features

- A starter single-page React app with very basic layout and styles, and a favicon.
- An Express.js server with a basic logger and error handler, and a place to put API routes.
- SCSS for styling.
- Webpack config files for development and production.
- Basic code splitting: vendor files and stylesheets are extracted to separate output files.
- Minified JS and CSS files when building for production.
- Hot reloading on the React app.
- Environment variables can be declared in a `.env` file in the root folder during development.
- Code linting with ESLint. The configuration is based on Airbnb's style guide,
  with a few of my own preferred overrides.

## Scripts

- `npm run watch`: Start the development server.
  The front end app will reload, and the back end server will restart, when you make changes.
  View the app at `http://localhost:8080`,
  or change the port with the `DEV_SERVER_PORT` environment variable.
- `npm run build`: Build for production.
  The front end will go into the `/dist` folder, and the back end into `/built`.
- `npm start`: Start the production server. You will need to run `npm run build` first.
- `npm run lint`: Check the code for style errors.
