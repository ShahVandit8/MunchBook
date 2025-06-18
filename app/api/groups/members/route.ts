import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getSession } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { groupId, userId } = await request.json()

    if (!groupId || !userId) {
      return NextResponse.json({ error: "Group ID and user ID are required" }, { status: 400 })
    }

    const db = await getDatabase()

    // Verify user is admin of the group
    const group = await db.collection("groups").findOne({
      _id: new ObjectId(groupId),
      members: {
        $elemMatch: {
          userId: session._id,
          role: "admin",
        },
      },
    })

    if (!group) {
      return NextResponse.json({ error: "Group not found or insufficient permissions" }, { status: 404 })
    }

    // Don't allow removing the group creator
    if (group.createdBy === userId) {
      return NextResponse.json({ error: "Cannot remove the group creator" }, { status: 400 })
    }

    // Remove member from group
    await db.collection("groups").updateOne({ _id: new ObjectId(groupId) }, { $pull: { members: { userId: userId } } })

    // If the removed user had this as their current group, unset it
    await db
      .collection("users")
      .updateOne({ _id: new ObjectId(userId), currentGroupId: groupId }, { $unset: { currentGroupId: "" } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing member:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
