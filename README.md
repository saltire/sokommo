# Webpack-Node-TypeScript boilerplate app

This is a starting point for a vanilla TypeScript app running on a Node.js server.

Just clone the repo, edit the `name`, `description`, and other fields in `package.json` and
`package-lock.json`, and build from there.

## Features

- A starter single-page app with very basic layout and styles, a favicon,
  and an example asynchronous call to the server API.
- An Express.js server with a basic logger and error handler, and a place to put API routes.
- SCSS for styling.
- Webpack config files for development and production.
- Basic code splitting: vendor files and stylesheets are extracted to separate output files.
- Minified JS and CSS files when building for production.
- Environment variables can be declared in a `.env` file in the root folder during development.
- Code linting with ESLint. The configuration is based on Airbnb's style guide,
  with a few of my own preferred overrides.

## Scripts

- `npm run watch`: Start the development server.
  The front end app will reload, and the back end server will restart, when you make changes.
  View the app at `http://localhost:3001`, or change the port with the `PORT` environment variable.
- `npm run build`: Build for production.
  The front end will go into the `/dist` folder, and the back end into `/built`.
- `npm start`: Start the production server. You will need to run `npm run build` first.
- `npm run lint`: Check the code for style errors.
