import mongoose from "mongoose";


const connectDB = async()=>{

	await mongoose.connect('mongodb://localhost:27017/mongooseAssingment').then(
		result=>{
			console.log('db connected');
		}
	).catch(
		err=>{
			console.log(err);
		}
	)
}


export default connectDB