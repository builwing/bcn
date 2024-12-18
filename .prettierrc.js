module.exports = {
    printWidth: 80,
    tabWidth: 2,
    useTabs: false,
    singleQuote: true,
    semi: true,
    trailingComma: 'all',
    bracketSpacing: true,
    arrowParens: 'always',
    overrides: [
        {
            files: '*.vue',
            options: {
                // Vueファイルのフォーマット設定
                // 例:
                parser: 'vue',
                // indentScriptAndStyle: true,
            }
        }
    ]
};