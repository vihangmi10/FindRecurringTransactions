const AMOUNT_DIFFERENCE_THRESHOLD = 0.2;

const amountDifference = (amount1, amount2)=> {
    console.log('AMOUNT 1 ---- ', amount1);
    console.log('AMOUNT 2 ----- ', amount2);
    let diff = Math.abs(amount1-amount2);
    let largeramount = amount1>amount2? amount1:amount2;
    let amountPercentage = diff/largeramount;
    return amountPercentage <= AMOUNT_DIFFERENCE_THRESHOLD;
};

export default amountDifference