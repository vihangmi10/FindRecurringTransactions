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
            'records': getTransaction[0]
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
                    'records': getTransaction[0]
                };
            }
        });
        return transactionObject;
    }
};

const createObj = (transaction, num_of_days, previousTransaction) =>{
    let transactionsArray = [];
    if (previousTransaction) {
        transactionsArray.push(transaction, previousTransaction);
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
        console.log('FINDING FOR NAME ---- ', transaction.name);
        let transactionObjInMap = matchKey(transaction.name, storingTransactionsMAP);
        console.log('tranasaction object in map should be empty.... ', transactionObjInMap);

        // If an transaction matching the transaction.name does not exists then create a new object and push it in the MAP
        if (Object.keys(transactionObjInMap).length === 0) {
            console.log(' Map does not contain this .... add it to the map ....');
            let transactionObj = createObj(transaction,0);
            storingTransactionsMAP.set(transaction.name, [transactionObj]);
        // if the transaction objec in Map is present then..
            // calculate the number of days between the dates of current transaction and transaction in MAP
            // Calculate if recurrence period difference is NEAR to the THRESHOLD
            // calculate the difference between amounts of current transaction and transaction in MAP
        } else {
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
                transactionObjInMap.records.transactions.unshift(transaction);
            /**
             // amount difference not closer to threshold then...
             // create a new JSON of transaction and push it as the first element in array
             **/
            } else if (!amtDiff){
                console.log('AMOUNT DIFFERENCE EXCEEDED ....');
                let transactionObj = createObj(transaction,0);
                let tempArray = storingTransactionsMAP.get(transaction.name);
                tempArray.unshift(transactionObj);
            /**
             // RECURRENCE PERIOD DIFFERENCE is not match then ....
             //  Pick up the latest transaction in the map
             //
             **/
            } else {
                let previousTransaction = transactionObjInMap.records.transactions[0];
                let transactionObj = createObj(transaction, num_of_days, previousTransaction);
                let tempArray = storingTransactionsMAP.get(transaction.name);
                tempArray.unshift(transactionObj);
            }
        }
    });

    console.log('ORIGINAL MAP IS  ---- ', storingTransactionsMAP);
   let sortedMap = new Map([...storingTransactionsMAP.entries()].sort((transaction1, transaction2) => {
       console.log('TRANSACTION 1 is ---- ', transaction1);
       console.log('TRANSACTION 2 is ---- ', transaction2);
       let transaction1Key = transaction1[0].toLowerCase();
       let transaction2Key = transaction2[0].toLowerCase();
       return (transaction1Key < transaction2Key) ? -1 : (transaction1Key > transaction2Key) ? 1 : 0;
   }));


   console.log('Sorted MAP is ---- ', sortedMap);

    // keys = keys.sort((firstKey , secondKey) => {
    //     firstKey = firstKey.toLowerCase();
    //     secondKey = secondKey.toLowerCase();
    //     console.log('First key ... ', firstKey);
    //     console.log('Second key .... ', secondKey);
    //     return (firstKey < secondKey) ? -1 : (firstKey > secondKey) ? 1 : 0;
    // });
    // console.log('KEYS IS _--- ', keys);
    // console.log('SORTED MAP IS ---- ', storingTransactionsMAP);
};

export default upsertTransactions