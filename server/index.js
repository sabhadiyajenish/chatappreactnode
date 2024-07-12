import doteenv from "dotenv";
import app from "./src/app.js";
import connection from "./src/db/connection.js";
doteenv.config({
  path: "./.env",
});

connection()
  .then(() => {
    app.listen(process.env.PORT || 2525, () => {
      console.log(`server is running at port ${process.env.PORT || 2525}`);
    });
  })
  .catch((err) => {
    console.log("MondoDb connection Failed !!", err);
  });
