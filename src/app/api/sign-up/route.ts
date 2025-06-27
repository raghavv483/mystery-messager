import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "../../../helpers/sendVerificationEmail";
import { success } from "zod/v4";


export async function POST(request: Request) {
    await dbConnect();

    try {
        const { username, password, email } = await request.json()

        const existingVerifiesUserByUsername = await UserModel.findOne({
            username,
            isVerified: true,
        });

        if (existingVerifiesUserByUsername) {
            return Response.json(
                {
                    success: false,
                    message: "Username is already taken",
                },
                {
                    status: 400
                }
            );
        }

        const existingUserByEmail = await UserModel.findOne({ email });
        let verifiedCode = Math.floor(100000 + Math.random() * 900000).toString();

        if (existingUserByEmail) {
            if (existingUserByEmail.isVerified) {
                return Response.json({
                    success: false,
                    message: "user already registered with this email",
                },
                    {
                        status: 400
                    });
            }
            else {
                const hashedPassword = await bcrypt.hash(password, 10);
                existingUserByEmail.password = hashedPassword;
                existingUserByEmail.verifyCode = verifiedCode;
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
                await existingUserByEmail.save();
            }
        }
        else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);

            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifiedCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessages: true,
                messages: [],
            })
            await newUser.save();

        }

        //send verification email
        console.log("📧 Sending verification email to:", email);
        const emailResponse = await sendVerificationEmail(
            email,
            username,
            verifiedCode
        );
 console.log("📬 Email response:", emailResponse);
 if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        message: 'User registered successfully. Please verify your account.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error registering user:', error);
    return Response.json(
      {
        success: false,
        message: 'Error registering user',
      },
      { status: 500 }
    );
  }
}