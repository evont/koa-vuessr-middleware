const colorList = {
  bold:'0;1',
  italic:'0;3',
  underline:'0;4',
  inverse:'0;7',
  strikethrough:'0;9',

  white:'39;37',
  grey:'39;90',
  black:'39;0',
  blue:'39;34',
  cyan:'39;36',
  green:'39;32',
  magenta:'39;35',
  red:'39;31',
  yellow:'39;33',
};

module.exports = class Log {
  static log(str, type = '') {
    console.log(`\x1b[${colorList[type] || '0,0'};1m${str}\x1b[0;0;0m`)
  }
  static success(str) {
    Log.log(str, 'green')
  }
  static error(str) {
    Log.log(str, 'red')
  }
  static warn(str) {
    Log.log(str, 'yellow')
  }
}