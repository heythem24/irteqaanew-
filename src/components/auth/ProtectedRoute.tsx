import React, { useMemo } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { UsersService as UserService } from '../../services/firestoreService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
  requiredClubId?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredClubId
}) => {
  const location = useLocation();
  const params = useParams();

  // Use useMemo to prevent recalculating on every render
  const redirectInfo = useMemo(() => {
    // Check if user is authenticated
    if (!UserService.isAuthenticated()) {
      return { shouldRedirect: true, to: "/login", state: { from: location } };
    }

    const currentUser = UserService.getCurrentUser();

    // Check if user exists
    if (!currentUser) {
      return { shouldRedirect: true, to: "/login", state: { from: location } };
    }

    // Check if user is active
    if (!currentUser.isActive) {
      return { shouldRedirect: true, to: "/login", state: { from: location, error: 'حسابك غير نشط' } };
    }

    // Check if user has required role
    if (requiredRole) {
      const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      if (!requiredRoles.includes(currentUser.role)) {
        return { shouldRedirect: true, to: "/login", state: { from: location, error: 'غير مصرح لك بالوصول' } };
      }
    }

    // Check if user belongs to a club (for club-specific roles)
    if (requiredClubId) {
      // Get the actual clubId from URL parameters if requiredClubId is ":clubId"
      const routeClubId = requiredClubId === ":clubId" ? params.clubId : requiredClubId;

      // If user doesn't have a clubId assigned, show error
      if (!currentUser.clubId) {
        return { shouldRedirect: true, to: "/login", state: { from: location, error: 'لم يتم تعيينك لأي نادي. يرجى التواصل مع المشرف.' } };
      }

      // If routeClubId is provided and it doesn't match user's clubId, show error
      if (routeClubId && currentUser.clubId !== routeClubId) {
        return { shouldRedirect: true, to: "/login", state: { from: location, error: 'غير مصرح لك بالوصول لهذا النادي' } };
      }
    }

    return { shouldRedirect: false };
  }, [location, params, requiredRole, requiredClubId]);

  if (redirectInfo.shouldRedirect) {
    return <Navigate to={redirectInfo.to as any} state={redirectInfo.state} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;