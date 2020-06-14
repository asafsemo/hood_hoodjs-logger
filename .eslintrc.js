module.exports = {
	env: {
		es6: true,
		node: true
	},
	extends: ['eslint:recommended', 'airbnb-base'],
	ignorePatterns: ['**/test/*.js'],
	rules: {
		semi: ['error', 'always'],
		'no-tabs': 0,
		indent: ['error', 'tab', {
			"CallExpression": { "arguments": "off" },
			"MemberExpression": "off"
		}],
		quotes: [
			'error', 'single', {
				avoidEscape: true,
				allowTemplateLiterals: false
			}
		],
		'func-names': ['error', 'as-needed'],
		'no-underscore-dangle': [
			'error', {
				allowAfterThis: true,
				enforceInMethodNames: true,
			}
		],
		'space-before-function-paren': ['error', {
			anonymous: 'never',
			named: 'never',
			asyncArrow: 'always'
		}],
		'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
		'quote-props': ['error', 'as-needed'],
		'arrow-body-style': ['error', 'always'],
		'key-spacing': [
			'error', {
				align: 'colon'
			}
		],
		'no-use-before-define': ['error', 'nofunc'],
		'no-mixed-spaces-and-tabs': ['error'],
		'object-curly-newline': [
			'error', {
				consistent: true
			}
		],
		'no-multi-spaces': [
			'error', {
				exceptions: {
					VariableDeclarator: false,
					AssignmentExpression: false
				}
			}
		],
		'linebreak-style': ["error", "unix"],
		'max-len': [
			'error', 100, 2,
			{
				//         ignoreUrls: true,
				ignoreComments: true,
				//         ignoreRegExpLiterals: true,
				ignoreStrings: true,
				ignoreTemplateLiterals: true
			}
		],
		"comma-dangle": ['error', {
			arrays: "only-multiline",
			objects: "only-multiline",
		}],

        /*

			"error",
			{
				imports: "only-multiline",
				exports: "only-multiline",
				functions: "only-multiline"
			}
        ],
        
        "brace-style": ["error", "stroustrup"],

        */
	}
};
