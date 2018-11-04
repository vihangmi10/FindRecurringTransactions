import similarString from '../utils/strings';
import dateFunctions from '../utils/dates';
import amountFunctions from '../utils/amount';

let storingTransactionsMAP = new Map();
/**
 * Function match key will match the current transaction name with existing transactions in the object
 * It will return an object with transaction name and all its records
 * It will return an empty object if the name does not match
 * @param transactionName
 * @param storingTransactionsMAP
 * @returns {{name: *, records: *}}
 */
const matchKey = (transactionName, storingTransactionsMAP) => {
    // initialize this as empty
    let transactionObject = {};
    // If key is found
    if (storingTransactionsMAP.has(transactionName)) {
        //console.log('Key found....');
        let getTransaction = storingTransactionsMAP.get(transactionName);
        transactionObject = {
            'name': transactionName,
            'records': getTransaction
        };
        return transactionObject;
        // if the key is not exact match then look for a similar string. If string is similar then return object else return empty
    } else  {
        let keyIterator = storingTransactionsMAP.keys();
        keyIterator = [...keyIterator];
        keyIterator.forEach(key => {
            if (similarString(key, transactionName)){
               // console.log('SIMILAR....');
                let getTransaction = storingTransactionsMAP.get(key);
                console.log('--------------WHAT IS THE TYPE OF GET TRANSACTION -----------');
                console.log(getTransaction);
                transactionObject = {
                    'name': key,
                    'records': getTransaction
                };
            }
        });
        return transactionObject;
    }
};

// create an object to be pushed to map
const createObj = (transaction, num_of_days, previousTransaction) =>{
    console.log('NUMBER OF DAYS ----- ', num_of_days);
    let transactionsArray = [];
    if (previousTransaction) {
        transactionsArray.push(transaction, previousTransaction);
    } else {
        transactionsArray.unshift(transaction);
    }
    let transactionObj = {
        "date": transaction.date,
        "amount": transaction.amount,
        "averageAmount": transaction.amount,
        "recurring_period": num_of_days,
        "averageRecurringPeriod": num_of_days,
        "transactions": transactionsArray
    };
    return transactionObj;
};
const upsertTransactions = async (transactionObject) => {
    let count = 0;
    let intermediateTransactionArray = [];
    let transactionsArray = transactionObject.transaction;
    transactionsArray.forEach( transaction => {
        count++;
        console.log('------------------------------------'+ count +' '  +transaction.name+'----------------------------------------------------------------------');
        let transactionObjInMap = matchKey(transaction.name, storingTransactionsMAP);
        console.log('------------------ KEY MATCHED for ----------- ' +transaction.name+ '-----------------------');
        console.log(transactionObjInMap);
        console.log('---------------------------------------------------------------------------------------');

        if (Object.keys(transactionObjInMap).length === 0) {
            let transactionObj = createObj(transaction,0);
            console.log('Object created and being entered in the MAP is ----- ', transactionObj);
            storingTransactionsMAP.set(transaction.name, [transactionObj]);

        } else {
            let counter = 0;
            transactionObjInMap.records.forEach(transactionForOneCompany => {
                counter++;
                console.log('------------------------------------'+ counter + '----------------------------------------------------------------------');
                console.log('CURRENT TRANSACTION TO BE COMPARED ------- ',transaction);
                console.log('-------------------------------------------------------------');
                console.log('----------- TRANSACTIONS FOR ONE COMPANY IS -------- ',transactionForOneCompany);
                console.log('-------------------------------------------------------------');
                let num_of_days = dateFunctions.daysBetweenDates(transaction.date, transactionForOneCompany.date);
                let recurrencePeriodDiffernece = dateFunctions.recurrencePeriodDifference(num_of_days, transactionForOneCompany.recurring_period);
                let amtDiff = amountFunctions.amountDifference(transactionForOneCompany.amount, transaction.amount);
                console.log('-------------------------------------------------------------');
                console.log('NUMBER OF DAYS CALCULATED ----- ', num_of_days);
                console.log('RECURRING PERIOD DIFFERENCE ------ ', recurrencePeriodDiffernece);
                console.log('AMOUNT DIFFERENCE ------ ', amtDiff);
                if (amtDiff && (recurrencePeriodDiffernece || transactionForOneCompany.recurring_period === 0)) {
                    let avgAmount = amountFunctions.averageAmount(transactionForOneCompany.amount, transaction.amount);
                    let averageRecurrencePeriod = dateFunctions.avgRecurrencePeriod(transactionForOneCompany.averageRecurringPeriod, num_of_days);
                    console.log('transactions')
                    transactionForOneCompany.date = transaction.date;
                    transactionForOneCompany.amount = transaction.amount;
                    transactionForOneCompany.averageAmount = avgAmount;
                    transactionForOneCompany.recurring_period = num_of_days;
                    transactionForOneCompany.averageRecurringPeriod = averageRecurrencePeriod;
                    transactionForOneCompany.transactions.unshift(transaction);

                } else if (!amtDiff) {
                    console.log('AMOUNT DIFFERENCE EXCEEDED ....');
                    let transactionObj = createObj(transaction, 0);
                    intermediateTransactionArray.push(transactionObj);

                } else {
                    console.log('0000000000000000000000000000   ELSE     00000000000000000000000000000000000000000000');
                    let previousTransaction = transactionForOneCompany.transactions[0];
                    let newtransactionObj = createObj(transaction, num_of_days, previousTransaction);
                    console.log(newtransactionObj);
                    intermediateTransactionArray.push(newtransactionObj);
                    console.log('0000000000000000000000000000  END OF ELSE     00000000000000000000000000000000000000000000');
                }
                console.log('Intermediate TRANSACTION ARRAY ------- ', intermediateTransactionArray);
            });
            console.log('----------------ADDING RECORDS TO transaction of the company --------------------------- ');
            console.log(storingTransactionsMAP);
            console.log('----------------------------------------------------------------------');

            console.log('INTERMEDIATE ARRAY ------ ', intermediateTransactionArray);
            console.log('---------------------------------------Test---------------');
            transactionObjInMap.records = transactionObjInMap.records.concat(intermediateTransactionArray);
            storingTransactionsMAP.set(transaction.name, transactionObjInMap.records);
            console.log(transactionObjInMap.records);
           console.log('---------------- storing transaction MAP---------------------------');

           let dispArray = storingTransactionsMAP.get(transaction.name);
           console.log(dispArray[9]);
           console.log('----------------------------------------');
            console.log(dispArray[10]);
        }
    });

   // let sortedMap = new Map([...storingTransactionsMAP.entries()].sort((transaction1, transaction2) => {
   //     let transaction1Key = transaction1[0].toLowerCase();
   //     let transaction2Key = transaction2[0].toLowerCase();
   //     return (transaction1Key < transaction2Key) ? -1 : (transaction1Key > transaction2Key) ? 1 : 0;
   // }));
   // //console.log('Sorted MAP is ---- ', sortedMap);
   //
   //  let vpn = sortedMap.get('VPN Service');
   //  console.log('VPN ______---------- ',vpn);
   //  vpn.forEach(vpnTransaction => {
   //      if (vpnTransaction.transactions.length >=3) {
   //          console.log('------------- RECURRING TRANSACTIONS ARE ------------');
   //          console.log(vpnTransaction.transactions);
   //      }
   //  });

};

export default upsertTransactions