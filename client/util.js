export const humanPhone = function humanPhoneFunc(phone) {
  return `${phone.substring(2, 5)}-${phone.substring(5, 8)}-${phone.substring(8, 12)}`;
};

export const humanIndex = function humanIndex(index) {
  return index + 1;
};
