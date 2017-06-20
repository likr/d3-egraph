const path = require('path')
const webpack = require('webpack')

const options = {
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: [
          path.resolve(__dirname, 'src')
        ],
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['latest', 'react']
            }
          }
        ]
      }
    ]
  },
  entry: {
    bundle: './example/src/index'
  },
  output: {
    path: path.resolve(__dirname, 'example'),
    filename: '[name].js'
  },
  externals: {
  },
  plugins: [
  ],
  resolve: {
    extensions: ['.js', '.jsx']
  },
  devServer: {
    contentBase: path.join(__dirname, 'example'),
    historyApiFallback: true,
    port: 8080
  }
}

if (process.env.NODE_ENV === 'production') {
  options.plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    }
  }))
} else {
  Object.assign(options, {
    devtool: 'inline-source-map'
  })
}

module.exports = options
