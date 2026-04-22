import mongoose from "mongoose";
import { providerEnum } from "../../utils/enums.js";

const userSchema =new mongoose.Schema({
	name:{
		type:String,
		required:true
	},
	email:{
		type:String,
		unique:true,
		required:true
	},
	password:{ 
		type:String,
		required:function(){
			return this.provider==providerEnum.system
		}
	},
	loginAttempts:{
		type:Number,
		default:0
	}
	,
	lockUntil:{
		type:Date,
		default:null
	}
	,
	provider:{
		type:String,
		enum:Object.values(providerEnum),
		default:providerEnum.system,
		required:true
	}
	,
	phone:{
		type:String,
		required:false
	},
	age:{
		type:Number,
		min:18,
		max:60
	},
	profilePic:{
		public_id:String,
		secure_url:String
	},

	twoStepVerification:{
		type:Boolean,
		default:false
	},
	otp:{
		type:String,
		default:null
	}

},{
	timestamps:true
})

const userModel = mongoose.model("User",userSchema)

export default userModel