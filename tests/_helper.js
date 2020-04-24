module.exports = {
    countWord
};

/**
 * Counts how many times a word is repeated
 * @param {String} paragraph
 * @return {number}
 */
function countWord(word, paragraph) {
    const regex = new RegExp(`\<${word}[ | \/?\>]|\<\/${word}?\>`);
    return (paragraph.split(regex).length - 1);

}

