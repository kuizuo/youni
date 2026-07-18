const GOOGLE_SIGN_IN_PLUGIN = "@react-native-google-signin/google-signin";
const { version } = require("./package.json");

function getGoogleIosUrlScheme() {
	if (process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME) {
		return process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME;
	}

	const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
	if (iosClientId?.endsWith(".apps.googleusercontent.com")) {
		return `com.googleusercontent.apps.${iosClientId.replace(
			".apps.googleusercontent.com",
			"",
		)}`;
	}

	return "com.googleusercontent.apps.REPLACE_WITH_IOS_CLIENT_ID";
}

module.exports = ({ config }) => {
	const plugins = config.plugins ?? [];
	const hasGoogleSignInPlugin = plugins.some((plugin) =>
		Array.isArray(plugin)
			? plugin[0] === GOOGLE_SIGN_IN_PLUGIN
			: plugin === GOOGLE_SIGN_IN_PLUGIN,
	);

	return {
		...config,
		version,
		plugins: hasGoogleSignInPlugin
			? plugins
			: [
					...plugins,
					[
						GOOGLE_SIGN_IN_PLUGIN,
						{
							iosUrlScheme: getGoogleIosUrlScheme(),
						},
					],
				],
	};
};
