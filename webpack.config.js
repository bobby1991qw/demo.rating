var path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'build'),
        publicPath: '/build/'
    },
    module: {
        rules: [
            {test: /\.js$/, exclude: path.resolve(__dirname, 'node_modules'), use: 'babel-loader'}
        ]
    },
    devServer: {
        port: 3000
    }
};