import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, isFirebaseConfigured } from '@/lib/firebase';
import { Profile, Vehicle } from '@/types';

interface User {
  id: string;
  email: string;
  profile: Profile | null;
  vehicle: Vehicle | null;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<Profile>) => Promise<void>;
  updateVehicle: (vehicle: Partial<Vehicle>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data from Firestore
  const fetchUserData = async (fbUser: FirebaseUser): Promise<User> => {
    if (!db) {
      return {
        id: fbUser.uid,
        email: fbUser.email || '',
        profile: {
          id: fbUser.uid,
          role: 'user',
          full_name: fbUser.displayName || 'User',
          avatar_url: fbUser.photoURL || null,
          created_at: new Date().toISOString(),
        },
        vehicle: null,
      };
    }

    const userRef = doc(db, 'users', fbUser.uid);
    const userSnap = await getDoc(userRef);

    let profile: Profile | null = null;
    let vehicle: Vehicle | null = null;

    if (userSnap.exists()) {
      const data = userSnap.data();
      profile = data.profile || null;
      vehicle = data.vehicle || null;
    } else {
      profile = {
        id: fbUser.uid,
        role: 'user',
        full_name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
        avatar_url: fbUser.photoURL || null,
        created_at: new Date().toISOString(),
      };
      
      await setDoc(userRef, {
        profile,
        vehicle: null,
        createdAt: new Date().toISOString(),
      });
    }

    return {
      id: fbUser.uid,
      email: fbUser.email || '',
      profile,
      vehicle,
    };
  };

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      
      if (fbUser) {
        try {
          const userData = await fetchUserData(fbUser);
          setUser(userData);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser({
            id: fbUser.uid,
            email: fbUser.email || '',
            profile: {
              id: fbUser.uid,
              role: 'user',
              full_name: fbUser.displayName || 'User',
              avatar_url: fbUser.photoURL || null,
              created_at: new Date().toISOString(),
            },
            vehicle: null,
          });
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (!auth) {
      return { error: 'Firebase chưa được cấu hình' };
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      let message = 'Đã xảy ra lỗi khi đăng nhập';
      
      switch (firebaseError.code) {
        case 'auth/user-not-found':
          message = 'Email không tồn tại';
          break;
        case 'auth/wrong-password':
          message = 'Mật khẩu không đúng';
          break;
        case 'auth/invalid-email':
          message = 'Email không hợp lệ';
          break;
        case 'auth/too-many-requests':
          message = 'Quá nhiều lần thử. Vui lòng thử lại sau';
          break;
        case 'auth/invalid-credential':
          message = 'Email hoặc mật khẩu không đúng';
          break;
      }
      
      return { error: message };
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<{ error: string | null }> => {
    if (!auth) {
      return { error: 'Firebase chưa được cấu hình' };
    }

    try {
      const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      await firebaseUpdateProfile(newUser, { displayName: name });
      
      if (db) {
        const userRef = doc(db, 'users', newUser.uid);
        await setDoc(userRef, {
          profile: {
            id: newUser.uid,
            role: 'user',
            full_name: name,
            avatar_url: null,
            created_at: new Date().toISOString(),
          },
          vehicle: null,
          createdAt: new Date().toISOString(),
        });
      }
      
      return { error: null };
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      let message = 'Đã xảy ra lỗi khi đăng ký';
      
      switch (firebaseError.code) {
        case 'auth/email-already-in-use':
          message = 'Email đã được sử dụng';
          break;
        case 'auth/weak-password':
          message = 'Mật khẩu quá yếu (tối thiểu 6 ký tự)';
          break;
        case 'auth/invalid-email':
          message = 'Email không hợp lệ';
          break;
      }
      
      return { error: message };
    }
  };

  const signInWithGoogle = async (): Promise<{ error: string | null }> => {
    if (!auth) {
      return { error: 'Firebase chưa được cấu hình' };
    }

    try {
      await signInWithPopup(auth, googleProvider);
      return { error: null };
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      let message = 'Đã xảy ra lỗi khi đăng nhập với Google';
      
      if (firebaseError.code === 'auth/popup-closed-by-user') {
        message = 'Bạn đã đóng cửa sổ đăng nhập';
      }
      
      return { error: message };
    }
  };

  const signOut = async () => {
    if (auth) {
      await firebaseSignOut(auth);
    }
    setUser(null);
    setFirebaseUser(null);
  };

  const updateProfile = async (profileData: Partial<Profile>) => {
    if (!user || !firebaseUser || !db) return;

    const updatedProfile = { ...user.profile, ...profileData };
    
    const userRef = doc(db, 'users', firebaseUser.uid);
    await setDoc(userRef, { profile: updatedProfile }, { merge: true });
    
    setUser({ ...user, profile: updatedProfile as Profile });
  };

  const updateVehicle = async (vehicleData: Partial<Vehicle>) => {
    if (!user || !firebaseUser || !db) return;

    const updatedVehicle = user.vehicle
      ? { ...user.vehicle, ...vehicleData, updated_at: new Date().toISOString() }
      : {
          id: crypto.randomUUID(),
          user_id: firebaseUser.uid,
          name: 'My Vehicle',
          battery_kwh: 60,
          soc_current: 50,
          consumption_kwh_per_100km: 15,
          preferred_connector: 'CCS2' as const,
          updated_at: new Date().toISOString(),
          ...vehicleData,
        };

    const userRef = doc(db, 'users', firebaseUser.uid);
    await setDoc(userRef, { vehicle: updatedVehicle }, { merge: true });
    
    setUser({ ...user, vehicle: updatedVehicle as Vehicle });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        updateProfile,
        updateVehicle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
