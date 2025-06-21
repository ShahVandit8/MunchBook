"use client"

import { useAuth } from "@/components/auth-provider"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { StarRating } from "@/components/star-rating"
import { useState, useEffect } from "react"
import type { Visit, Restaurant } from "@/lib/types"
import { Search, Calendar, MapPin, ChefHat } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function History() {
  const { user } = useAuth()
  const [visits, setVisits] = useState<Visit[]>([])
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [filteredVisits, setFilteredVisits] = useState<Visit[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRestaurant, setSelectedRestaurant] = useState("")
  const [sortBy, setSortBy] = useState("date-desc")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  useEffect(() => {
    filterAndSortVisits()
  }, [visits, searchTerm, selectedRestaurant, sortBy])

  const fetchData = async () => {
    try {
      const [visitsRes, restaurantsRes] = await Promise.all([fetch("/api/visits"), fetch("/api/restaurants")])

      if (visitsRes.ok) {
        const visitsData = await visitsRes.json()
        setVisits(visitsData)
      }

      if (restaurantsRes.ok) {
        const restaurantsData = await restaurantsRes.json()
        setRestaurants(restaurantsData)
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortVisits = () => {
    let filtered = [...visits]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (visit) =>
          visit.restaurant?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          visit.overallReview.toLowerCase().includes(searchTerm.toLowerCase()) ||
          visit.dishes.some(
            (dish) =>
              dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              dish.review?.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      )
    }

    // Filter by restaurant
    if (selectedRestaurant) {
      filtered = filtered.filter((visit) => visit.restaurantId === selectedRestaurant)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case "rating-desc":
          return b.overallRating - a.overallRating
        case "rating-asc":
          return a.overallRating - b.overallRating
        case "restaurant":
          return (a.restaurant?.name || "").localeCompare(b.restaurant?.name || "")
        default:
          return 0
      }
    })

    setFilteredVisits(filtered)
  }

  const VisitDetailDialog = ({ visit }: { visit: Visit }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {visit.restaurant?.name}
          </DialogTitle>
          <DialogDescription>
            {new Date(visit.date).toLocaleDateString()} at {new Date(visit.date).toLocaleTimeString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-2">Overall Experience</h4>
            <div className="flex items-center gap-2 mb-2">
              <StarRating rating={visit.overallRating} readonly />
              <span className="text-sm text-muted-foreground">{visit.overallRating}/5</span>
            </div>
            {visit.overallReview && <p className="text-sm bg-muted p-3 rounded-lg">{visit.overallReview}</p>}
          </div>

          <div>
            <h4 className="font-medium mb-3">Dishes ({visit.dishes.length})</h4>
            <div className="space-y-3">
              {visit.dishes.map((dish, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium">{dish.name}</h5>
                    <div className="flex items-center gap-1">
                      <StarRating rating={dish.rating} readonly size="sm" />
                      <span className="text-xs text-muted-foreground">{dish.rating}/5</span>
                    </div>
                  </div>
                  {dish.review && <p className="text-sm text-muted-foreground">{dish.review}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Visit History</h1>
          <p className="text-muted-foreground">Browse and search through your dining experiences</p>
        </div>

        {/* Filters */}
        <Card className="mb-8" >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Input
                  placeholder="Search restaurants, dishes, or reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
                <SelectTrigger>
                  <SelectValue placeholder="All restaurants" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All restaurants</SelectItem>
                  {restaurants.map((restaurant) => (
                    <SelectItem key={restaurant._id} value={restaurant._id!}>
                      {restaurant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Newest first</SelectItem>
                  <SelectItem value="date-asc">Oldest first</SelectItem>
                  <SelectItem value="rating-desc">Highest rated</SelectItem>
                  <SelectItem value="rating-asc">Lowest rated</SelectItem>
                  <SelectItem value="restaurant">Restaurant name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading visits...</p>
            </div>
          ) : filteredVisits.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  {visits.length === 0 ? "No visits recorded yet" : "No visits match your search criteria"}
                </p>
                {visits.length === 0 && (
                  <Button asChild className="bg-orange-500 text-white hover:bg-orange-600">
                    <a href="/visits/new">Add your first visit</a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredVisits.length} of {visits.length} visits
                </p>
              </div>

              {filteredVisits.map((visit) => (
                <Card key={visit._id} className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-800/50">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{visit.restaurant?.name}</h3>
                          <Badge variant="secondary" className="w-fit">{visit.restaurant?.cuisineType}</Badge>
                        </div>

                        <div className="flex item-center gap-4 mb-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(visit.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <ChefHat className="h-4 w-4" />
                            {visit.dishes.length} dishes
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <StarRating rating={visit.overallRating} readonly size="sm" />
                          <span className="text-sm text-muted-foreground">{visit.overallRating}/5</span>
                        </div>

                        {visit.overallReview && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{visit.overallReview}</p>
                        )}

                        <div className="flex flex-wrap gap-2">
                          {visit.dishes.slice(0, 3).map((dish, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {dish.name} ({dish.rating}⭐)
                            </Badge>
                          ))}
                          {visit.dishes.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{visit.dishes.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0 flex justify-start">
                        <VisitDetailDialog visit={visit} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
