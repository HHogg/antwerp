module.exports = {
  'plugins': [
    require('autoprefixer'),
    require('postcss-preset-env')({
      'stage': 3,
      'features': {
        'custom-properties': false,
        'nesting-rules': true,
      },
    }),
  ],
};
