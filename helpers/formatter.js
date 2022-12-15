const phoneNumberFormatter = function(number) {
  // 1. Menghilangkan karakter selain angka
  let formatted = number + '@c.us';

  // // 2. Menghilangkan angka 0 di depan (prefix)
  // //    Kemudian diganti dengan 62
  // if (formatted.startsWith('0')) {
  //   formatted = '92' + formatted.substr(1);
  // }

  // if (!formatted.endsWith('@c.us')) {
  //   formatted += '@c.us';
  // }

  return formatted;
}

module.exports = {
  phoneNumberFormatter
}