// import plugins
const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const HtmlWebpackPlugin = require('html-webpack-plugin');

const pages = require('./pug/config');

/**
 * Base webpack configuration
 *
 * @param env -> env parameters
 * @param argv -> CLI arguments, 'argv.mode' is the current webpack mode (development | production)
 * @returns object
 */
module.exports = (env, argv) => {
    let isProduction = (argv.mode === 'production');

    let config = {
        // absolute path to the base directory
        context: path.resolve(__dirname, "src"),

        // entry files to compile (relative to the base dir)
        entry: [
            "./app.js",
            "./style.scss",
        ],

        // enable development source maps
        // * will be overwritten by 'source-maps' in production mode
        devtool: "inline-source-map",

        // live dev server root directory
        devServer: {
            contentBase: "dist"
        },

        // path to store compiled JS bundle
        output: {
            // bundle relative name
            filename: "js/spectre.js",
            // base build directory
            path: path.resolve(__dirname, "dist"),
            // path to build relative asset links
            publicPath: "../"
        },

        // plugins configurations
        plugins: [
            // save compiled SCSS into separated CSS file
            new MiniCssExtractPlugin({
                filename: "css/style.css"
            }),

            // image optimization
            new ImageminPlugin({
                // disable for dev builds
                disable: !isProduction,
                test: /\.(jpe?g|png|gif)$/i,
                pngquant: {quality: '70-85'},
                optipng: {optimizationLevel: 9}
            }),

            // compiles PUG templates
            ...pages.map((page) => {
                return new HtmlWebpackPlugin({
                    filename: `${page}.html`,
                    template: `../pug/pages/${page}.pug`,
                    inject: false,
                    minify: false,
                })
            }),
        ],

        // production mode optimization
        optimization: {
            minimizer: [
                // CSS optimizer (JS optimized by default)
                new OptimizeCSSAssetsPlugin(),
            ],
        },

        // custom loaders configuration
        module: {
            rules: [
                // pug loader
                {
                    test: /\.pug$/,
                    use: ['pug-loader'],
                },
                // styles loader
                {
                    test: /\.(sa|sc|c)ss$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        "css-loader",
                        "sass-loader"
                    ],
                },

                // images loader
                {
                    test: /\.(png|jpe?g|gif)$/,
                    loaders: [
                        {
                            loader: "file-loader",
                            options: {
                                name: "img/[name].[ext]"
                            }
                        },
                        {
                            loader: 'image-webpack-loader',
                            options: {
                                disable: !isProduction,
                                mozjpeg: {
                                    progressive: true,
                                    quality: 65
                                },
                                pngquant: {
                                    quality: '65-90',
                                    speed: 4
                                },
                                optipng: {enabled: false},
                                gifsicle: {interlaced: false},
                                webp: {quality: 75}
                            }
                        },
                    ],
                },

                // fonts loader
                {
                    test: /\.(woff|woff2|eot|ttf|otf)$/,
                    use: [
                        {
                            loader: "file-loader",
                            options: {
                                name: "fonts/[name].[ext]"
                            }
                        },
                    ],
                },

                // svg inline 'data:image' loader
                {
                    test: /\.svg$/,
                    loader: "svg-url-loader"
                },
            ]
        },
    };

    // PRODUCTION ONLY configuration
    if (isProduction) {
        config.plugins.push(
            // clean 'dist' directory
            new CleanWebpackPlugin()
        );
    }

    return config;
};
