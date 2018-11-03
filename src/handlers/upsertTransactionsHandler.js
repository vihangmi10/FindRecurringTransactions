import similarString from '../utils/strings';
import dateFunctions from '../utils/dates';
import amountFunctions from '../utils/amount';

let storingTransactionsMAP = new Map();

const matchKey = (transactionName, storingTransactionsMAP) => {
    // initialize this as empty
    let transactionObject = {};
    // If key is found
    if (storingTransactionsMAP.has(transactionName)) {
        console.log('Key found....');
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
                console.log('SIMILAR....');
                let getTransaction = storingTransactionsMAP.get(key);
                transactionObject = {
                    'name': key,
                    'records': getTransaction
                };
            }
        });
        return transactionObject;
    }
};
/**
 * This function checks which of the transaction present in the MAP closes resembles the current transaction
 * Returns empty for no elements in MAP
 * Returns the same transaction if only 1 transaction is present
 * Compares amount and recurrence period in each transactions in MAP and returns the closest transaction found
 * If no closest transaction found it will return the most recent transaction from the MAP
 */
const matchTransaction = (transactionsInMap, currentTransaction) => {
    console.log('IN FUNCTION MATCH THE CORRECT TRANSACTION ----- ');
    console.log('EXISTING TRANSACTION RECORDS ARE ----- ', transactionsInMap);
    console.log('CURRENT TRANSACTIONS IS ----- ', currentTransaction);
    if (Object.keys(transactionsInMap).length === 0){
        console.log('There are 0 transactions in MAP');
        return transactionsInMap;
    } else {
        console.log('1 OR MORE transactions in the MAP....');
        if(transactionsInMap.records.length ===1){
            console.log('---------ONLY 1 transaction is present ----------- that is ------ ', transactionsInMap);
            let transactionObject = {
                'name': currentTransaction.name,
                'records': transactionsInMap.records[0]
            };
            return transactionObject;
        } else {
            let transactionObj = {};
            // check for each transactions in the map and return the one that has amount difference and recurrence period closest to the current transaction
            transactionsInMap.records.forEach(transactionInMap => {
                console.log('---0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-EACH TRANSACTION IN MAP IS ---0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-');
                console.log(transactionInMap);
                let amtDiff = amountFunctions.amountDifference(transactionInMap.amount, currentTransaction.amount);
                console.log('AMOUNT DIFFERENCE is ----- ', amtDiff);
                let num_of_days = dateFunctions.daysBetweenDates(currentTransaction.date, transactionInMap.date);
                console.log('Number of days is ----- ', num_of_days);
                let recurrencePeriodDiffernece = dateFunctions.recurrencePeriodDifference(num_of_days,transactionInMap.recurring_period);
                console.log('IS THE NUMBER OF DAYS CLOSER TO EXISTING RECURRING PERIOD ----- ', recurrencePeriodDiffernece);
                // if amount difference is less or if the amount is same
                // group them into a cluster and push it at the end of array
                if (amtDiff) {
                    console.log('----------------AMOUNT DIFFERENCE IS LESS ----------------');
                    let transactionArray = [];
                    transactionArray.push(transactionInMap, currentTransaction);
                    transactionObj = createObj(currentTransaction, num_of_days,transactionInMap);
                    transactionsInMap.records.push(transactionObj);
                    console.log('---------------------UPDATED TRANSACTION ARRAY IS -----------------------------------');
                    console.log(JSON.stringify(transactionsInMap.records));
                    console.log('---------------------UPDATED TRANSACTION ARRAY IS -----------------------------------')
                    transactionObj = {
                        'name': currentTransaction.name,
                        'records': transactionInMap
                    }
                    // return most recent transaction from the map
                } else {
                    console.log('AMOUNT DIFFERENCE DOES NOT MATCH OR RECURRING PERIOD DOES NOT MATCH ------ ');
                    transactionObj = {
                        'name': currentTransaction.name,
                        'records': transactionsInMap.records[0]
                    }
                }
            });
            return transactionObj;
        }
    }
    // transactionsInMap.forEach(transaction => {
    //     console.log('Each transaction is --------- ')
    // });
};
// create an object to be pushed to map
const createObj = (transaction, num_of_days, previousTransaction) =>{
    let transactionsArray = [];
    if (previousTransaction) {
        transactionsArray.push(previousTransaction, transaction);
    } else {
        transactionsArray.push(transaction);
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
    let transactionsArray = transactionObject.transaction;
    transactionsArray.forEach( transaction => {
        count++;
        console.log('------------------------------------'+ count + '----------------------------------------------------------------------');
        console.log('THE MAP AT PRESENT AFTER '+count+ ' IS ----- ', storingTransactionsMAP);
        console.log('FINDING FOR NAME ---- ', transaction.name);
        let transactionObjInMap = matchKey(transaction.name, storingTransactionsMAP);
        console.log('transaction object in map .... ', transactionObjInMap);
        console.log('---------------------00000000000000000000000-------------------------------');
         transactionObjInMap = matchTransaction(transactionObjInMap, transaction);
        console.log('---------------------00000000000000000000000-------------------------------');
        // If an transaction matching the transaction.name does not exists then create a new object and push it in the MAP
        if (Object.keys(transactionObjInMap).length === 0) {
            console.log(' Map does not contain this .... add it to the map ....');
            let transactionObj = createObj(transaction,0);
            storingTransactionsMAP.set(transaction.name, [transactionObj]);
        // if the transaction object in Map is present then..
            // calculate the number of days between the dates of current transaction and transaction in MAP
            // Calculate if recurrence period difference is NEAR to the THRESHOLD
            // calculate the difference between amounts of current transaction and transaction in MAP
        } else {
            console.log('---------------------Transaction object in map now after matchTransaction function is -------------------');
            console.log(transactionObjInMap);
            console.log('----------------------------------------------------------------------------------------------------------');
            let num_of_days = dateFunctions.daysBetweenDates(transaction.date, transactionObjInMap.records.date);
            console.log('Number of days is ----- ', num_of_days);
            let recurrencePeriodDiffernece = dateFunctions.recurrencePeriodDifference(num_of_days,transactionObjInMap.records.recurring_period);
            console.log('IS THE NUMBER OF DAYS CLOSER TO EXISTING RECURRING PERIOD ----- ', recurrencePeriodDiffernece);
            let amtDiff = amountFunctions.amountDifference(transactionObjInMap.records.amount, transaction.amount);
            console.log('AMOUNT DIFFERENCE IS ----- ',amtDiff);
            /**
             // if the amount is closer to threshold && (recurrence period is closer to threshold || MAP.recurrence_period == 0)
             // calculate average amount by existing amount in transaction obj map and current transaction.amount
             // calculate average recurring period by existing average recurring period  in transaction obj map and current transaction.averageRecurringPeriod
             //update the date in the MAP , update amount in the MAP, update the recurrence period in the MAP with num_of_days
             // add transaction using unshift in transactions array
             **/
            if (amtDiff && (recurrencePeriodDiffernece || transactionObjInMap.records.recurring_period === 0)) {
                let avgAmount = amountFunctions.averageAmount(transactionObjInMap.records.amount, transaction.amount);
                let averageRecurrencePeriod = dateFunctions.avgRecurrencePeriod(transactionObjInMap.records.averageRecurringPeriod, num_of_days);
                console.log('Average amount is ------ ', avgAmount);
                console.log('Average Recurring period is ------ ', averageRecurrencePeriod);
                console.log('Should only go once');
                transactionObjInMap.records.date = transaction.date;
                transactionObjInMap.records.amount = transaction.amount;
                transactionObjInMap.records.averageAmount = avgAmount;
                transactionObjInMap.records.recurring_period = num_of_days;
                transactionObjInMap.records.averageRecurringPeriod = averageRecurrencePeriod;
                transactionObjInMap.records.transactions.push(transaction);
            /**
             // amount difference not closer to threshold then...
             // create a new JSON of transaction and push it as the first element in array
             **/
            } else if (!amtDiff){
                console.log('AMOUNT DIFFERENCE EXCEEDED ....');
                let transactionObj = createObj(transaction,0);
                let tempArray = storingTransactionsMAP.get(transaction.name);
                tempArray.push(transactionObj);
            /**
             // RECURRENCE PERIOD DIFFERENCE is not match then ....
             //  Pick up the latest transaction in the map
             //
             **/
            } else {
                let previousTransaction = transactionObjInMap.records.transactions;
                previousTransaction = previousTransaction[previousTransaction.length -1];
                let transactionObj = createObj(transaction, num_of_days, previousTransaction);
                let tempArray = storingTransactionsMAP.get(transaction.name);
                tempArray.push(transactionObj);
            }
        }
    });

    console.log('ORIGINAL MAP IS  ---- ', storingTransactionsMAP);
   let sortedMap = new Map([...storingTransactionsMAP.entries()].sort((transaction1, transaction2) => {
       let transaction1Key = transaction1[0].toLowerCase();
       let transaction2Key = transaction2[0].toLowerCase();
       return (transaction1Key < transaction2Key) ? -1 : (transaction1Key > transaction2Key) ? 1 : 0;
   }));
   console.log('Sorted MAP is ---- ', sortedMap);

    let vpn = sortedMap.get('VPN Service');
    console.log('VPN ______---------- ',JSON.stringify(vpn));

};

export default upsertTransactions