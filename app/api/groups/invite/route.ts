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

    const { groupId, email } = await request.json()

    if (!groupId || !email?.trim()) {
      return NextResponse.json({ error: "Group ID and email are required" }, { status: 400 })
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

    // Check if user is already a member
    const isAlreadyMember = group.members.some((member: any) => member.email.toLowerCase() === email.toLowerCase())

    if (isAlreadyMember) {
      return NextResponse.json({ error: "User is already a member of this group" }, { status: 400 })
    }

    // For now, we'll just return success. In a real app, you'd send an email invitation
    // You could integrate with services like SendGrid, Resend, or similar

    return NextResponse.json({
      success: true,
      message: `Invitation would be sent to ${email}. For now, share the invite code: ${group.inviteCode}`,
    })
  } catch (error) {
    console.error("Error sending invitation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
