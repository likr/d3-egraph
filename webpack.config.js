const path = require('path')
const webpack = require('webpack')

const options = {
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'example'),
          path.resolve(__dirname, 'node_modules/egraph')
        ],
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['latest']
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
    extensions: ['.js']
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
