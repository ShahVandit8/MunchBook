"use client";

import { useAuth } from "@/components/auth-provider";
import { Navbar } from "@/components/navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/star-rating";
import { useEffect, useState } from "react";
import type { Restaurant, Visit, Suggestion } from "@/lib/types";
import Link from "next/link";
import {
  PlusCircle,
  TrendingUp,
  Calendar,
  MapPin,
  Lightbulb,
  ChefHat,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { stat } from "fs";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalVisits: 0,
    totalRestaurants: 0,
    averageRating: 0,
    favoriteRestaurant: null as Restaurant | null,
  });
  const [recentVisits, setRecentVisits] = useState<Visit[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, visitsRes, suggestionsRes] = await Promise.all([
        fetch("/api/dashboard/stats"),
        fetch("/api/visits?limit=5"),
        fetch("/api/suggestions"),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (visitsRes.ok) {
        const visitsData = await visitsRes.json();
        setRecentVisits(visitsData);
      }

      if (suggestionsRes.ok) {
        const suggestionsData = await suggestionsRes.json();
        setSuggestions(suggestionsData);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRandomSuggestion = async () => {
    try {
      const response = await fetch("/api/suggestions/random");
      if (response.ok) {
        const suggestion = await response.json();
        toast({
          title: "🎯 Suggestion for today!",
          description: suggestion.message,
        });
      }
    } catch (error) {
      console.error("Failed to get suggestion:", error);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user.name}! 👋
          </h1>
          <p className="text-muted-foreground">
            Here's your dining journey overview
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-orange-500/20 to-purple-500/20 border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Visits
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <div className="text-2xl font-bold">{stats.totalVisits}</div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-blue-500/20 border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Restaurants</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <div className="text-2xl font-bold">
                  {stats.totalRestaurants}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Rating
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {stats.averageRating.toFixed(1)}
                  </div>
                  <StarRating
                  rating={Math.round(stats.averageRating)}
                  readonly
                  size="sm"
                />
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/20 to-rose-500/20 border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Favorite Spot
              </CardTitle>
              <ChefHat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <div className="text-sm font-medium truncate">
                  {stats.favoriteRestaurant?.name || "None yet"}
                </div>
              )}
              {stats.favoriteRestaurant && (
                <Badge variant="secondary" className="text-xs mt-2">
                  {stats.favoriteRestaurant.cuisineType}
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Visits */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="mb-2">Recent Visits</CardTitle>
                  <CardDescription>
                    Your latest dining experiences
                  </CardDescription>
                </div>
                <Button asChild size="sm" className="bg-orange-500 text-white hover:bg-orange-600">
                  <Link href="/visits/new">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Visit
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                { loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> :
                recentVisits.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      No visits recorded yet
                    </p>
                    <Button asChild className="bg-orange-500 text-white hover:bg-orange-600">
                      <Link href="/visits/new">Add your first visit</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentVisits.map((visit) => (
                      <div
                        key={visit._id}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-800/50"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium">
                            {visit.restaurant?.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(visit.date).toLocaleDateString()}
                          </p>
                          <div className="flex items-center mt-2">
                            <StarRating
                              rating={visit.overallRating}
                              readonly
                              size="sm"
                            />
                            <span className="ml-2 text-sm text-muted-foreground">
                              {visit.dishes.length} dishes
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {visit.restaurant?.cuisineType}
                        </Badge>
                      </div>
                    ))}
                    <div className="text-center pt-4">
                      <Button variant="outline" asChild>
                        <Link href="/history">View All Visits</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Suggestions */}
          <div>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2" />
                    Suggestions
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Personalized recommendations
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-orange-500 text-white hover:bg-orange-600"
                  onClick={getRandomSuggestion}
                >
                  Surprise Me!
                </Button>
              </CardHeader>
              <CardContent>
                { loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> :
                suggestions.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    Add more visits to get personalized suggestions!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {suggestions.slice(0, 3).map((suggestion, index) => (
                      <div key={index} 
                      className={suggestion.type=='cuisine'?'p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50'
                        : suggestion.type=='restaurant'?'p-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-200/50 dark:border-orange-800/50'
                        : suggestion.type=='dish' ? 'p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl border border-green-200/50 dark:border-green-800/50' : ''
                      }
                      >
                        <p className="text-sm font-light">{suggestion.message}</p>
                        <Badge variant="secondary" className="mt-2 text-xs font-light">
                          {suggestion.type.toUpperCase()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild className="w-full justify-start bg-orange-500 text-white hover:bg-orange-600">
                  <Link href="/visits/new">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add New Visit
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Link href="/analytics">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Analytics
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Link href="/search">
                    <MapPin className="h-4 w-4 mr-2" />
                    Find Restaurants
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
