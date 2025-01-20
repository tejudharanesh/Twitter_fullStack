import mongoose from "mongoose";

const connectMongoBD = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI); //to connect to database
    console.log("connected to DATABASE");
  } catch (error) {
    console.log("Error connecting to DATABASE:", error);
    process.exit(1);
  }
};

// export connectMongoBD
export default connectMongoBD;
