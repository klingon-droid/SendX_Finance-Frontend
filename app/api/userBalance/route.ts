import User from "@/models/user";
import dbConnect from "@/utils/dbConnect";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();

    // Parse the request body
    // example const { username , balance , twitterId } = await request.json();

    // Return success response
    return NextResponse.json(
      {
        message: "Mint address added successfully",
        data: "yourdata",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding user data:", error);
    return NextResponse.json(
      { error: "Failed to add user data" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Connect to the database
    await dbConnect();

    // Retrieve all mint addresses
    const response = await User.find();
    // Return mint addresses
    return NextResponse.json(
      {
        message: "Mint addresses retrieved successfully",
        data: "your data",
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
