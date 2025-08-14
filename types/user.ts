export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  roles: string[];
  phone?: string;
  gender?: string;
  dob?: string;
  address?: string;
  rewardPoints?: number;
  taskerInfo?: {
    avgRating?: number;
    completedJobs?: number;
    bio?: string;
  };
}
