const { logger } = require('firebase-functions');
const { onRequest } = require('firebase-functions/v2/https');

const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp();

exports.addTempBook = onRequest(async (req, res) => {
    const bookId = req.query.text;
    await getFirestore().collection('tempBooks').add({ bookId, time: new Date() });
    logger.info(`Book with ID: ${bookId} added.`);
    res.json({ result: `Book with ID: ${bookId} added.` });
});
