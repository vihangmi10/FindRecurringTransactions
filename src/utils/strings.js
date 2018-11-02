import stringSimilarity from 'string-similarity';

const STRING_THRESHOLD = 0.6;

const similarString = (string1, string2) => {
    let percentageOfSimilarity = stringSimilarity.compareTwoStrings(string1,  string2);
    return percentageOfSimilarity >= STRING_THRESHOLD;
};

export default similarString