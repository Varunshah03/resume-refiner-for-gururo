import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { auth, db } from "@/firebase.js";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged, deleteUser } from "firebase/auth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./components/Login";
import Signup from "./components/Signup";
import UserProfile from "./components/UserProfile";
import UploadSection from "./components/UploadSection";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SpeedInsights } from '@vercel/speed-insights/react';

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

const queryClient = new QueryClient();

const App = () => {
  const [userData, setUserData] = useState<UserProfileData | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        const userData: UserProfileData = {
          userId: firebaseUser.uid,
          googleId: firebaseUser.providerData[0]?.providerId || "",
          firstName: firebaseUser.displayName?.split(" ")[0] || "",
          lastName: firebaseUser.displayName?.split(" ")[1] || "",
          email: firebaseUser.email || "",
          username: firebaseUser.displayName?.replace(/\s/g, "").toLowerCase() || `user${firebaseUser.uid.slice(0, 8)}`,
          phone: userSnap.exists() ? userSnap.data().phone || "" : "",
          location: userSnap.exists() ? userSnap.data().location || "" : "",
          createdAt: userSnap.exists() ? userSnap.data().createdAt || new Date().toISOString() : new Date().toISOString(),
          updatedAt: userSnap.exists() ? userSnap.data().updatedAt || new Date().toISOString() : new Date().toISOString(),
        };

        if (!userSnap.exists()) {
          await setDoc(userRef, {
            ...userData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
        setUserData(userData);
      } else {
        setUserData(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async (updatedUser: Partial<UserProfileData>) => {
    if (!auth.currentUser) return;
    const userRef = doc(db, "users", auth.currentUser.uid);
    await setDoc(userRef, updatedUser, { merge: true });
    setUserData((prev) => ({ ...prev, ...updatedUser } as UserProfileData));
  };

  const handleDelete = async () => {
    if (!auth.currentUser) return;
    try {
      await deleteUser(auth.currentUser);
      setUserData(null);
    } catch (error: any) {
      throw new Error(error.message || "Failed to delete account");
    }
  };

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("resume", file);
    try {
      const response = await fetch("http://localhost:3001/api/analyze-resume", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to analyze resume");
      const result = await response.json();
      console.log("Resume analysis:", result);
      return result;
    } catch (error: any) {
      throw new Error(error.message || "Failed to analyze resume");
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  {userData ? (
                    <UserProfile user={userData} onSave={handleSave} onDeleteAccount={handleDelete} />
                  ) : (
                    <Navigate to="/login" replace />
                  )}
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  {userData ? (
                    <UploadSection onFileUpload={handleFileUpload} />
                  ) : (
                    <Navigate to="/login" replace />
                  )}
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <SpeedInsights />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;