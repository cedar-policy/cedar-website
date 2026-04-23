/* eslint-disable */
import * as path from 'path';
import { fileURLToPath } from 'url';
import 'webpack-dev-server';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import type { WebpackPluginInstance } from 'webpack';

// ESM-equivalent of the CommonJS __dirname (tsconfig target is now ES2020/ESNext).
const __dirname = path.dirname(fileURLToPath(import.meta.url));

type WebpackPlugins = Array<HtmlWebpackPlugin|WebpackPluginInstance>;

const config = (env: any, args: any) => {
    const production = args.mode === 'production';

    // --- Main app build config ---
    const main = {
        mode: production ? 'production' : 'development',
        devtool: production ? undefined : 'source-map',

        target: 'web',
        entry: {
            main: path.resolve(__dirname, 'src/index.tsx'),
        },
        output: {
            filename: '[name].js',
            path: path.resolve(__dirname, 'build', 'public'),
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        },
        experiments: { asyncWebAssembly: true, topLevelAwait: true },
        plugins: [
            new MiniCssExtractPlugin({
                filename: '[name].css',
                chunkFilename: '[name].css',
                ignoreOrder: true,
            }),

            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: path.resolve(__dirname, 'static'),
                        to: path.resolve(__dirname, 'build', 'public'),
                    },
                ],
            }),
        ] as WebpackPlugins,
        module: {
            rules: [
                {
                    test: /\.md$/,
                    use: 'raw-loader'
                },
                {
                    test: /\.tsx?|\.jsx?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: { plugins: production ? [] : [] },
                    },
                },
                {
                    test: /\.scss$/,
                    use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
                },
                {
                    test: /\.css$/,
                    use: [MiniCssExtractPlugin.loader, 'css-loader'],
                },
                {
                    test: /\.(png|svg|jpg|jpeg|gif)$/i,
                    loader: 'file-loader',
                },
                {
                    test: /\.(ttf|woff2?)$/,
                    type: 'asset/resource',
                },
                {
                    test: /\.wasm$/,
                    type: 'webassembly/async',
                },
                {
                    type: 'javascript/auto',
                    test: /src\/translations\/.*\.json$/i,
                    loader: 'file-loader',
                    options: {
                        name: 'translations.[name].[ext]',
                    },
                },
            ],
        },
        optimization: {
            splitChunks: {
                cacheGroups: {
                    vendors: {
                        test: /\/node_modules\//,
                        name: 'vendors',
                        chunks: 'all',
                    },
                },
            },
        },

        devServer: {
            static: { directory: path.resolve(__dirname, 'build', 'public') },
            webSocketServer: 'ws',
            hot: true,
            allowedHosts: 'all',
            client: { webSocketURL: 'ws://127.0.0.1:3000/ws', overlay: { errors: true, warnings: false } },
            port: 3000,
            host: '127.0.0.1',
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            proxy: [
                {
                    context: ['**'],
                    bypass: (req: any, res: any) => {
                        if (typeof req?.headers?.accept === 'string' && req.headers.accept.indexOf('html') !== -1) {
                            return '/index.html';
                        }
                        const url = req.originalUrl || '';
                        if (url.endsWith('.css') || url.endsWith('.js') || url.endsWith('.woff2')) {
                            // these are root-level scripts and we should return those, getting rid of any
                            // client-side routes
                            return url.split('/').slice(-1)[0];
                        }
                    },
                },
            ],
        },
    };
    /*
  * Serve the getting start html page when visiting the local dev server
  */
    if (!production) {
        main.plugins = [
            new HtmlWebpackPlugin({
                template: path.resolve(__dirname, 'static', 'index.html'),
                publicPath: '/',
                inject: false,
                showErrors: true,
                minify: false,
            }),
            ...main.plugins,
        ];
    }
    return main;
};

export default config;
