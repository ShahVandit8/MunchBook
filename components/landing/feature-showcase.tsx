"use client"

import { motion } from "framer-motion"
import { BarChart3, Users, Zap, Star } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts"

const analyticsData = [
  { month: "Jan", visits: 12 },
  { month: "Feb", visits: 19 },
  { month: "Mar", visits: 15 },
  { month: "Apr", visits: 25 },
  { month: "May", visits: 22 },
  { month: "Jun", visits: 30 },
]



export function FeatureShowcase() {
  return (
    <div className="space-y-32">
      {/* Analytics Feature */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
      >
        <div>
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              Analytics
            </Badge>
          </div>

          <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Discover patterns in your dining habits
          </h3>

          <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
            Get deep insights into your culinary preferences with beautiful charts and analytics. Track your favorite
            cuisines, discover dining patterns, and see your taste evolution over time.
          </p>

          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mr-3"></div>
              <span className="text-slate-700 dark:text-slate-300">Visual dining trends and patterns</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mr-3"></div>
              <span className="text-slate-700 dark:text-slate-300">Cuisine preference breakdown</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mr-3"></div>
              <span className="text-slate-700 dark:text-slate-300">Rating trends over time</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-3xl blur-3xl"></div>
          <Card className="relative p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-2xl">
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-4">Your Dining Analytics</h4>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="text-2xl font-bold text-orange-500">127</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Total Visits</div>
                </div>
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="text-2xl font-bold text-red-500">4.6</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Avg Rating</div>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={analyticsData}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Area
                    type="monotone"
                    dataKey="visits"
                    stroke="url(#gradient)"
                    fill="url(#gradient)"
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Group Collaboration Feature */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
      >
        <div className="order-2 lg:order-1 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-3xl blur-3xl"></div>
          <Card className="relative p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-2xl">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold">Family Food Adventures</h4>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  3 members
                </Badge>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                      J
                    </div>
                    <div>
                      <div className="font-medium">John added Pasta Palace</div>
                      <div className="text-sm text-slate-500">2 hours ago</div>
                    </div>
                  </div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                      S
                    </div>
                    <div>
                      <div className="font-medium">Sarah rated Sushi Zen</div>
                      <div className="text-sm text-slate-500">5 hours ago</div>
                    </div>
                  </div>
                  <div className="flex">
                    {[1, 2, 3, 4].map((star) => (
                      <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <Star className="w-4 h-4 text-gray-300" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg">
                  <div className="text-lg font-bold">42</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Shared Visits</div>
                </div>
                <div className="text-center p-2 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-lg">
                  <div className="text-lg font-bold">18</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Restaurants</div>
                </div>
                <div className="text-center p-2 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg">
                  <div className="text-lg font-bold">4.7</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Avg Rating</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="order-1 lg:order-2">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              Collaboration
            </Badge>
          </div>

          <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Share your culinary journey with loved ones
          </h3>

          <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
            Create groups with family and friends to collaboratively track restaurants and share reviews. Perfect for
            couples, families, or friend groups who love exploring food together.
          </p>

          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mr-3"></div>
              <span className="text-slate-700 dark:text-slate-300">Invite family and friends to your group</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mr-3"></div>
              <span className="text-slate-700 dark:text-slate-300">Shared restaurant database and reviews</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mr-3"></div>
              <span className="text-slate-700 dark:text-slate-300">Collaborative analytics and insights</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Smart Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
      >
        <div>
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              Personalized
            </Badge>
          </div>

          <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Get personalized restaurant recommendations
          </h3>

          <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
            Our intelligent recommendation engine learns from your dining history to suggest new restaurants you'll love
            and remind you of favorites you haven't visited in a while.
          </p>

          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-3"></div>
              <span className="text-slate-700 dark:text-slate-300">Smart suggestions based on your preferences</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-3"></div>
              <span className="text-slate-700 dark:text-slate-300">Discover new cuisines and hidden gems</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-3"></div>
              <span className="text-slate-700 dark:text-slate-300">Reminders for restaurants you loved</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-3xl"></div>
          <Card className="relative p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-2xl">
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-purple-500" />
                Today's Suggestions
              </h4>

              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">🍝 Try Italian cuisine</div>
                    <Badge variant="secondary" className="text-xs">
                      New
                    </Badge>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    You haven't had Italian in 12 days. Time to try it again!
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-200/50 dark:border-orange-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">🍣 Revisit Sushi Zen</div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    You rated this 5⭐ last month. Perfect for another visit!
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl border border-green-200/50 dark:border-green-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">🌮 Explore Taco Heaven</div>
                    <Badge variant="secondary" className="text-xs">
                      Trending
                    </Badge>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    You haven't tried this Mexican spot yet. Give it a shot!
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}
