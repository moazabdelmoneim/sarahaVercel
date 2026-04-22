import mongoose from "mongoose";


const connectDB = async()=>{

	await mongoose.connect('mongodb+srv://moazmnm:1234@cluster0.6nk1p6s.mongodb.net/mongooseVercel').then(
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