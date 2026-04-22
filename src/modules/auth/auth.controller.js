import { Router } from "express";
import { login, signup, signupWithGmail, toggleTwoStep, verifyTwoStep, verifyLoginOtp , forgetPassword ,resetPassword} from "./auth.service.js";
import { validation } from "../../middleware/valid.middleware.js";
import { loginSchema, signUpSchema } from "./auth.validation.js";
import { multer_upload } from "../../middleware/multer.middleware.js";
import cloudinary from "../../utils/cloudinary.js";
import { authentication } from "../../middleware/auth.middleware.js";
const router = Router();

router.post(
	"/signup",
	multer_upload().single("image"),
	async (req, res, next) => {
		console.log(req.body);
		console.log(req.file);

		const results = await signup(req.body, req.file);
		return res.json({
			message: "done",
			results,
		});
	},
);

router.post("/login", async (req, res, next) => {
	const results = await login(req.body);
	return res.json({
		message: "done",
		results,
	});
});


router.patch("/verifyLogin", async (req, res, next) => {
	const results = await verifyLoginOtp(
		req.body.otp,
		req.body.email,
	);
	return res.json({
		message: "done",
		results,
	});
});


router.post("/signup/gmail", async (req, res, next) => {
	const results = await signupWithGmail(req.body.idToken);
	console.log(results);

	return res.status(results.status).json({
		message: results.message,
		token: results.token,
	});
});

router.post(
	"/test",
	multer_upload({ customPath: "coverPics" }).single("image"),
	async (req, res, next) => {
		//https://localhost:5000/
		console.log(req.host);
		console.log(req.protocol);
		const baseUrl = `${req.protocol}://${req.host}/`;

		req.file.fullPath = baseUrl + req.file.path;

		return res.json({
			message: "done",
			results: req.file,
		});
	},
);

router.post(
	"/array",
	multer_upload({ customPath: "coverPics" }).array("images", 3),
	async (req, res, next) => {
		//https://localhost:5000/
		console.log(req.host);
		console.log(req.protocol);
		const baseUrl = `${req.protocol}://${req.host}/`;
		console.log(req.files);
		let results = req.files.map((file) => {
			let fullPath = baseUrl + file.path;
			return {
				...file,
				fullPath,
			};
		});
		// req.file.fullPath = baseUrl + req.file.path

		return res.json({
			message: "done",
			results,
		});
	},
);

router.post(
	"/field",
	multer_upload({ customPath: "coverPics" }).fields([
		{ name: "images", maxCount: 3 },
		{ name: "cv", maxCount: 1 },
		{ name: "attachment", maxCount: 2 },
	]),
	async (req, res, next) => {
		return res.json({
			message: "done",
			reqs: req.files,
		});
	},
);

router.post(
	"/test1",
	multer_upload({ customPath: "coverPics" }).single("image"),
	async (req, res, next) => {
		const result = await cloudinary.uploader.upload(req.file.path, {
			folder: "workshopCloudinary/id",
		});
		return res.json({
			message: "done",
			result,
		});
	},
);

router.patch("/toggleTwoStep", authentication, async (req, res, next) => {
	const results = await toggleTwoStep(req.user._id);
	return res.status(200).json({
		message: "done",
		results,
	});
});

router.patch('/verifyTwoStep',authentication,async(req,res,next)=>{
	const results = await verifyTwoStep(req.user.email,req.body.otp);
	return res.status(200).json({
		message: "done",
		results,
	});
})

///         forget pass ===> check if user exist ===> semd otp via email

router.post('/forgetPassword',async(req,res,next)=>{

	const results = await forgetPassword(req.body.email)
	return res.status(200).json({
		message: "done",
		results,
	});
})

router.post('/resetPassword',async(req,res,next)=>{

	const results = await resetPassword(req.body.otp, req.body.newPassword, req.body.email)
	return res.status(200).json({
		message: "done",
		results,
	});
})






















export default router;
