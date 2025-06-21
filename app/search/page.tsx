"use client"

import { useAuth } from "@/components/auth-provider"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { StarRating } from "@/components/star-rating"
import { useState, useEffect } from "react"
import type { Restaurant, Visit } from "@/lib/types"
import { Search, MapPin, Calendar } from "lucide-react"

export default function SearchPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [searchType, setSearchType] = useState("all")
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [visits, setVisits] = useState<Visit[]>([])
  const [dishes, setDishes] = useState<any[]>([])
  const [filteredResults, setFilteredResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  useEffect(() => {
    if (searchTerm) {
      performSearch()
    } else {
      setFilteredResults([])
    }
  }, [searchTerm, searchType, restaurants, visits, dishes])

  const fetchData = async () => {
    try {
      const [restaurantsRes, visitsRes] = await Promise.all([fetch("/api/restaurants"), fetch("/api/visits")])

      if (restaurantsRes.ok) {
        const restaurantsData = await restaurantsRes.json()
        setRestaurants(restaurantsData)
      }

      if (visitsRes.ok) {
        const visitsData = await visitsRes.json()
        setVisits(visitsData)

        // Extract unique dishes
        const allDishes = visitsData.flatMap((visit: Visit) =>
          visit.dishes.map((dish) => ({
            ...dish,
            restaurantName: visit.restaurant?.name,
            restaurantId: visit.restaurantId,
            visitDate: visit.date,
          })),
        )
        setDishes(allDishes)
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    }
  }

  const performSearch = () => {
    setLoading(true)
    const term = searchTerm.toLowerCase()
    let results: any[] = []

    if (searchType === "all" || searchType === "restaurants") {
      const matchingRestaurants = restaurants
        .filter(
          (restaurant) =>
            restaurant.name.toLowerCase().includes(term) ||
            restaurant.cuisineType.toLowerCase().includes(term) ||
            restaurant.location?.toLowerCase().includes(term),
        )
        .map((restaurant) => ({
          ...restaurant,
          type: "restaurant",
        }))
      results = [...results, ...matchingRestaurants]
    }

    if (searchType === "all" || searchType === "dishes") {
      const matchingDishes = dishes
        .filter((dish) => dish.name.toLowerCase().includes(term) || dish.review?.toLowerCase().includes(term))
        .map((dish) => ({
          ...dish,
          type: "dish",
        }))
      results = [...results, ...matchingDishes]
    }

    if (searchType === "all" || searchType === "visits") {
      const matchingVisits = visits
        .filter(
          (visit) =>
            visit.overallReview.toLowerCase().includes(term) || visit.restaurant?.name.toLowerCase().includes(term),
        )
        .map((visit) => ({
          ...visit,
          type: "visit",
        }))
      results = [...results, ...matchingVisits]
    }

    setFilteredResults(results)
    setLoading(false)
  }

  const RestaurantResult = ({ restaurant }: { restaurant: Restaurant & { type: string } }) => (
    <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-200/50 dark:border-orange-800/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">{restaurant.name}</h3>
            </div>
            <div className="grid sm:flex items-center gap-2 mb-2">
              <Badge variant="secondary">{restaurant.cuisineType}</Badge>
              {restaurant.location && <span className="text-sm text-muted-foreground">{restaurant.location}</span>}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{restaurant.totalVisits || 0} visits</span>
              {restaurant.averageRating && (
                <div className="flex items-center gap-1">
                  <StarRating rating={Math.round(restaurant.averageRating)} readonly size="sm" />
                  <span>{restaurant.averageRating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
          <Badge variant="outline">Restaurant</Badge>
        </div>
      </CardContent>
    </Card>
  )

  const DishResult = ({ dish }: { dish: any }) => (
    <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl border border-green-200/50 dark:border-green-800/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold mb-1">{dish.name}</h3>
            <p className="text-sm text-muted-foreground mb-2">at {dish.restaurantName}</p>
            <div className="flex items-center gap-2 mb-2">
              <StarRating rating={dish.rating} readonly size="sm" />
              <span className="text-sm">{dish.rating}/5</span>
            </div>
            {dish.review && <p className="text-sm text-muted-foreground line-clamp-2">{dish.review}</p>}
            <p className="text-xs text-muted-foreground mt-2">
              Tried on {new Date(dish.visitDate).toLocaleDateString()}
            </p>
          </div>
          <Badge variant="outline">Dish</Badge>
        </div>
      </CardContent>
    </Card>
  )

  const VisitResult = ({ visit }: { visit: Visit & { type: string } }) => (
    <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">{visit.restaurant?.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{new Date(visit.date).toLocaleDateString()}</p>
            <div className="flex items-center gap-2 mb-2">
              <StarRating rating={visit.overallRating} readonly size="sm" />
              <span className="text-sm">{visit.overallRating}/5</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{visit.overallReview}</p>
            <div className="flex flex-wrap gap-1">
              {visit.dishes.slice(0, 3).map((dish, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {dish.name}
                </Badge>
              ))}
              {visit.dishes.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{visit.dishes.length - 3} more
                </Badge>
              )}
            </div>
          </div>
          <Badge variant="outline">Visit</Badge>
        </div>
      </CardContent>
    </Card>
  )

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Search</h1>
          <p className="text-muted-foreground">Find restaurants, dishes, and past visits</p>
        </div>

        {/* Search Interface */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Your Dining History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search restaurants, dishes, reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={searchType} onValueChange={setSearchType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Search in" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="restaurants">Restaurants</SelectItem>
                  <SelectItem value="dishes">Dishes</SelectItem>
                  <SelectItem value="visits">Visits</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Searching...</p>
            </div>
          ) : searchTerm && filteredResults.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No results found for "{searchTerm}"</p>
              </CardContent>
            </Card>
          ) : filteredResults.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  Found {filteredResults.length} results for "{searchTerm}"
                </p>
              </div>

              {filteredResults.map((result, index) => (
                <div key={index}>
                  {result.type === "restaurant" && <RestaurantResult restaurant={result} />}
                  {result.type === "dish" && <DishResult dish={result} />}
                  {result.type === "visit" && <VisitResult visit={result} />}
                </div>
              ))}
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">Start typing to search</p>
                <p className="text-sm text-muted-foreground">
                  Search through your restaurants, dishes, and visit reviews
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
