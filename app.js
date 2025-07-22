const express = require('express');
const app = express();
const path = require('path');

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));

const routes = require('./routes/index');
app.use('/', routes);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
})