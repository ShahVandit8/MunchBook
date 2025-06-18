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

    const { inviteCode } = await request.json()

    if (!inviteCode?.trim()) {
      return NextResponse.json({ error: "Invite code is required" }, { status: 400 })
    }

    const db = await getDatabase()

    // Find group by invite code
    const group = await db.collection("groups").findOne({ inviteCode: inviteCode.trim().toUpperCase() })

    if (!group) {
      return NextResponse.json({ error: "Invalid invite code" }, { status: 404 })
    }

    // Check if user is already a member
    const isAlreadyMember = group.members.some((member: any) => member.userId === session._id)

    if (isAlreadyMember) {
      return NextResponse.json({ error: "You are already a member of this group" }, { status: 400 })
    }

    // Add user to group
    const newMember = {
      userId: session._id,
      email: session.email,
      name: session.name,
      role: "member" as const,
      joinedAt: new Date(),
    }

    await db.collection("groups").updateOne({ _id: group._id }, { $push: { members: newMember } })

    // Set this as user's current group
    await db
      .collection("users")
      .updateOne({ _id: new ObjectId(session._id) }, { $set: { currentGroupId: group._id.toString() } })

    // Return updated group
    const updatedGroup = await db.collection("groups").findOne({ _id: group._id })

    return NextResponse.json({
      ...updatedGroup,
      _id: updatedGroup!._id.toString(),
    })
  } catch (error) {
    console.error("Error joining group:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
