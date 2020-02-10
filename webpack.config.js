const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const dotenv = require('dotenv')
const webpackMerge = require('webpack-merge')
const nodeExternals = require('webpack-node-externals')
const CopyPlugin = require('copy-webpack-plugin')

const getEnv = env => {
  const currentPath = path.join(__dirname)
  const basePath = currentPath + '/.env'
  const envPath = basePath + '.' + env.ENVIRONMENT
  const finalPath = fs.existsSync(envPath) ? envPath : basePath
  const fileEnv = dotenv.config({ path: finalPath }).parsed
  const envKeys = Object.keys(fileEnv).reduce((prev, next) => {
    prev[`process.env.${next}`] = JSON.stringify(fileEnv[next])
    return prev
  }, {})

  return envKeys
}

const sharedConfig = (env, platform) => {
  const config = {
    entry: `./src/${platform}/index.tsx`,
    mode: env.ENVIRONMENT ? 'production' : 'development',
    output: {
      filename: `${platform}.js`,
      path: path.resolve(__dirname, 'build'),
    },
    resolve: {
      modules: [path.resolve(__dirname, 'src'), 'node_modules'],
      extensions: ['.tsx', '.ts', '.js'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    plugins: [
      new CopyPlugin([{ from: path.resolve(__dirname, 'views'), to: 'views' }]),
      new webpack.DefinePlugin(getEnv(env)),
    ],
  }

  if (!env.prod) {
    config.devServer = {
      writeToDisk: true,
    }
  }

  return config
}

const sharedClientConfig = {
  module: {
    rules: [
      {
        test: /\.(js|tsx?)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          envName: 'client',
        },
      },
    ],
  },
}

const mobileConfig = (env = {}) => webpackMerge(sharedConfig(env, 'mobile'), sharedClientConfig)

const desktopConfig = (env = {}) => webpackMerge(sharedConfig(env, 'desktop'), sharedClientConfig)

const serverConfig = (env = {}) =>
  webpackMerge(sharedConfig(env, 'server'), {
    target: 'node',
    node: {
      __dirname: false,
    },
    devtool: false,
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          options: {
            envName: 'server',
          },
        },
      ],
    },
    externals: [nodeExternals({ importType: 'commonjs' })],
  })

module.exports = [mobileConfig, desktopConfig, serverConfig]
