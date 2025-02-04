const path = require('path');

module.exports = {
  entry: './src/cookie.js',
  output: {
    filename: 'main.bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};