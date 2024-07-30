let path = require('path');


let webpackConfig = {
    mode: 'production',
    entry: {
        sparkline: './src/visualizations/sparkline.js',
        sparkline_with_single_value: './src/visualizations/sparkline_with_single_value.js',
    },
    output: {
        filename: '[name].js',
        path: path.join(__dirname, 'dist'),
        library: '[name]',
        libraryTarget: 'umd'
    },
    resolve: {
        extensions: ['.ts', '.js', '.scss', '.css']
    },
    module: {
        rules: [
            { test: /\.ts$/, loader: 'ts-loader' },
            { test: /\.css$/, loader: 'css-loader' },
           
        ],
    },
    devServer: {
        host: 'localhost',
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
        },
        allowedHosts: ['.looker.com'],
        compress: true,
        port: 3443,
        server: 'https'
    },
    devtool: 'eval',
    watch: true
};

module.exports = webpackConfig;
