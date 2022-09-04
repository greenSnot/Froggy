const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin');

const entries = {
  index: './index.tsx',
};
module.exports = (env) => ({
  entry: entries,
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-env",
              "@babel/preset-react",
              "@babel/preset-typescript",
            ],
          },
        },
      },
      {
        test: /\.less$/,
        use: [
          { loader: "style-loader" },
          {
            loader: "typings-for-css-modules-loader",
            query: {
              modules: true,
              namedExport: true,
              localIdentName: "[name]_[local]_[hash:base64:5]",
            },
          },
          { loader: "less-loader" },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    alias: {
      froggy: path.resolve(__dirname, "../froggy/index.ts"),
    },
  },
  plugins: [
    ...Object.keys(entries).map(
      (i) =>
        new HtmlWebpackPlugin({
          filename: `./${i}.html`,
          chunks: [i],
          template: `./${i}.html`,
        })
    ),
  ],
});