const express = require('express');
const bodyParser = require('body-parser');
const accountsRouter = require('./routes/accounts');
const moduleRoutes  = require('./routes/modules');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

app.use('/accounts', accountsRouter);
app.use('/modules', moduleRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
