"use client"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import type { Group } from "@/lib/types"
import { Users, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export function GroupSelector() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [groups, setGroups] = useState<Group[]>([])
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showJoinDialog, setShowJoinDialog] = useState(false)
  const [newGroup, setNewGroup] = useState({ name: "", description: "" })
  const [inviteCode, setInviteCode] = useState("")
  const [loading, setLoading] = useState(false)

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
    }
  }

  const createGroup = async () => {
    if (!newGroup.name.trim()) {
      toast({
        title: "Error",
        description: "Group name is required",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGroup),
      })

      if (response.ok) {
        const group = await response.json()
        setGroups([...groups, group])
        setCurrentGroup(group)
        setShowCreateDialog(false)
        setNewGroup({ name: "", description: "" })
        toast({ title: "Group created successfully!" })

        // Refresh the page to update all data
        window.location.reload()
      } else {
        throw new Error("Failed to create group")
      }
    } catch (error) {
      console.error("Failed to create group:", error)
      toast({
        title: "Error",
        description: "Failed to create group",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const joinGroup = async () => {
    if (!inviteCode.trim()) {
      toast({
        title: "Error",
        description: "Invite code is required",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode }),
      })

      if (response.ok) {
        const group = await response.json()
        setGroups([...groups, group])
        setCurrentGroup(group)
        setShowJoinDialog(false)
        setInviteCode("")
        toast({ title: "Successfully joined group!" })

        // Refresh the page to update all data
        window.location.reload()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to join group")
      }
    } catch (error: any) {
      console.error("Failed to join group:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to join group",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const switchGroup = async (groupId: string) => {
    try {
      const response = await fetch("/api/groups/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId }),
      })

      if (response.ok) {
        const group = groups.find((g) => g._id === groupId) || null
        setCurrentGroup(group)
        toast({ title: `Switched to ${group?.name || "Personal"}` })

        // Refresh the page to update all data
        window.location.reload()
      }
    } catch (error) {
      console.error("Failed to switch group:", error)
      toast({
        title: "Error",
        description: "Failed to switch group",
        variant: "destructive",
      })
    }
  }

  if (!user) return null

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentGroup?._id || "personal"}
        onValueChange={(value) => switchGroup(value === "personal" ? "" : value)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select group" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="personal">
            <div className="flex items-center gap-2">
              <span>Personal</span>
              <Badge variant="outline" className="text-xs">
                Solo
              </Badge>
            </div>
          </SelectItem>
          {groups.map((group) => (
            <SelectItem key={group._id} value={group._id!}>
              <div className="flex items-center gap-2">
                <Users className="h-3 w-3" />
                <span>{group.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {group.members.length}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogDescription>Create a group to share restaurant reviews with family and friends</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="group-name">Group Name</Label>
              <Input
                id="group-name"
                value={newGroup.name}
                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                placeholder="e.g., Family Food Adventures"
              />
            </div>
            <div>
              <Label htmlFor="group-description">Description (Optional)</Label>
              <Textarea
                id="group-description"
                value={newGroup.description}
                onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                placeholder="Describe your group..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={createGroup} disabled={loading} className="flex-1 bg-orange-500 text-white hover:bg-orange-600">
                Create Group
              </Button>
              <Button variant="outline" onClick={() => setShowJoinDialog(true)} disabled={loading}>
                Join Group
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Group</DialogTitle>
            <DialogDescription>Enter the invite code shared by a group member</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="invite-code">Invite Code</Label>
              <Input
                id="invite-code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Enter invite code"
              />
            </div>
            <Button onClick={joinGroup} disabled={loading} className="w-full">
              Join Group
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
