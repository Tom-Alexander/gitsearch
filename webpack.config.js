var webpack = require('webpack');
var env = process.env.WEBPACK_ENV;
var isDist = env === 'dist';
var Uglify = webpack.optimize.UglifyJsPlugin;

module.exports = {
  entry: './client.js',
  output: {
    filename: isDist ? 'client.min.js' : 'client.js',
    path: './dist'
  },
  plugins: env === 'dist' ? [
      new Uglify({minimize: true}),
      new webpack.IgnorePlugin(/node_modules/)
  ] : [
      new webpack.IgnorePlugin(/node_modules/)
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      }
    ]
  }
};
