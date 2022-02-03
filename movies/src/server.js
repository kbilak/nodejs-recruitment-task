const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./api.json");
const movieRoutes = require('./routes');

const { PORT } = process.env;
const app = express()

mongoose
    .connect(
        process.env.DB, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
        }
    )
    .then(() => console.log('Successfuly connected to db'))
    .catch((err) => {console.log(err)});

app.use(bodyParser.json());

app.use('/api/documentaion', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/movies', movieRoutes);

app.use((error, _, res, __) => {
    console.error(error);
    return res.status(500).json({error: 'internal server error'});
});

app.listen(PORT, () => {
    console.log(`app is running at port ${PORT}`);
});