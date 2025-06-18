import { NextResponse } from "next/server"
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

    // Build queries based on current context (personal vs group)
    let visitsQuery: any, restaurantsQuery: any
    if (currentGroupId) {
      visitsQuery = { groupId: currentGroupId }
      restaurantsQuery = { groupId: currentGroupId }
    } else {
      visitsQuery = { userId: session._id, $or: [{ groupId: { $exists: false } }, { groupId: null }] }
      restaurantsQuery = { userId: session._id, $or: [{ groupId: { $exists: false } }, { groupId: null }] }
    }

    // Get total visits
    const totalVisits = await db.collection("visits").countDocuments(visitsQuery)

    // Get total restaurants
    const totalRestaurants = await db.collection("restaurants").countDocuments(restaurantsQuery)

    // Get average rating
    const visits = await db.collection("visits").find(visitsQuery).toArray()

    const averageRating =
      visits.length > 0 ? visits.reduce((sum, visit) => sum + visit.overallRating, 0) / visits.length : 0

    // Get favorite restaurant (most visited)
    const restaurantVisitCounts = await db
      .collection("visits")
      .aggregate([
        { $match: visitsQuery },
        { $group: { _id: "$restaurantId", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ])
      .toArray()

    let favoriteRestaurant = null
    if (restaurantVisitCounts.length > 0) {
      const restaurant = await db.collection("restaurants").findOne({ _id: new ObjectId(restaurantVisitCounts[0]._id) })

      if (restaurant) {
        favoriteRestaurant = {
          ...restaurant,
          _id: restaurant._id.toString(),
        }
      }
    }

    return NextResponse.json({
      totalVisits,
      totalRestaurants,
      averageRating,
      favoriteRestaurant,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
