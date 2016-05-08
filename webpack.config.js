const path = require('path')

module.exports = {
  entry: './example/src/index.js',
  output: {
    path: path.join(__dirname, 'example'),
    filename: 'bundle.js'
  }
}
