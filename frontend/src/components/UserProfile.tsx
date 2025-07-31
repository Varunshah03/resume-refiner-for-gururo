import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/firebase.js";
import { updateProfile, deleteUser, signOut } from "firebase/auth";
import { Edit2, Save, X, MapPin, Mail, Phone, Calendar, Trash2, LogOut, Settings, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UserProfileData {
  userId: string;
  googleId: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phone?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserProfileProps {
  user: UserProfileData;
  onSave: (updatedUser: Partial<UserProfileData>) => Promise<void>;
  onDeleteAccount?: () => Promise<void>;
}

export default function UserProfile({ 
  user, 
  onSave, 
  onDeleteAccount,
}: UserProfileProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editedData, setEditedData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    phone: user.phone || "",
    location: user.location || ""
  });

  const validateUsername = (username: string) => {
    if (!username || username.length < 3) {
      toast({
        title: "Invalid Username",
        description: "Username must be at least 3 characters long.",
        variant: "destructive",
      });
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      toast({
        title: "Invalid Username",
        description: "Username can only contain letters, numbers, and underscores.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateUsername(editedData.username)) return;

    setIsLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await updateProfile(currentUser, {
          displayName: `${editedData.firstName} ${editedData.lastName}`
        });
      }

      await onSave({
        ...editedData,
        updatedAt: new Date().toISOString()
      });
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      console.error("Save error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedData({
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      phone: user.phone || "",
      location: user.location || ""
    });
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate("/login");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatMemberSince = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card className="bg-gradient-card border-border/50 shadow-card transition-smooth hover:shadow-glow/20">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Profile</CardTitle>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button 
                    onClick={handleSave} 
                    variant="gradient"
                    size="sm" 
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                  <Button 
                    onClick={handleCancel} 
                    variant="outline" 
                    size="sm" 
                    disabled={isLoading}
                    className="gap-2 border-border hover:border-primary/50"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => setIsEditing(true)} 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 border-border hover:border-primary/50"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex flex-col items-center space-y-3">
              <Badge variant="secondary" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                Member since {formatMemberSince(user.createdAt)}
              </Badge>
            </div>

            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  {isEditing ? (
                    <Input
                      id="firstName"
                      value={editedData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={isLoading}
                    />
                  ) : (
                    <p className="mt-1 text-sm font-medium">{user.firstName}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  {isEditing ? (
                    <Input
                      id="lastName"
                      value={editedData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={isLoading}
                    />
                  ) : (
                    <p className="mt-1 text-sm font-medium">{user.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <Label>Email Address</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.email}</span>
                  <Badge variant="secondary" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              </div>

              <div>
                <Label htmlFor="username">Username</Label>
                {isEditing ? (
                  <Input
                    id="username"
                    value={editedData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    disabled={isLoading}
                  />
                ) : (
                  <p className="mt-1 text-sm">@{user.username}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  value={editedData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Optional"
                  disabled={isLoading}
                />
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.phone || "Not provided"}</span>
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              {isEditing ? (
                <Input
                  id="location"
                  value={editedData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="City, Country"
                  disabled={isLoading}
                />
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.location || "Not provided"}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-card border-border/50 shadow-card transition-smooth hover:shadow-glow/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {onDeleteAccount && (
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-destructive">Delete Account</h4>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all data
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={async () => {
                  try {
                    setIsLoading(true);
                    await onDeleteAccount();
                    toast({
                      title: "Account Deleted",
                      description: "Your account has been successfully deleted.",
                    });
                  } catch (error: any) {
                    console.error("Delete account error:", error);
                    toast({
                      title: "Error",
                      description: error.message || "Failed to delete account. Please try again.",
                      variant: "destructive"
                    });
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="gap-2"
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Log Out</h4>
              <p className="text-sm text-muted-foreground">
                Sign out of your account
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2 border-border hover:border-primary/50"
              disabled={isLoading}
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}