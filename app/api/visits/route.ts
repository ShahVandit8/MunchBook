import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getSession } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit")

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

    let visitsQuery = db.collection("visits").find(query).sort({ date: -1 })

    if (limit) {
      visitsQuery = visitsQuery.limit(Number.parseInt(limit))
    }

    const visits = await visitsQuery.toArray()

    // Populate restaurant data
    const visitsWithRestaurants = await Promise.all(
      visits.map(async (visit) => {
        const restaurant = await db.collection("restaurants").findOne({ _id: new ObjectId(visit.restaurantId) })

        return {
          ...visit,
          _id: visit._id.toString(),
          restaurant: restaurant
            ? {
                ...restaurant,
                _id: restaurant._id.toString(),
              }
            : null,
        }
      }),
    )

    return NextResponse.json(visitsWithRestaurants)
  } catch (error) {
    console.error("Error fetching visits:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { restaurantId, date, overallRating, overallReview, dishes } = await request.json()

    if (!restaurantId || !date || !overallRating || !dishes || dishes.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDatabase()

    // Get user's current group
    const user = await db.collection("users").findOne({ _id: new ObjectId(session._id) })
    const currentGroupId = user?.currentGroupId

    // Verify restaurant exists and user has access
    const restaurantQuery: any = { _id: new ObjectId(restaurantId) }
    if (currentGroupId) {
      restaurantQuery.groupId = currentGroupId
    } else {
      restaurantQuery.userId = session._id
      restaurantQuery.$or = [{ groupId: { $exists: false } }, { groupId: null }]
    }

    const restaurant = await db.collection("restaurants").findOne(restaurantQuery)

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
    }

    const visitData: any = {
      restaurantId,
      userId: session._id,
      addedBy: session._id,
      addedByName: session.name,
      date: new Date(date),
      overallRating,
      overallReview: overallReview || "",
      dishes,
      createdAt: new Date(),
    }

    // Add group context if user is in a group
    if (currentGroupId) {
      visitData.groupId = currentGroupId
    }

    const result = await db.collection("visits").insertOne(visitData)

    const visit = {
      _id: result.insertedId.toString(),
      ...visitData,
      restaurant: {
        ...restaurant,
        _id: restaurant._id.toString(),
      },
    }

    return NextResponse.json(visit)
  } catch (error) {
    console.error("Error creating visit:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
