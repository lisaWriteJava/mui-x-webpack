import "core-js/stable";
import "regenerator-runtime/runtime";
const Path = require("path");
const StringReplacePlugin = require("string-replace-webpack-plugin");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");

const Constants = {
	bundleFileName: "arcademap.js",
	publicPath: "/arcademap/",
	appName: "ARCADEMAP",
	appIcon: "fa-cogs",
	ourOrgName: "ORG NAME HERE",

	// Classification Banner
	// Color is: "u-fouo", "conf", "secret" or "top-secret"
	classificationColor: "u-fouo",
	classificationText: "UNCLASSIFIED//FOUO",
	dynamicClassification: true,
	contentSteward: "content stweard here",
	contentStewardEmail: "content email stweard here",
	pagePublisher: "page publisher here",
	pagePublisherEmail: "page publisher email here",
	lastReviewed: "last reviewed here"
};

const tokens = [
	{
		pattern: /@ourOrgName/gi,
		replacement: (match, p1, offset, string) => Constants.ourOrgName
	},
	{
		pattern: /@appName/gi,
		replacement: (match, p1, offset, string) => Constants.appName
	},
	{
		pattern: /@bundleFileName/gi,
		replacement: (match, p1, offset, string) => Constants.bundleFileName
	},
	{
		pattern: /@publicPath/gi,
		replacement: (match, p1, offset, string) => Constants.publicPath
	},
	{
		pattern: /@pagePublisherEmail/gi,
		replacement: (match, p1, offset, string) => Constants.pagePublisherEmail
	},
	{
		pattern: /@appIcon/gi,
		replacement: (match, p1, offset, string) => Constants.appIcon
	}
];

const generateDate = () => {
	const d = new Date();
	return `${d.toDateString()} ${d.toTimeString().substr(0, 12)}`;
};

const env = process.env.NODE_ENV;
const prod = env == "production";
const app = process.env.APP;
const git = process.env.GIT_REPO;
console.log(`Environment: ${prod ? "production" : "development"}`);

const main = Path.resolve(__dirname, "src/index.js");
let dist = Path.join(`${__dirname}/dist`);
let appRouterAlias = Path.resolve(__dirname, "main/components");
console.log("************ appRouterAlias: ", appRouterAlias);
if (app) {
	dist = Path.resolve(__dirname, `dist/${app}`);

	appRouterAlias = Path.resolve(__dirname, `${git}/main/components`);
	console.log("************ ap router: ", appRouterAlias);
}

const config = {
	devtool: "source-map",
	mode: prod ? "production" : "development",
	performance: {
		hints: false,
		maxEntrypointSize: 512000,
		maxAssetSize: 512000
	},
	entry: {
		main: Path.resolve(__dirname, "src/index.js")
	},
	output: {
		path: dist,
		publicPath: app ? `/${app}` : "/arcademap",
		filename: prod ? "[name].[fullhash].js" : "[name].js",
		clean: true
	},
	resolve: {
		modules: [__dirname, "src", "main", "node_modules"],
		extensions: ["*", ".js", ".jsx", ".tsx", ".json"],
		alias: {
			app: Path.resolve(__dirname, "main/components"),
			appconstants: Path.resolve(__dirname, "main/constants"),
			apphelpers: Path.resolve(__dirname, "main/helpers"),
			appactions: Path.resolve(__dirname, "main/actions"),

			loadedapp: appRouterAlias,

			papabear: Path.resolve(__dirname, "papabear-ui/src/components"),
			papabearconstants: Path.resolve(__dirname, "papabear-ui/src/constants"),
			papabearactions: Path.resolve(__dirname, "papabear-ui/src/actions"),
			papabearhelpers: Path.resolve(__dirname, "papabear-ui/src/helpers"),
			papabearpages: Path.resolve(__dirname, "papabear-ui/src/pages"),

			gamemaster: Path.resolve(__dirname, "gamemaster/src/components"),
			gamemasterconstants: Path.resolve(__dirname, "gamemaster/src/constants")
		}
	},
	plugins: [
		new HtmlWebpackPlugin({
			inject: false,
			filename: "index.html",
			template: Path.resolve(__dirname, "src/index.html"),
			showErrors: true,
			title: "Arcademap"
		}),
		new FaviconsWebpackPlugin({
			logo: "./favicon.png",
			mode: "auto",
			publicPath: "/arcademap",
			prefix: "assets/"
		}),
		new webpack.ProvidePlugin({
			process: "process/browser"
		}),
		new StringReplacePlugin(),
		new webpack.DefinePlugin({
			"process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
			__BUILDDATE__: JSON.stringify(generateDate())
		})
	],
	module: {
		rules: [
			{
				test: /\.css$/i,
				use: ["style-loader", "css-loader"]
			},
			{
				test: /\.less$/i,
				use: [
					// compiles Less to CSS
					"style-loader",
					"css-loader",
					"less-loader"
				]
			},
			{
				test: /\.(js|jsx|tsx)$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader"
				}
			},
			{
				test: /\.(js|jsx|tsx?)$/,
				exclude: /node_modules/,
				use: StringReplacePlugin.replace({
					replacements: tokens
				})
			},
			{
				test: /\.(png|svg|jpg|jpeg|gif)$/i,
				type: "asset/resource"
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/i,
				type: "asset/resource"
			},
			{
				test: /\.s[ac]ss$/i,
				use: [
					// Creates `style` nodes from JS strings
					"style-loader",
					// Translates CSS into CommonJS
					"css-loader",
					// Compiles Sass to CSS
					"sass-loader"
				]
			},
			{
				test: /\.mjs$/,
				include: /node_modules/,
				type: "javascript/auto"
			},
			{
				test: /\.m?js/,
				resolve: {
					fullySpecified: false
				}
			}
		]
	}
};

if (!prod) {
	// ------------------------------------------------------ DEV - ALL ----------------------------------------------------------
	config.devServer = {
		allowedHosts: "all",
		historyApiFallback: true,
		host: "0.0.0.0",
		port: 3001,
		static: {
			directory: Path.join(__dirname, "./dist"),
			watch: true
		},
		devMiddleware: {
			publicPath: "/arcademap",
			stats: {
				colors: true
			}
		}
	};
}

export default config;
