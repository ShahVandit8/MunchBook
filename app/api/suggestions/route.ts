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
    const suggestions = []

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

    // Get user's visits and restaurants
    const visits = await db.collection("visits").find(visitsQuery).sort({ date: -1 }).toArray()
    const restaurants = await db.collection("restaurants").find(restaurantsQuery).toArray()

    if (visits.length === 0) {
      return NextResponse.json([])
    }

    // Rest of the suggestion logic remains the same...
    // (keeping the existing logic for cuisine diversity, highly rated restaurants, etc.)

    // Cuisine diversity suggestion
    const cuisineFrequency = new Map()
    const restaurantVisitCounts = new Map()
    const dishFrequency = new Map()

    for (const visit of visits) {
      const restaurant = restaurants.find((r) => r._id.toString() === visit.restaurantId)
      if (restaurant) {
        // Count cuisine types
        cuisineFrequency.set(restaurant.cuisineType, (cuisineFrequency.get(restaurant.cuisineType) || 0) + 1)

        // Count restaurant visits
        restaurantVisitCounts.set(restaurant.name, (restaurantVisitCounts.get(restaurant.name) || 0) + 1)
      }

      // Count dishes
      for (const dish of visit.dishes) {
        dishFrequency.set(dish.name, (dishFrequency.get(dish.name) || 0) + 1)
      }
    }

    // Suggest trying a different cuisine
    const sortedCuisines = Array.from(cuisineFrequency.entries()).sort((a, b) => a[1] - b[1])

    if (sortedCuisines.length > 1) {
      const leastTriedCuisine = sortedCuisines[0][0]
      const daysSinceLastVisit = getDaysSinceLastCuisine(visits, restaurants, leastTriedCuisine)

      if (daysSinceLastVisit > 14) {
        const groupText = currentGroupId ? " Your group hasn't had" : " You haven't had"
        suggestions.push({
          type: "cuisine",
          message: `${groupText} ${leastTriedCuisine} in ${daysSinceLastVisit} days. Time to try it again!`,
        })
      }
    }

    // Suggest highly rated restaurants
    const highRatedVisits = visits.filter((visit) => visit.overallRating >= 4.5)
    if (highRatedVisits.length > 0) {
      const randomHighRated = highRatedVisits[Math.floor(Math.random() * highRatedVisits.length)]
      const restaurant = restaurants.find((r) => r._id.toString() === randomHighRated.restaurantId)

      if (restaurant) {
        const groupText = currentGroupId ? "Your group loved" : "You loved"
        suggestions.push({
          type: "restaurant",
          message: `${groupText} ${restaurant.name} (${randomHighRated.overallRating}⭐). Consider visiting again!`,
        })
      }
    }

    // Suggest trying new restaurants
    const unvisitedRestaurants = restaurants.filter(
      (restaurant) => !visits.some((visit) => visit.restaurantId === restaurant._id.toString()),
    )

    if (unvisitedRestaurants.length > 0) {
      const randomUnvisited = unvisitedRestaurants[Math.floor(Math.random() * unvisitedRestaurants.length)]
      const groupText = currentGroupId ? "Your group hasn't tried" : "You haven't tried"
      suggestions.push({
        type: "restaurant",
        message: `${groupText} ${randomUnvisited.name} yet. Give it a shot!`,
      })
    }

    // Suggest favorite dishes
    const topDishes = Array.from(dishFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)

    if (topDishes.length > 0) {
      const favoriteDish = topDishes[0][0]
      const groupText = currentGroupId ? "Your group's" : "Your"
      suggestions.push({
        type: "dish",
        message: `${favoriteDish} is ${groupText} most ordered dish. Craving it again?`,
      })
    }

    return NextResponse.json(suggestions.slice(0, 5))
  } catch (error) {
    console.error("Error generating suggestions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function getDaysSinceLastCuisine(visits: any[], restaurants: any[], cuisineType: string): number {
  const cuisineVisits = visits.filter((visit) => {
    const restaurant = restaurants.find((r) => r._id.toString() === visit.restaurantId)
    return restaurant && restaurant.cuisineType === cuisineType
  })

  if (cuisineVisits.length === 0) return 999

  const lastVisit = cuisineVisits[0] // visits are sorted by date desc
  const daysDiff = Math.floor((Date.now() - new Date(lastVisit.date).getTime()) / (1000 * 60 * 60 * 24))
  return daysDiff
}
