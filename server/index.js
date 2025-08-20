import doteenv from "dotenv";
doteenv.config({
  path: "./.env",
});
import app from "./src/app.js";
import connection from "./src/db/connection.js";

connection()
  .then(() => {
    app.listen(process.env.PORT || 2525, () => {
      console.log(`server is running at port ${process.env.PORT || 2525}`);
    });
  })
  .catch((err) => {
    console.log("MondoDb connection Failed !!", err);
  });
//added new line as commit
