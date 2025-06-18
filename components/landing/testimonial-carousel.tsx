"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const testimonials = [
  {
    name: "Kenny Shah",
    role: "Food Blogger",
    avatar: "KS",
    content:
      "MunchBook has completely transformed how I document my dining experiences. The analytics feature helps me understand my preferences better than ever before.",
    rating: 5,
    color: "from-pink-500 to-rose-500",
  },
  {
    name: "Akshay Patel",
    role: "Foodie",
    avatar: "AP",
    content:
      "As a foodie, I love using this to track my favorite dishes. The group feature is perfect for my team to share discoveries.",
    rating: 5,
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Emily Rodriguez",
    role: "Travel Enthusiast",
    avatar: "ER",
    content:
      "Perfect for keeping track of all the amazing places I discover while traveling. The recommendations have led me to choose my forgotten favorite restaurants !",
    rating: 5,
    color: "from-green-500 to-emerald-500",
  },
  {
    name: "David Kim",
    role: "Food Critic",
    avatar: "DK",
    content:
      "The detailed tracking and analytics make this an essential tool for any serious food enthusiast. I can't imagine dining without it now.",
    rating: 5,
    color: "from-purple-500 to-violet-500",
  },
]

export function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <div className="relative max-w-4xl mx-auto">
      <div className="flex items-center justify-center mb-8">
        <Button variant="ghost" size="sm" onClick={prevTestimonial} className="mr-4">
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <div className="flex space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-gradient-to-r from-orange-500 to-red-500 w-8"
                  : "bg-slate-300 dark:bg-slate-600"
              }`}
            />
          ))}
        </div>

        <Button variant="ghost" size="sm" onClick={nextTestimonial} className="ml-4">
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      <div className="relative h-80 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <Card className="p-8 h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-2xl">
              <div className="flex flex-col items-center text-center h-full justify-center">
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${testimonials[currentIndex].color} rounded-full flex items-center justify-center text-white font-bold text-xl mb-6`}
                >
                  {testimonials[currentIndex].avatar}
                </div>

                <div className="flex mb-4">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <blockquote className="text-lg text-slate-700 dark:text-slate-300 mb-6 leading-relaxed max-w-2xl">
                  "{testimonials[currentIndex].content}"
                </blockquote>

                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">{testimonials[currentIndex].name}</div>
                  <div className="text-slate-600 dark:text-slate-400">{testimonials[currentIndex].role}</div>
                </div>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
