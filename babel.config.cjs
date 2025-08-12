module.exports = function (api) {
	const isTest = api.env('test');
	// In Jest, transpile to current Node to ensure compatibility with Jest runtime
	if (isTest) {
		return {
			presets: [[
				'@babel/preset-env',
				{ targets: { node: 'current' }, modules: false }
			]]
		};
	}
	return {
		presets: [[
			'@babel/preset-env',
			{ targets: { node: 'current' }, modules: false }
		]]
	};
};
