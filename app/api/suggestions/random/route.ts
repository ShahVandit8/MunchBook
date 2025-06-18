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

    // Get user's data
    const visits = await db.collection("visits").find(visitsQuery).sort({ date: -1 }).toArray()
    const restaurants = await db.collection("restaurants").find(restaurantsQuery).toArray()

    if (restaurants.length === 0) {
      return NextResponse.json({
        message: "Add some restaurants first to get personalized suggestions!",
      })
    }

    // Calculate restaurant scores based on various factors
    const restaurantScores = restaurants.map((restaurant) => {
      const restaurantVisits = visits.filter((v) => v.restaurantId === restaurant._id.toString())
      const visitCount = restaurantVisits.length
      const avgRating = visitCount > 0 ? restaurantVisits.reduce((sum, v) => sum + v.overallRating, 0) / visitCount : 0

      // Calculate days since last visit
      const daysSinceLastVisit =
        visitCount > 0
          ? Math.floor((Date.now() - new Date(restaurantVisits[0].date).getTime()) / (1000 * 60 * 60 * 24))
          : 999

      // Scoring algorithm
      let score = 0

      // Higher rating = higher score
      score += avgRating * 20

      // More time since last visit = higher score (but cap it)
      score += Math.min(daysSinceLastVisit, 30) * 2

      // Slight bonus for never visited
      if (visitCount === 0) score += 50

      // Slight penalty for over-visited places
      if (visitCount > 5) score -= visitCount * 2

      return {
        restaurant,
        score,
        visitCount,
        avgRating,
        daysSinceLastVisit,
      }
    })

    // Sort by score and add some randomness
    restaurantScores.sort((a, b) => b.score - a.score)

    // Pick from top 3 candidates with some randomness
    const topCandidates = restaurantScores.slice(0, Math.min(3, restaurantScores.length))
    const selected = topCandidates[Math.floor(Math.random() * topCandidates.length)]

    let message = ""
    const groupText = currentGroupId ? "your group" : "you"
    const groupHasnt = currentGroupId ? "Your group hasn't" : "You haven't"
    const groupGave = currentGroupId ? "your group gave" : "you gave"

    if (selected.visitCount === 0) {
      message = `🎯 Try ${selected.restaurant.name}! ${groupText.charAt(0).toUpperCase() + groupText.slice(1)} haven't been there yet and it's ${selected.restaurant.cuisineType} cuisine.`
    } else if (selected.daysSinceLastVisit > 30) {
      message = `🎯 How about ${selected.restaurant.name}? ${groupHasnt} been there in ${selected.daysSinceLastVisit} days and ${groupGave} it ${selected.avgRating.toFixed(1)}⭐ before!`
    } else if (selected.avgRating >= 4.5) {
      message = `🎯 ${selected.restaurant.name} is calling! ${groupText.charAt(0).toUpperCase() + groupText.slice(1)} gave it ${selected.avgRating.toFixed(1)}⭐ - time for another great meal?`
    } else {
      message = `🎯 Why not visit ${selected.restaurant.name} today? Perfect for some ${selected.restaurant.cuisineType} food!`
    }

    return NextResponse.json({
      message,
      restaurant: {
        ...selected.restaurant,
        _id: selected.restaurant._id.toString(),
      },
    })
  } catch (error) {
    console.error("Error generating random suggestion:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
