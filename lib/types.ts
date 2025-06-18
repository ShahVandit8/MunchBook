export interface User {
  _id?: string
  email: string
  name: string
  password?: string
  createdAt: Date
  currentGroupId?: string
}

export interface Restaurant {
  _id?: string
  name: string
  cuisineType: string
  location?: string
  userId: string
  groupId?: string
  createdAt: Date
  averageRating?: number
  totalVisits?: number
}

export interface DishReview {
  name: string
  rating: number
  review?: string
}

export interface Visit {
  _id?: string
  restaurantId: string
  userId: string
  groupId?: string 
  addedBy: string 
  addedByName: string 
  date: Date
  overallRating: number
  overallReview: string
  dishes: DishReview[]
  createdAt: Date
  restaurant?: Restaurant
}

export interface Suggestion {
  type: "cuisine" | "restaurant" | "dish"
  message: string
  data?: any
}

export interface Group {
  _id?: string
  name: string
  description?: string
  createdBy: string
  members: GroupMember[]
  createdAt: Date
  inviteCode: string
}

export interface GroupMember {
  userId: string
  email: string
  name: string
  role: "admin" | "member"
  joinedAt: Date
}

export interface GroupInvite {
  _id?: string
  groupId: string
  invitedBy: string
  invitedEmail: string
  inviteCode: string
  status: "pending" | "accepted" | "declined"
  createdAt: Date
  expiresAt: Date
}
