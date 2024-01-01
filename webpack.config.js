const path = require('path');

module.exports = {
    entry: './src/core/chess/main.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'src/core/chess/'),
    },
};
