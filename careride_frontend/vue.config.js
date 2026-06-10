module.exports = {
	css: {
		loaderOptions: {
			sass: {
				sassOptions: {
					silenceDeprecations: ['legacy-js-api', 'import', 'slash-div', 'abs-percent'],
				},
			},
			scss: {
				sassOptions: {
					silenceDeprecations: ['legacy-js-api', 'import', 'slash-div', 'abs-percent'],
				},
			},
		},
	},
};
