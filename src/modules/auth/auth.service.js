import userModel from "../../DB/models/user.model.js";
import bcrypt from "bcrypt";
import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { env } from "../../../config/config.service.js";
import { providerEnum } from "../../utils/enums.js";
import cloudinary from "../../utils/cloudinary.js";
import { customAlphabet } from "nanoid";
import { sendEmail } from "../../utils/mail/sendEmail.js";
//
export const signup = async (inputs, file) => {
	const { email, password, phone, age, name } = inputs;
	if (await userModel.findOne({ email })) {
		return {
			messsage: "email already exist",
		};
	}
	const hashedPass = bcrypt.hashSync(password, 8);
	// plian txt =====algorithms==========> hashed (#$%LHLHG%#H)
	// enc key encryption ========== algroithms === > (dlsafkljdhsa)
	const encryptedPhone = CryptoJS.AES.encrypt(phone, "fdsafdas").toString();
	const user = await userModel.insertOne({
		email,
		password: hashedPass,
		phone: encryptedPhone,
		age,
		name,
	});
	// const {public_id,secure_url} = await cloudinary.uploader.upload(file.path,
	// 	{
	// 		folder:`workshopCloudinary/${user._id}/profilePic`,
	// 	}
	// )
	// user.profilePic= {public_id,secure_url}

	await user.save();
	return user;
};

//  2sv ---> login ===> check ======> otp ====> verify =====> token
export const login = async (inputs) => {

	const maxAttempts=5
	const locktime = 5*1000*60
	const { email, password } = inputs;

	const user = await userModel.findOne({ email });

	if (!user) {
		throw new Error("false email or pasword", { cause: 404 });
	}
	// check if account is locked or not
	if(user.lockUntil && user.lockUntil > Date.now()){
		const remainingTime = Math.ceil((user.lockUntil- Date.now())/(1000*60))
		throw new Error(`account is locked try again in ${remainingTime} minutes`, { cause: 403 });
	}
	if (!bcrypt.compareSync(password, user.password)) {
		user.loginAttempts += 1
		// check if user reach max attempts or not
		if(user.loginAttempts >= maxAttempts){
			user.lockUntil = Date.now() + locktime
			user.loginAttempts = 0
		}
		await user.save()
		throw new Error("false email or pasword", { cause: 404 });
	}
	user.loginAttempts = 0
	user.lockUntil = null
	await user.save()
	if (user.twoStepVerification) {
		const otp = customAlphabet("0123456789", 4)();
		const hashedotp = bcrypt.hashSync(otp, 8);
		user.otp = hashedotp;
		await user.save();
		await sendEmail({
			to: user.email,
			subject: "Login OTP",
			html: `<h1>your otp is ${otp}</h1>`,
		});
		return { message: "otp sent to your mail" };
	} else {
		const token = jwt.sign({ id: user._id }, "djfals", {
			expiresIn: "1h",
		});
		return token;
	}
};

export const verifyLoginOtp = async (otp, email) => {
	const user = await userModel.findOne({ email });
	if (!user) {
		throw new Error("user not found", { cause: { status: 404 } });
	}
	if (!user.otp) {
		throw new Error("no otp to verify", { cause: { status: 400 } });
	}
	const isValid = bcrypt.compareSync(otp, user.otp);
	if (!isValid) {
		throw new Error("invalid otp", { cause: { status: 400 } });
	}
	user.otp = null;
	await user.save();

	const token = jwt.sign({ id: user._id }, "djfals", {
		expiresIn: "1h",
	});
	return token;
};
/*{
  iss: 'https://accounts.google.com',
  azp: '651858585545-a76cfqd0qub6b82bhjrri9p5t9gm3ipn.apps.googleusercontent.com',
  aud: '651858585545-a76cfqd0qub6b82bhjrri9p5t9gm3ipn.apps.googleusercontent.com',
  sub: '101325649884572445156',
  email: 'moazabdelmoneim315@gmail.com',
  email_verified: true,
  nbf: 1773865902,
  name: 'Moaz Abdelmoneim',
  picture: 'https://lh3.googleusercontent.com/a/ACg8ocKg3_V4Q8wQMk6NU-6JDR6xdI3E7jEpaCacTaFbTSr_VfePLg=s96-c',
  given_name: 'Moaz',
  family_name: 'Abdelmoneim',
  iat: 1773866202,
  exp: 1773869802,
  jti: 'c12b370ce912434b4486405a97e5e0a7fa627582'
}
 */

