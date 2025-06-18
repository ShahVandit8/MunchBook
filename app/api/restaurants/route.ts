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

    // Get user's current group
    const user = await db.collection("users").findOne({ _id: new ObjectId(session._id) })
    const currentGroupId = user?.currentGroupId

    // Build query based on current context (personal vs group)
    let query: any
    if (currentGroupId) {
      query = { groupId: currentGroupId }
    } else {
      query = { userId: session._id, $or: [{ groupId: { $exists: false } }, { groupId: null }] }
    }

    const restaurants = await db.collection("restaurants").find(query).sort({ name: 1 }).toArray()

    // Calculate stats for each restaurant
    const restaurantsWithStats = await Promise.all(
      restaurants.map(async (restaurant) => {
        let visitsQuery: any
        if (currentGroupId) {
          visitsQuery = { restaurantId: restaurant._id.toString(), groupId: currentGroupId }
        } else {
          visitsQuery = {
            restaurantId: restaurant._id.toString(),
            userId: session._id,
            $or: [{ groupId: { $exists: false } }, { groupId: null }],
          }
        }

        const visits = await db.collection("visits").find(visitsQuery).toArray()

        const totalVisits = visits.length
        const averageRating =
          totalVisits > 0 ? visits.reduce((sum, visit) => sum + visit.overallRating, 0) / totalVisits : 0

        return {
          ...restaurant,
          _id: restaurant._id.toString(),
          totalVisits,
          averageRating,
        }
      }),
    )

    return NextResponse.json(restaurantsWithStats)
  } catch (error) {
    console.error("Error fetching restaurants:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, cuisineType, location } = await request.json()

    if (!name || !cuisineType) {
      return NextResponse.json({ error: "Name and cuisine type are required" }, { status: 400 })
    }

    const db = await getDatabase()

    // Get user's current group
    const user = await db.collection("users").findOne({ _id: new ObjectId(session._id) })
    const currentGroupId = user?.currentGroupId

    const restaurantData: any = {
      name,
      cuisineType,
      location: location || "",
      userId: session._id,
      createdAt: new Date(),
    }

    // Add group context if user is in a group
    if (currentGroupId) {
      restaurantData.groupId = currentGroupId
    }

    const result = await db.collection("restaurants").insertOne(restaurantData)

    const restaurant = {
      _id: result.insertedId.toString(),
      ...restaurantData,
      totalVisits: 0,
      averageRating: 0,
    }

    return NextResponse.json(restaurant)
  } catch (error) {
    console.error("Error creating restaurant:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
