import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getSession } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { groupId } = await request.json()

    if (!groupId) {
      return NextResponse.json({ error: "Group ID is required" }, { status: 400 })
    }

    const db = await getDatabase()

    // Get the group
    const group = await db.collection("groups").findOne({
      _id: new ObjectId(groupId),
      "members.userId": session._id,
    })

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    // Don't allow group creator to leave if there are other members
    if (group.createdBy === session._id && group.members.length > 1) {
      return NextResponse.json(
        {
          error:
            "Group creator cannot leave while there are other members. Transfer ownership or remove all members first.",
        },
        { status: 400 },
      )
    }

    // If this is the last member, delete the group
    if (group.members.length === 1) {
      await db.collection("groups").deleteOne({ _id: new ObjectId(groupId) })
    } else {
      // Remove user from group
      await db
        .collection("groups")
        .updateOne({ _id: new ObjectId(groupId) }, { $pull: { members: { userId: session._id } } })
    }

    // Unset user's current group if it was this group
    await db.collection("users").updateOne({ _id: new ObjectId(session._id) }, { $unset: { currentGroupId: "" } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error leaving group:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
