"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Personal",
    price: "Free",
    description: "Perfect for individual food enthusiasts",
    features: [
      "Track unlimited restaurants",
      "Record detailed visits and reviews",
      "Basic analytics and insights",
      "Search and filter your history",
      "Mobile-friendly interface",
    ],
    cta: "Get Started Free",
    popular: false,
    gradient: "from-slate-500 to-slate-600",
  },
  {
    name: "Group",
    price: "$9",
    period: "/month",
    description: "Ideal for families and friend groups",
    features: [
      "Everything in Personal",
      "Create and manage groups",
      "Collaborative restaurant tracking",
      "Shared analytics and insights",
      "Group recommendations",
      "Priority support",
    ],
    cta: "Start Group Plan",
    popular: true,
    gradient: "from-orange-500 to-red-500",
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For serious food critics and bloggers",
    features: [
      "Everything in Group",
      "Advanced analytics and reporting",
      "Export data and reports",
      "API access for integrations",
      "Custom branding options",
      "Dedicated account manager",
    ],
    cta: "Go Pro",
    popular: false,
    gradient: "from-purple-500 to-pink-500",
  },
]

export function PricingSection() {
  return (
    <div>
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
          Choose your plan
        </h2>
        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Start free and upgrade as your culinary journey grows
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan, index) => (
          <Card
            key={plan.name}
            className={`relative p-8 ${
              plan.popular
                ? "border-2 border-orange-500 shadow-2xl scale-102"
                : "border border-slate-200 dark:border-slate-800"
            } bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1">
                  <Star className="w-4 h-4 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && <span className="text-slate-600 dark:text-slate-400">{plan.period}</span>}
              </div>
              <p className="text-slate-600 dark:text-slate-300">{plan.description}</p>
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-center">
                  <div
                    className={`w-5 h-5 bg-gradient-to-r ${plan.gradient} rounded-full flex items-center justify-center mr-3 flex-shrink-0`}
                  >
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              asChild
              className={`w-full ${
                plan.popular
                  ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  : "bg-gradient-to-r " + plan.gradient
              }`}
            >
              <Link href="/auth">{plan.cta}</Link>
            </Button>
          </Card>
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-slate-600 dark:text-slate-300 mb-4">
          All plans include a 14-day free trial. No credit card required.
        </p>
        <div className="flex justify-center space-x-8 text-sm text-slate-500 dark:text-slate-400">
          <span>✓ Cancel anytime</span>
          <span>✓ 24/7 support</span>
          <span>✓ Data export</span>
        </div>
      </div>
    </div>
  )
}
