import express from 'express';

import upsertTransactionsHandler from '../handlers/upsertTransactionsHandler';
let router = express.Router();

router.get('/', (req, res, next) => {
   console.log('Getting till router .get....');
   res.status(200).send("OK");
});

router.post('/', async (req, res, next) => {
    let recurringTransactions = await upsertTransactionsHandler(req.body);
});

export default router;