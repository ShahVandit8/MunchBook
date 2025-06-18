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

    // Get all visits and restaurants
    const visits = await db.collection("visits").find(visitsQuery).sort({ date: 1 }).toArray()

    const restaurants = await db.collection("restaurants").find(restaurantsQuery).toArray()

    if (visits.length === 0) {
      return NextResponse.json({
        visitsByMonth: [],
        cuisineDistribution: [],
        ratingTrends: [],
        topRestaurants: [],
        topDishes: [],
        visitsByDayOfWeek: [],
        visitsByTimeOfDay: [],
      })
    }

    // Visits by month
    const visitsByMonth = getVisitsByMonth(visits)

    // Cuisine distribution
    const cuisineDistribution = getCuisineDistribution(visits, restaurants)

    // Rating trends
    const ratingTrends = getRatingTrends(visits)

    // Top restaurants
    const topRestaurants = getTopRestaurants(visits, restaurants)

    // Top dishes
    const topDishes = getTopDishes(visits)

    // Visits by day of week
    const visitsByDayOfWeek = getVisitsByDayOfWeek(visits)

    // Visits by time of day
    const visitsByTimeOfDay = getVisitsByTimeOfDay(visits)

    return NextResponse.json({
      visitsByMonth,
      cuisineDistribution,
      ratingTrends,
      topRestaurants,
      topDishes,
      visitsByDayOfWeek,
      visitsByTimeOfDay,
    })
  } catch (error) {
    console.error("Error generating analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function getVisitsByMonth(visits: any[]) {
  const monthCounts = new Map()

  visits.forEach((visit) => {
    const date = new Date(visit.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    monthCounts.set(monthKey, (monthCounts.get(monthKey) || 0) + 1)
  })

  return Array.from(monthCounts.entries())
    .map(([month, visits]) => ({ month, visits }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

function getCuisineDistribution(visits: any[], restaurants: any[]) {
  const cuisineCounts = new Map()

  visits.forEach((visit) => {
    const restaurant = restaurants.find((r) => r._id.toString() === visit.restaurantId)
    if (restaurant) {
      cuisineCounts.set(restaurant.cuisineType, (cuisineCounts.get(restaurant.cuisineType) || 0) + 1)
    }
  })

  const total = visits.length
  return Array.from(cuisineCounts.entries())
    .map(([cuisine, count]) => ({
      cuisine,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count)
}

function getRatingTrends(visits: any[]) {
  const monthlyRatings = new Map()

  visits.forEach((visit) => {
    const date = new Date(visit.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

    if (!monthlyRatings.has(monthKey)) {
      monthlyRatings.set(monthKey, [])
    }
    monthlyRatings.get(monthKey).push(visit.overallRating)
  })

  return Array.from(monthlyRatings.entries())
    .map(([month, ratings]) => ({
      month,
      avgRating: ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length,
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

function getTopRestaurants(visits: any[], restaurants: any[]) {
  const restaurantStats = new Map()

  visits.forEach((visit) => {
    const restaurantId = visit.restaurantId
    if (!restaurantStats.has(restaurantId)) {
      restaurantStats.set(restaurantId, { visits: 0, totalRating: 0 })
    }
    const stats = restaurantStats.get(restaurantId)
    stats.visits += 1
    stats.totalRating += visit.overallRating
  })

  return Array.from(restaurantStats.entries())
    .map(([restaurantId, stats]) => {
      const restaurant = restaurants.find((r) => r._id.toString() === restaurantId)
      return {
        name: restaurant?.name || "Unknown",
        visits: stats.visits,
        avgRating: stats.totalRating / stats.visits,
      }
    })
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 10)
}

function getTopDishes(visits: any[]) {
  const dishStats = new Map()

  visits.forEach((visit) => {
    visit.dishes.forEach((dish: any) => {
      if (!dishStats.has(dish.name)) {
        dishStats.set(dish.name, { count: 0, totalRating: 0 })
      }
      const stats = dishStats.get(dish.name)
      stats.count += 1
      stats.totalRating += dish.rating
    })
  })

  return Array.from(dishStats.entries())
    .map(([name, stats]) => ({
      name,
      count: stats.count,
      avgRating: stats.totalRating / stats.count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15)
}

function getVisitsByDayOfWeek(visits: any[]) {
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const dayCounts = new Array(7).fill(0)

  visits.forEach((visit) => {
    const date = new Date(visit.date)
    dayCounts[date.getDay()] += 1
  })

  return dayNames.map((day, index) => ({
    day,
    visits: dayCounts[index],
  }))
}

function getVisitsByTimeOfDay(visits: any[]) {
  const hourCounts = new Array(24).fill(0)

  visits.forEach((visit) => {
    const date = new Date(visit.date)
    hourCounts[date.getHours()] += 1
  })

  return hourCounts
    .map((visits, hour) => ({
      hour: `${hour}:00`,
      visits,
    }))
    .filter((item) => item.visits > 0)
}
