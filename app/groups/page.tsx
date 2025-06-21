"use client"

import { useAuth } from "@/components/auth-provider"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import type { Group } from "@/lib/types"
import { Users, Copy, UserPlus, Crown, Calendar, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function GroupsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [groups, setGroups] = useState<Group[]>([])
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null)
  const [inviteEmail, setInviteEmail] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchGroups()
    }
  }, [user])

  const fetchGroups = async () => {
    try {
      const response = await fetch("/api/groups")
      if (response.ok) {
        const data = await response.json()
        setGroups(data.groups)
        setCurrentGroup(data.currentGroup)
      }
    } catch (error) {
      console.error("Failed to fetch groups:", error)
    } finally {
      setLoading(false)
    }
  }

  const copyInviteCode = async (inviteCode: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(inviteCode)
      } else {
        // Fallback for insecure context or unsupported clipboard API (e.g., some mobile browsers)
        const textArea = document.createElement("textarea")
        textArea.value = inviteCode
        // Avoid scrolling to bottom
        textArea.style.position = "fixed"
        textArea.style.left = "-9999px"
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
      }
      toast({ title: "Invite code copied to clipboard!" })
    } catch (err) {
      toast({ title: "Failed to copy invite code", variant: "destructive" })
    }
  }

  const inviteMember = async (groupId: string) => {
    if (!inviteEmail.trim()) {
      toast({
        title: "Error",
        description: "Email is required",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/groups/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, email: inviteEmail }),
      })

      if (response.ok) {
        toast({ title: "Invitation sent successfully!" })
        setInviteEmail("")
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to send invitation")
      }
    } catch (error: any) {
      console.error("Failed to invite member:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
      })
    }
  }

  const removeMember = async (groupId: string, userId: string) => {
    try {
      const response = await fetch("/api/groups/members", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, userId }),
      })

      if (response.ok) {
        toast({ title: "Member removed successfully!" })
        fetchGroups() // Refresh data
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to remove member")
      }
    } catch (error: any) {
      console.error("Failed to remove member:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to remove member",
        variant: "destructive",
      })
    }
  }

  const leaveGroup = async (groupId: string) => {
    try {
      const response = await fetch("/api/groups/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId }),
      })

      if (response.ok) {
        toast({ title: "Left group successfully!" })
        fetchGroups() // Refresh data
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to leave group")
      }
    } catch (error: any) {
      console.error("Failed to leave group:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to leave group",
        variant: "destructive",
      })
    }
  }

  if (!user) return null

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">Loading groups...</p>
          </div>
        </div>
      </div>
    )
  }

  const isAdmin = (group: Group) => {
    return group.members.find((m) => m.userId === user._id)?.role === "admin"
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Groups</h1>
          <p className="text-muted-foreground">Manage your dining groups and collaborate on restaurant reviews</p>
        </div>

        {/* Current Group */}
        {currentGroup && (
          <Card className="mb-8 border-orange-500">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {currentGroup.name}
                    <Badge variant="secondary">Current</Badge>
                  </CardTitle>
                  <CardDescription className="mt-2">{currentGroup.description}</CardDescription>
                </div>
                <div className="flex gap-2 mt-2 sm:mt-0">
                  <Button variant="outline" size="sm" onClick={() => copyInviteCode(currentGroup.inviteCode)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Invite Code
                  </Button>
                  {isAdmin(currentGroup) && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-orange-500 text-white hover:bg-orange-600">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Invite Member
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Invite Member</DialogTitle>
                          <DialogDescription>Send an invitation to join {currentGroup.name}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="invite-email">Email Address</Label>
                            <Input
                              id="invite-email"
                              type="email"
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                              placeholder="Enter email address"
                            />
                          </div>
                          <Button onClick={() => inviteMember(currentGroup._id!)} className="w-full bg-orange-500 hover:bg-orange-500 text-white">
                            Send Invitation
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3">Members ({currentGroup.members.length})</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentGroup.members.map((member) => (
                      <div key={member.userId} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium flex items-center gap-2">
                              {member.name}
                              {member.role === "admin" && <Crown className="h-4 w-4 text-yellow-500" />}
                            </p>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={member.role === "admin" ? "bg-green-500 text-white hover:bg-green-500" : "bg-grey-400 text-white hover:bg-grey-400"}>{member.role}</Badge>
                          {isAdmin(currentGroup) && member.userId !== user._id && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Member</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove {member.name} from the group?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => removeMember(currentGroup._id!, member.userId)}>
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Created {new Date(currentGroup.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Copy className="h-4 w-4 cursor-pointer hover:text-white" onClick={() => copyInviteCode(currentGroup.inviteCode)} />
                    Invite Code: {currentGroup.inviteCode}
                  </div>
                  {!isAdmin(currentGroup) && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          Leave Group
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Leave Group</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to leave {currentGroup.name}? You'll lose access to all shared data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => leaveGroup(currentGroup._id!)}>
                            Leave Group
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Groups */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Card key={group._id} className={group._id === currentGroup?._id ? "opacity-50" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {group.name}
                </CardTitle>
                <CardDescription>{group.description || "No description"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Members</span>
                    <Badge variant="secondary">{group.members.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Your Role</span>
                    <Badge variant={isAdmin(group) ? "default" : "secondary"}>
                      {group.members.find((m) => m.userId === user._id)?.role || "member"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Created</span>
                    <span className="text-sm">{new Date(group.createdAt).toLocaleDateString()}</span>
                  </div>
                  {group._id !== currentGroup?._id && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        // Switch to this group
                        fetch("/api/groups/switch", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ groupId: group._id }),
                        }).then(() => {
                          window.location.reload()
                        })
                      }}
                    >
                      Switch to Group
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {groups.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">You're not part of any groups yet</p>
                <p className="text-sm text-muted-foreground">
                  Create a group or ask someone to invite you to start collaborating!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
