import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { User } from 'next-auth'

export async function POST(request: Request) {
    await dbConnect()

    const session = await getServerSession(authOptions);
    const _user: User = session?.user;

    if (!_user || !session) {
        return Response.json(
            { success: false, message: 'Not authenticated' },
            { status: 401 }
        );
    }
    const userId = new mongoose.Types.ObjectId(_user._id)
    try {
        const user = await UserModel.aggregate([
            { $match: { _id: userId } },
            { $unwind: '$messages' },
            { $sort: { 'messages.createdAt': -1 } },
            { $group: { _id: '$_id', messages: { $push: '$messages' } } },
        ]).exec();

        if (!user || user.length === 0) {
            return Response.json(
                { message: 'User not found', success: false },
                { status: 404 }
            );
        }

        return Response.json(
            { messages: user[0].messages },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error('An unexpected error occurred:', error);
        return Response.json(
            { message: 'Internal server error', success: false },
            { status: 500 }
        );
    }
}