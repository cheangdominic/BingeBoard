import LocationInfo from './../components/LocationInfo.jsx';
import ProfileImage from './../components/ProfileImage.jsx';
import LogoutButton from "./LogoutButton.jsx";


function ProfileCard({ user, profilePic, isOwnProfile }) {
  if (!user) return null;

  return (
    <section className="bg-[#2E2E2E] rounded-lg shadow-lg p-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <ProfileImage
          src={profilePic}
          alt={`${user.username}'s profile`}
          size="lg"
          isOwnProfile={isOwnProfile}
        />
        <div>
          <h2 className="text-2xl font-bold">@{user.username}</h2>
          <p className="text-gray-400 text-sm">12 Connections</p>
          <p className="text-gray-400 text-sm">2 Groups</p>
        </div>
      </div>
        <LogoutButton/>

      {isOwnProfile && (
        <>
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            Settings
          </button>
          <LocationInfo />
        </>
      )}
    </section>
  );
}

export default ProfileCard;
