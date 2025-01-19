const express = require('express');
const bodyParser = require('body-parser');
const accountsRouter = require('./routes/accounts');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use('/accounts', accountsRouter);
app.use('/modules', moduleRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
