function formatPhoneNumberForSpoken(number) {
    const formattedNumber = Array.from(number);
    for (const i of [3,5,8,11,14])
        formattedNumber.splice(i, 0, ' ');
    return formattedNumber.join('');
}

module.exports = {
    formatPhoneNumberForSpoken
};
