require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const usersRouter = require("./routes/usersRouter");
const usersLoginRouter = require("./routes/usersLoginRouter");
const usersTransactionRouter = require("./routes/usersTransactionRouter");
const usersAccountRouter = require("./routes/usersAccountRouter");


const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const port = process.env.PORT || 4000;

(async () => {
    const connection = await mongoose.connect(process.env.DB_URI, { useNewUrlParser: true });

    if (connection) {
        console.log("Database is connected successfully...");
    }
})();

app.get("/", (req, res) => {
    res.send("Hello DApp!..");
});

app.use("/", usersRouter);
app.use("/users", usersLoginRouter);
app.use("/users", usersTransactionRouter);
app.use("/users", usersAccountRouter);

app.listen(port, () => console.log(`Server is running on port ${port}...`));