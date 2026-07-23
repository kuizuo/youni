module.exports = function babelConfig(api) {
	const isTest = api.env("test");

	return {
		plugins: isTest ? ["dynamic-import-node"] : [],
		presets: ["babel-preset-expo"],
	};
};
