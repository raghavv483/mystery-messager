import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";


export async function POST(request: Request) {
    await dbConnect()

    const session = await getServerSession(authOptions);
    const user: User = session?.user
    if (!session || !session?.user) {
        return Response.json(
            { success: false, message: 'Not authenticated' },
            { status: 401 }
        );
    }

    const userID = user._id;
    const { acceptingMessages } = await request.json()
    try {
        const updatedUser = await UserModel.findByIdAndUpdate(
            userID,
            { isAcceptingMessages: acceptingMessages },
            { new: true }
        );
        if (!updatedUser) {
            // User not found
            return Response.json(
                {
                    success: false,
                    message: 'Unable to find user to update message acceptance status',
                },
                { status: 404 }
            );

        }
        // Successfully updated message acceptance status
        return Response.json(
            {
                success: true,
                message: 'Message acceptance status updated successfully',
                updatedUser,
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error updating message acceptance status:', error);
        return Response.json(
            { success: false, message: 'Error updating message acceptance status' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    await dbConnect()

    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user || !session) {
        return Response.json(
            { success: false, message: "Not authenticated" },
            { status: 401 }
        )
    }
    try {
        const foundUser = await UserModel.findOne(user._id)
        if (!foundUser) {
            // User not found
            return Response.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }
        return Response.json(
            { success: true, isAcceptingMessages: foundUser.isAcceptingMessages },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error retrieving message acceptance status:', error);
        return Response.json(
            { success: false, message: 'Error retrieving message acceptance status' },
            { status: 500 }
        );
    }
}