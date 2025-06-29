import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { usernameValidation } from "@/schemas/signUpSchema";
import { z } from 'zod';

const userNameQuerySchema = z.object({
    username: usernameValidation
})

export async function GET(request: Request) {
    await dbConnect();
    try {
        const { searchParams } = new URL(request.url);
        const queryParams = {
            username: searchParams.get('username')

        };
        const result = userNameQuerySchema.safeParse(queryParams);
        if (!result.success) {
            const usernameErrors = result.error.format().username?._errors || [];
            return Response.json(
                {
                    success: false,
                    message:
                        usernameErrors?.length > 0
                            ? usernameErrors.join(', ')
                            : 'Invalid query parameters',
                },
                { status: 400 }
            );
        }
        const { username } = result.data;
        const existingVerifiesUser = await UserModel.findOne({
            username,
            isVerified: true,
        });
        if (existingVerifiesUser) {
            return Response.json(
                {
                    success: false,
                    message: 'username is already taken'
                },
                { status: 200 }

            )
        }

        return Response.json(
            {
                success: true,
                message: 'Username is unique',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error checking username:', error);
        return Response.json(
            {
                success: false,
                message: 'Error checking username',
            },
            { status: 500 }
        );
    }
}