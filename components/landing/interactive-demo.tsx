"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Calendar, Users, BarChart3 } from "lucide-react"

const demoSteps = [
  {
    id: "track",
    title: "Track Your Visits",
    description: "Log restaurants and rate your experiences",
    icon: Calendar,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "analyze",
    title: "Analyze Patterns",
    description: "Discover insights about your dining habits",
    icon: BarChart3,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "collaborate",
    title: "Share with Groups",
    description: "Collaborate with family and friends",
    icon: Users,
    color: "from-green-500 to-emerald-500",
  },
]

export function InteractiveDemo() {
  const [activeStep, setActiveStep] = useState("track")

  const renderDemoContent = () => {
    switch (activeStep) {
      case "track":
        return (
          <div className="space-y-4">
            <div className="md:flex block items-center justify-between p-4 space-y-4 md:space-y-0 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-white font-bold">🍝</span>
                </div>
                <div>
                  <h4 className="font-semibold">Pasta Palace</h4>
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                    <MapPin className="w-4 h-4 mr-1" />
                    Downtown • Italian
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex mr-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Badge variant="secondary">New</Badge>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <h5 className="font-medium mb-2">Latest Review</h5>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                "Amazing carbonara and excellent service. The atmosphere was perfect for our anniversary dinner."
              </p>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>3 dishes rated</span>
                <span>Visited 2 days ago</span>
              </div>
            </div>
          </div>
        )

      case "analyze":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">127</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Total Visits</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                <div className="text-2xl font-bold text-purple-600">4.6</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Avg Rating</div>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <h5 className="font-medium mb-3">Top Cuisines</h5>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Italian</span>
                  <div className="flex items-center">
                    <div className="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-full mr-2">
                      <div className="w-16 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                    </div>
                    <span className="text-sm text-slate-600 dark:text-slate-400">35%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Asian</span>
                  <div className="flex items-center">
                    <div className="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-full mr-2">
                      <div className="w-12 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                    </div>
                    <span className="text-sm text-slate-600 dark:text-slate-400">25%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case "collaborate":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-800/50">
              <div>
                <h5 className="font-medium">Family Food Adventures</h5>
                <div className="text-sm text-slate-600 dark:text-slate-400">3 active members</div>
              </div>
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Active</Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                  S
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Sarah added Sushi Zen</div>
                  <div className="text-xs text-slate-500">2 hours ago</div>
                </div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>

              <div className="flex items-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                  M
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Mike rated Taco Heaven</div>
                  <div className="text-xs text-slate-500">5 hours ago</div>
                </div>
                <div className="flex">
                  {[1, 2, 3, 4].map((star) => (
                    <Star key={star} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  ))}
                  <Star className="w-3 h-3 text-gray-300" />
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
          See it in action
        </h2>
        <p className="text-xl text-slate-600 dark:text-slate-300">
          Experience how RestaurantTracker transforms your dining journey
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          {demoSteps.map((step) => {
            const Icon = step.icon
            const isActive = activeStep === step.id

            return (
              <motion.div
                key={step.id}
                className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                  isActive
                    ? "bg-white dark:bg-slate-800 shadow-xl border-2 border-orange-200 dark:border-orange-800"
                    : "bg-slate-50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
                }`}
                onClick={() => setActiveStep(step.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center mr-4`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{step.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400">{step.description}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-3xl blur-3xl"></div>
          <Card className="relative p-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-0 shadow-2xl">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderDemoContent()}
            </motion.div>
          </Card>
        </div>
      </div>
    </div>
  )
}
