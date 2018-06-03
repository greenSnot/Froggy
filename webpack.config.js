const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin');

const debug = process.env.NODE_ENV !== 'production';

const entries = {
  index: './example/index.tsx',
};
module.exports = {
  entry: entries,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.less$/,
        use: [
          {loader: "style-loader"},
        {
          loader: 'typings-for-css-modules-loader',
          query: {
            modules: true,
            namedExport: true,
            localIdentName: '[name]_[local]_[hash:base64:5]'
          }
        },
          {loader: "less-loader"},
        ]
      }
    ],
  },
  resolve: {
    extensions: [ '.ts', '.tsx', '.js' ]
  },
  plugins: [
    ...Object.keys(entries).map(i => (
      new HtmlWebpackPlugin({
        filename: `./${i}.html`,
        chunks: [i],
        template: `./example/${i}.html`,
      })
    )),
  ],
};