const verifyGoogleIdToken = async (idToken) => {
	const client = new OAuth2Client();

	const ticket = await client.verifyIdToken({
		idToken: idToken,
		audience: env.clientId,
	});
	const payload = ticket.getPayload();
	return payload;
};

export const loginWithGmail = async (idToken) => {
	try {
		const payload = await verifyGoogleIdToken(idToken);
		if (!payload) {
			throw new Error("invalid payloay");
		}

		const user = await userModel.findOne({ email: payload.email });

		if (!user) {
			throw new Error("email is not exist or verified");
		}

		const token = jwt.sign({ id: user._id }, "djfals", {
			expiresIn: "1h",
		});
		return { status: 200, token, message: "loggeedIn success" };
	} catch (error) {
		console.log(error);
	}
};

export const signupWithGmail = async (idToken) => {
	try {
		const payload = await verifyGoogleIdToken(idToken);
		if (!payload) {
			throw new Error("invalid payloay");
		}

		const existUser = await userModel.findOne({ email: payload.email });

		if (existUser) {
			return loginWithGmail(idToken);
		}
		const user = await userModel.create({
			email: payload.email,
			name: payload.given_name,
			provider: providerEnum.google,
		});

		const token = jwt.sign({ id: user._id }, "djfals", {
			expiresIn: "1h",
		});
		return { status: 201, token, message: "registerd success" };
	} catch (error) {
		throw new Error(error.message);
	}
};

// send otp for two step verification

export const toggleTwoStep = async (userId) => {
	const user = await userModel.findById(userId);
	if (!user) {
		throw new Error("user not found", { cause: { status: 404 } });
	}
	// create otp =====> save in db ====> send to user via mail. ===> check your mail
	// const otp = Math.floor(100000 + Math.random() * 900000).toString()
	const otp = customAlphabet("0123456789", 4)();
	const hashedotp = bcrypt.hashSync(otp, 8);
	user.otp = hashedotp;
	await user.save();
	await sendEmail({
		to: user.email,
		subject: user.twoStepVerification
			? "disable two step verification"
			: "enable two step verification",
		html: `<h1>your otp is ${otp}</h1>`,
	});
	return "otp sent to your mail";
};

// verify
export const verifyTwoStep = async (email, otp) => {
	// email ==> find user
	//otp ====> compare it with hashed otp in db
	const user = await userModel.findOne({ email });

	if (!user) {
		throw new Error("user not found", { cause: { status: 404 } });
	}
	// check if user has otp or not
	if (!user.otp) {
		throw new Error("no otp to verify", { cause: { status: 400 } });
	}

	const isValid = bcrypt.compareSync(otp, user.otp);
	if (!isValid) {
		throw new Error("invalid otp", { cause: { status: 400 } });
	}
	user.twoStepVerification = !user.twoStepVerification;
	user.otp = null;
	await user.save();
	return user.twoStepVerification
		? "two step verification enabled"
		: "two step verification disabled";
};

// forget password
export const forgetPassword = async (email) => {
	const user = await userModel.findOne({ email });
	if (!user) {
		throw new Error("user not found", { cause: { status: 404 } });
	}
	const otp = customAlphabet("0123456789", 4)();
	const hashedotp = bcrypt.hashSync(otp, 8);
	user.otp = hashedotp;
	await user.save();
	await sendEmail({
		to: user.email,
		subject: "Forget Password OTP",
		html: `<h1>your otp is ${otp}</h1>`,
	});
	return "otp sent to your mail";
};

export const resetPassword = async (otp, newPassword, email) => {
	const user = await userModel.findOne({ email });
	if (!user) {
		throw new Error("user not found", { cause: { status: 404 } });
	}
	if (!user.otp) {
		throw new Error("no otp to verify", { cause: { status: 400 } });
	}
	const isValid = bcrypt.compareSync(otp, user.otp);
	if (!isValid) {
		throw new Error("invalid otp", { cause: { status: 400 } });
	}
	user.password = bcrypt.hashSync(newPassword,8)
	user.otp = null;
	await user.save()
	return "password reset successfully";
};
