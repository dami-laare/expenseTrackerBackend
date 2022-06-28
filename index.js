const app = require("./app");
const connectDatabase = require("./config/connectDatabase");
require("dotenv").config({ path: "./config/config.env" });

connectDatabase();

app.listen(process.env.PORT, () => {
  console.log(
    `Server running on PORT: ${process.env.PORT} in ${process.env.NODE_ENV} mode`
  );
});
