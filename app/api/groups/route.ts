import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getSession } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()

    // Get all groups where user is a member
    const groups = await db
      .collection("groups")
      .find({ "members.userId": session._id })
      .sort({ createdAt: -1 })
      .toArray()

    // Get user's current group
    const user = await db.collection("users").findOne({ _id: new ObjectId(session._id) })
    let currentGroup = null

    if (user?.currentGroupId) {
      currentGroup = groups.find((g) => g._id.toString() === user.currentGroupId) || null
    }

    const formattedGroups = groups.map((group) => ({
      ...group,
      _id: group._id.toString(),
    }))

    return NextResponse.json({
      groups: formattedGroups,
      currentGroup: currentGroup ? { ...currentGroup, _id: currentGroup._id.toString() } : null,
    })
  } catch (error) {
    console.error("Error fetching groups:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description } = await request.json()

    if (!name?.trim()) {
      return NextResponse.json({ error: "Group name is required" }, { status: 400 })
    }

    const db = await getDatabase()

    // Generate unique invite code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    const group = {
      name: name.trim(),
      description: description?.trim() || "",
      createdBy: session._id,
      members: [
        {
          userId: session._id,
          email: session.email,
          name: session.name,
          role: "admin" as const,
          joinedAt: new Date(),
        },
      ],
      createdAt: new Date(),
      inviteCode,
    }

    const result = await db.collection("groups").insertOne(group)

    // Set this as user's current group
    await db
      .collection("users")
      .updateOne({ _id: new ObjectId(session._id) }, { $set: { currentGroupId: result.insertedId.toString() } })

    return NextResponse.json({
      ...group,
      _id: result.insertedId.toString(),
    })
  } catch (error) {
    console.error("Error creating group:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
