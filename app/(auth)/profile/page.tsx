import { auth } from '@/auth';
import { SignoutButton } from '@/features/auth/components/signoutButton';
import { User } from '@/features/auth/type';

const Profile = async () => {
  // Check if user session exists
  const session = await auth();

  // Extract user details from session
  const user: User = session.user;

  return (
    <div className="flex flex-col gap-4 p-4">
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
      <img src={user.image} alt="User image" className="w-32 h-32 rounded-full object-cover" />
      <SignoutButton />
    </div>
  );
};

export default Profile;
