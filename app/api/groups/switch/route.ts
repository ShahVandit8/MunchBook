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

    const db = await getDatabase()

    // If groupId is empty, switch to personal mode
    if (!groupId) {
      await db.collection("users").updateOne({ _id: new ObjectId(session._id) }, { $unset: { currentGroupId: "" } })
      return NextResponse.json({ success: true })
    }

    // Verify user is member of the group
    const group = await db.collection("groups").findOne({
      _id: new ObjectId(groupId),
      "members.userId": session._id,
    })

    if (!group) {
      return NextResponse.json({ error: "Group not found or access denied" }, { status: 404 })
    }

    // Update user's current group
    await db.collection("users").updateOne({ _id: new ObjectId(session._id) }, { $set: { currentGroupId: groupId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error switching group:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
