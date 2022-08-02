import mongoose from "mongoose";

export async function connect() {
  const url: any = process.env.DATABASE_URL;

  try {
    await mongoose
      .connect(url)
      .then(() => console.log("Database Connected"))
      .catch((err) => console.log("DataBase Error Occured: ", err));
  } catch (e) {
    console.log("Mongoose Error: ", e);
  }
}
