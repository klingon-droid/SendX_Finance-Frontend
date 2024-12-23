import User from "@/models/user";
import dbConnect from "@/utils/dbConnect";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();

    // Parse the request body
    const { username, balance } = await request.json();

    // Update or create the user in the database
    const user = await User.findOneAndUpdate(
      { username },
      { balance: balance ?? 0 }, // Set balance to 0 if not provided
      { new: true, upsert: true }
    );

    // Return success response
    return NextResponse.json(
      {
        message: "User balance updated successfully",
        data: user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error updating user balance:", error);
    return NextResponse.json(
      { error: "Failed to update user balance" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  try {
    // Connect to the database
    await dbConnect();

    // Retrieve all users with their balances
    const users = await User.findOne({ username: username });

    // Return user data with balances
    return NextResponse.json(
      {
        message: "User balances retrieved successfully",
        data: users,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving user data:", error);
    return NextResponse.json(
      { error: "Failed to retrieve user data" },
      { status: 500 }
    );
  }
}
