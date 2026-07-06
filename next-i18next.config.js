const path = require('path')

module.exports = {
  i18n: {
    defaultLocale: 'tr',
    locales: ['tr', 'pl', 'en'],
    localeDetection: true,
  },
  localePath: path.resolve('./public/locales'),
  reloadOnPrerender: process.env.NODE_ENV === 'development',
}
