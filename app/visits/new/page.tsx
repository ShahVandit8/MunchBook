"use client"

import type React from "react"

import { useAuth } from "@/components/auth-provider"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StarRating } from "@/components/star-rating"
import { useState, useEffect } from "react"
import type { Restaurant, DishReview } from "@/lib/types"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Plus, Trash2, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const cuisineTypes = [
  "South Indian",
  "North Indian",
  "Indo-Chinese",
  "Italian",
  "Mexican",
  "Thai",
  "Japanese",
  "American",
  "Mediterranean",
  "Fast Food",
  "Other",
]

export default function NewVisit() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState("")
  const [isNewRestaurant, setIsNewRestaurant] = useState(false)
  const [newRestaurant, setNewRestaurant] = useState({
    name: "",
    cuisineType: "",
    location: "",
  })

  const [visitData, setVisitData] = useState({
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().split(" ")[0].slice(0, 5),
    overallRating: 0,
    overallReview: "",
  })

  const [dishes, setDishes] = useState<DishReview[]>([{ name: "", rating: 0, review: "" }])

  const [loading, setLoading] = useState(false)
  const [showNewRestaurantDialog, setShowNewRestaurantDialog] = useState(false)

  useEffect(() => {
    if (user) {
      fetchRestaurants()
    }
  }, [user])

  const fetchRestaurants = async () => {
    try {
      const response = await fetch("/api/restaurants")
      if (response.ok) {
        const data = await response.json()
        setRestaurants(data)
      }
    } catch (error) {
      console.error("Failed to fetch restaurants:", error)
    }
  }

  const addDish = () => {
    setDishes([...dishes, { name: "", rating: 0, review: "" }])
  }

  const removeDish = (index: number) => {
    if (dishes.length > 1) {
      setDishes(dishes.filter((_, i) => i !== index))
    }
  }

  const updateDish = (index: number, field: keyof DishReview, value: string | number) => {
    const updatedDishes = [...dishes]
    updatedDishes[index] = { ...updatedDishes[index], [field]: value }
    setDishes(updatedDishes)
  }

  const createNewRestaurant = async () => {
    if (!newRestaurant.name || !newRestaurant.cuisineType) {
      toast({
        title: "Error",
        description: "Please fill in restaurant name and cuisine type",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRestaurant),
      })

      if (response.ok) {
        const restaurant = await response.json()
        setRestaurants([...restaurants, restaurant])
        setSelectedRestaurant(restaurant._id)
        setShowNewRestaurantDialog(false)
        setNewRestaurant({ name: "", cuisineType: "", location: "" })
        toast({ title: "Restaurant added successfully!" })
      }
    } catch (error) {
      console.error("Failed to create restaurant:", error)
      toast({
        title: "Error",
        description: "Failed to create restaurant",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedRestaurant) {
      toast({
        title: "Error",
        description: "Please select a restaurant",
        variant: "destructive",
      })
      return
    }

    if (visitData.overallRating === 0) {
      toast({
        title: "Error",
        description: "Please provide an overall rating",
        variant: "destructive",
      })
      return
    }

    const validDishes = dishes.filter((dish) => dish.name.trim() && dish.rating > 0)
    if (validDishes.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one dish with a rating",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const visitDateTime = new Date(`${visitData.date}T${visitData.time}`)

      const response = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: selectedRestaurant,
          date: visitDateTime,
          overallRating: visitData.overallRating,
          overallReview: visitData.overallReview,
          dishes: validDishes,
        }),
      })

      if (response.ok) {
        toast({ title: "Visit recorded successfully!" })
        router.push("/dashboard")
      } else {
        throw new Error("Failed to create visit")
      }
    } catch (error) {
      console.error("Failed to create visit:", error)
      toast({
        title: "Error",
        description: "Failed to record visit",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Add New Visit</h1>
          <p className="text-muted-foreground">Record your dining experience</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Restaurant Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Restaurant</CardTitle>
              <CardDescription>Select or add a new restaurant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a restaurant" />
                    </SelectTrigger>
                    <SelectContent>
                      {restaurants.map((restaurant) => (
                        <SelectItem key={restaurant._id} value={restaurant._id!}>
                          {restaurant.name} - {restaurant.cuisineType}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Dialog open={showNewRestaurantDialog} onOpenChange={setShowNewRestaurantDialog}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Restaurant</DialogTitle>
                      <DialogDescription>Create a new restaurant to add to your list</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="restaurant-name">Restaurant Name</Label>
                        <Input
                          id="restaurant-name"
                          value={newRestaurant.name}
                          onChange={(e) => setNewRestaurant({ ...newRestaurant, name: e.target.value })}
                          placeholder="Enter restaurant name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cuisine-type">Cuisine Type</Label>
                        <Select
                          value={newRestaurant.cuisineType}
                          onValueChange={(value) => setNewRestaurant({ ...newRestaurant, cuisineType: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select cuisine type" />
                          </SelectTrigger>
                          <SelectContent>
                            {cuisineTypes.map((cuisine) => (
                              <SelectItem key={cuisine} value={cuisine}>
                                {cuisine}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="location">Location (Optional)</Label>
                        <Input
                          id="location"
                          value={newRestaurant.location}
                          onChange={(e) => setNewRestaurant({ ...newRestaurant, location: e.target.value })}
                          placeholder="Enter location"
                        />
                      </div>
                      <Button type="button" onClick={createNewRestaurant} className="w-full">
                        Add Restaurant
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Visit Details */}
          <Card>
            <CardHeader>
              <CardTitle>Visit Details</CardTitle>
              <CardDescription>When did you visit and how was it overall?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={visitData.date}
                    onChange={(e) => setVisitData({ ...visitData, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={visitData.time}
                    onChange={(e) => setVisitData({ ...visitData, time: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Overall Rating</Label>
                <div className="mt-2">
                  <StarRating
                    rating={visitData.overallRating}
                    onRatingChange={(rating) => setVisitData({ ...visitData, overallRating: rating })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="overall-review">Overall Review</Label>
                <Textarea
                  id="overall-review"
                  value={visitData.overallReview}
                  onChange={(e) => setVisitData({ ...visitData, overallReview: e.target.value })}
                  placeholder="How was your overall experience?"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Dishes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Dishes</CardTitle>
                <CardDescription>Rate each dish you tried</CardDescription>
              </div>
              <Button type="button" onClick={addDish} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Dish
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {dishes.map((dish, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Dish {index + 1}</h4>
                    {dishes.length > 1 && (
                      <Button type="button" onClick={() => removeDish(index)} variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div>
                    <Label htmlFor={`dish-name-${index}`}>Dish Name</Label>
                    <Input
                      id={`dish-name-${index}`}
                      value={dish.name}
                      onChange={(e) => updateDish(index, "name", e.target.value)}
                      placeholder="Enter dish name"
                    />
                  </div>

                  <div>
                    <Label>Rating</Label>
                    <div className="mt-2">
                      <StarRating
                        rating={dish.rating}
                        onRatingChange={(rating) => updateDish(index, "rating", rating)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`dish-review-${index}`}>Review (Optional)</Label>
                    <Textarea
                      id={`dish-review-${index}`}
                      value={dish.review}
                      onChange={(e) => updateDish(index, "review", e.target.value)}
                      placeholder="How was this dish?"
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Record Visit
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
