# BingeBoard

## 1. Project Title  
**BingeBoard**

## 2. Project Description (One Sentence Pitch)  
Due to people often feeling disconnected while watching shows alone and having trouble keeping track of what they've watched, we are creating BingeBoard, an app that helps users track their shows and connect with others. It makes watching TV more social, organized, and fun.

## 3. Technologies Used

### Front-End
- React  
- Tailwind CSS  
- HTML
- CSS

### Back-End
- Node.js  
- Express.js  
- MongoDB  
- JavaScript

### Middleware
- (Handled internally via Express.js, no separate middleware library used)

### Other Tech Tools
- Cloudinary – for image uploads  
- Joi – for backend validation  
- bcrypt – for password hashing  
- express-session – for session management  

## 4. Listing of File Contents of Folder
C:.<br>
|   .env<br>
|   .gitignore<br>
|   about.html<br>
|   eslint.config.js<br>
|   index.html<br>
|   package-lock.json<br>
|   package.json<br>
|   postcss.config.js<br>
|   README.md<br>
|   tailwind.config.js<br>
|   vite.config.js<br>
|<br>
+---public<br>
|   |   vite.svg<br>
|   |<br>
|   \---img<br>
|       +---favicon<br>
|       |       android-chrome-192x192.png<br>
|       |       android-chrome-512x512.png<br>
|       |       apple-touch-icon.png<br>
|       |       favicon-16x16.png<br>
|       |       favicon-32x32.png<br>
|       |       favicon.ico<br>
|       |<br>
|       \---profilePhotos<br>
|               alt_generic_profile_picture.jpg<br>
|               generic_profile_picture.jpg<br>
|<br>
\---src<br>
    |   App.css<br>
    |   App.jsx<br>
    |   index.css<br>
    |   main.jsx<br>
    |<br>
    +---assets<br>
    |       BingeBoard Icon.svg<br>
    |       browse_tv_icon.svg<br>
    |       dragonballsuper1.jpg<br>
    |       dragonballsuper2.jpg<br>
    |       facebook_footer_icon.svg<br>
    |       fallback.jpg<br>
    |       friend_feature_icon.svg<br>
    |       instagram_footer_icon.svg<br>
    |       person_statistics_icon.svg<br>
    |       react.svg<br>
    |       review_rating_icon.svg<br>
    |       severance-apple-tv-plus.jpg<br>
    |       team_icon.svg<br>
    |       tiktok_footer_icon.svg<br>
    |       watchlist_icon.svg<br>
    |       X_footer_icon.svg<br>
    |<br>
    +---backend<br>
    |       databaseConnection.js<br>
    |       friends.js<br>
    |       server.js<br>
    |       tmdb.js<br>
    |       useAuth.js<br>
    |       utils.js<br>
    |<br>
    +---components<br>
    |       ActivityCard.jsx<br>
    |       AppleRating.jsx<br>
    |       AppleRatingDisplay.jsx<br>
    |       BottomNavbar.jsx<br>
    |       ImageUploadModal.jsx<br>
    |       LoadingSpinner.jsx<br>
    |       LocationInfo.jsx<br>
    |       ProfileImage.jsx<br>
    |       ReviewCard.jsx<br>
    |       ShowCarousel.jsx<br>
    |       TVShowCard.jsx<br>
    |<br>
    +---context<br>
    |       AuthContext.jsx<br>
    |<br>
    +---frontend<br>
    |   |   NotFound.jsx<br>
    |   |<br>
    |   +---aboutus<br>
    |   |       AboutUsInfo.jsx<br>
    |   |       AboutUsPage.jsx<br>
    |   |<br>
    |   +---activity<br>
    |   |       ActivityCard.jsx<br>
    |   |       ActivityPage.jsx<br>
    |   |       ActivityPageHeader.jsx<br>
    |   |       ActivitySectionHeader.jsx<br>
    |   |<br>
    |   +---featurecards<br>
    |   |       BrowseFeature.jsx<br>
    |   |       SocialFeature.jsx<br>
    |   |       WatchlistFeature.jsx<br>
    |   |<br>
    |   +---friends<br>
    |   |       FriendListPage.jsx<br>
    |   |       FriendRequestsPage.jsx<br>
    |   |<br>
    |   +---home<br>
    |   |       FriendsRecentlyWatched.jsx<br>
    |   |       Home.jsx<br>
    |   |       PopularReviewsFiltered.jsx<br>
    |   |       RecommendedByFriends.jsx<br>
    |   |       TrendingCarousel.jsx<br>
    |   |<br>
    |   +---landing<br>
    |   |       FeatureCards.jsx<br>
    |   |       Footer.jsx<br>
    |   |       Landing.jsx<br>
    |   |       MottoBanner.jsx<br>
    |   |       PopularReviews.jsx<br>
    |   |       Statistics.jsx<br>
    |   |       TopNavbar.jsx<br>
    |   |<br>
    |   +---log<br>
    |   |       LogPage.jsx<br>
    |   |       ShowGrid.jsx<br>
    |   |<br>
    |   +---login<br>
    |   |       LoginForm.jsx<br>
    |   |       LoginPage.jsx<br>
    |   |<br>
    |   +---profile<br>
    |   |       LogoutButton.jsx<br>
    |   |       ProfileCard.jsx<br>
    |   |       ProfilePage.jsx<br>
    |   |       RecentlyWatched.jsx<br>
    |   |       RecentlyWatchedViewAll.jsx<br>
    |   |       RecentReviews.jsx<br>
    |   |       Watchlist.jsx<br>
    |   |       WatchlistCarousel.jsx<br>
    |   |       WatchlistViewAll.jsx<br>
    |   |<br>
    |   +---search<br>
    |   |       ChatBox.jsx<br>
    |   |       SearchBar.jsx<br>
    |   |       SearchPage.jsx<br>
    |   |       TVShowFilters.jsx<br>
    |   |       TvShowSearchGrid.jsx<br>
    |   |<br>
    |   +---showdetails<br>
    |   |   |   AddToWatchlistButton.jsx<br>
    |   |   |   EpisodeList.jsx<br>
    |   |   |   EpisodeListView.jsx<br>
    |   |   |   ReviewSection.jsx<br>
    |   |   |   ShowDescription.jsx<br>
    |   |   |   ShowDetailsPage.jsx<br>
    |   |   |   ShowHero.jsx<br>
    |   |   |<br>
    |   |   \---ReviewSection<br>
    |   |           ReviewCard.jsx<br>
    |   |           ReviewForm.jsx<br>
    |   |<br>
    |   +---signup<br>
    |   |       SignupForm.jsx<br>
    |   |       SignupPage.jsx<br>
    |   |<br>
    |   +---social<br>
    |   |       searchUsers.jsx<br>
    |   |       UserProfile.jsx<br>
    |   |<br>
    |   \---viewall<br>
    |           ViewAllPage.jsx<br>
    |<br>
    \---profile<br>
            ProfilePage.jsx<br>


## 5. Setup Instructions

To run the BingeBoard app locally, follow these steps:

### Prerequisites
- Node.js and npm installed
- MongoDB Atlas connection URI (or local MongoDB)
- Cloudinary account (for profile image uploads)
- An IDE or code editor that supports web development (e.g., **Visual Studio Code**, **WebStorm**, or similar)

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/cheangdominic/2800-202510-BBY12.git
cd 2800-202510-BBY12
```

2. **Install dependencies:**

```bash
npm install
```

3. **Set up environment variables:**

Create a `.env` file in the root directory with the following keys:

```ini
MONGODB_HOST=your_mongodb_host
MONGODB_USER=your_mongodb_user
MONGODB_PASSWORD=your_mongodb_password
MONGODB_DATABASE=your_mongodb_database
MONGODB_SESSION_SECRET=your_mongodb_session_secret
NODE_SESSION_SECRET=your_node_session_secret

VITE_TMDB_API_KEY=your_tmdb_api_key
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3

TMDB_API_KEY=your_tmdb_api_key
TMDB_BASE_URL=https://api.themoviedb.org/3

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

4. **Run the development server:**

```bash
npm run dev
```

5. **Access the app:**

Open your browser and go to `http://localhost:3000` (or the port shown in your terminal).

---

### Notes

- The MongoDB connection URI can be for a local MongoDB or MongoDB Atlas.
- You will need to sign up for a free Cloudinary account to get credentials for image uploads.
- The TMDB API key is required to fetch TV show data from The Movie Database API.

## 6. Testing Plan  
Testing has been performed using Jest and React Testing Library for frontend components, and Postman for backend API endpoints. Contributions to bug fixes and tests are welcome!

## 7. How to Use the Product (Features)  
- **User Authentication:** Sign up, log in, and manage profiles securely.  
- **Show Tracking:** Search for TV shows and add them to your personal watchlist.  
- **Social Features:** Connect with friends, see what they’re watching, and share reviews.  
- **Reviews & Ratings:** Write reviews, rate shows, and see aggregated ratings.  
- **Image Uploads:** Update profile pictures via Cloudinary integration.  
- **Activity Feed:** View recent activities from friends and popular reviews.  
- **Responsive Design:** Works well on desktop and mobile devices with smooth UI.  

## 8. Credits, References, and Licenses  
- TV show data provided by The Movie Database (TMDB) API.  
- UI icons sourced from SVGRepo and custom assets.  
- Open-source packages licensed under MIT or respective licenses — see package.json for details.  
- This project was developed as part of a university course at [Your University Name].  

## 8. AI or API Usage Details  
- **TMDB API:** Used to fetch TV show data, images, episodes, and ratings in real-time.  
- **Cloudinary:** For image upload, storage, and CDN delivery of user profile photos.  
- **bcrypt:** For securely hashing user passwords before storage.  
- **express-session:** Manages user sessions to keep users logged in.  
- **Joi:** Backend validation of input data to ensure data integrity.  
- **ChatGPT API:** Used to implement AI features for the AI challenge portion of the project.   

*AI Code Assistance Acknowledgment*  
*Some portions of the codebase were generated or assisted by the ChatGPT API by OpenAI. This was used to help write or optimize code snippets, and all AI-generated code was reviewed and adapted to fit the project requirements.*

## 10. Contact Information  
If you have questions, feedback, or want to contribute:  

**Valley Balfour**  
Email: [jpvbal4@gmail.com](mailto:jpvbal4@gmail.com) <br>
GitHub: [github.com/Jbalfour5](https://github.com/Jbalfour5)  
LinkedIn: [linkedin.com/in/valleybalfour](https://www.linkedin.com/in/valleybalfour/)

**Dominic Cheang**  
Email: [dcheang@my.bcit.ca](mailto:dcheang@my.bcit.ca) <br>
GitHub: [github.com/cheangdominic](https://github.com/cheangdominic)  
LinkedIn: [linkedin.com/in/dominic-cheang/](https://www.linkedin.com/in/dominic-cheang/ )

**Tyrone Cheang**  
Email: [tcheang@my.bcit.ca](mailto:tcheang@my.bcit.ca) <br>
GitHub: [github.com/tyronecheang](https://github.com/tyronecheang)  
LinkedIn: [linkedin.com/in/tyronecheang/](https://www.linkedin.com/in/tyronecheang/)

**Bullen Kosa**  
Email: [kosabullen@gmail.com](mailto:kosabullen@gmail.com)<br> 
GitHub: [github.com/kkbullenn](https://github.com/kkbullenn)  
LinkedIn: [linkedin.com/in/bullen-kosa-8b532a34a](https://www.linkedin.com/in/bullen-kosa-8b532a34a/)

**Isaac Kehler**  
Email: [caasik23@gmail.com](mailto:caasik23@gmail.com) <br>
GitHub: [github.com/IsaacK23](https://github.com/IsaacK23)  
LinkedIn: [linkedin.com/in/isaac-kehler-a23734255](https://www.linkedin.com/in/isaac-kehler-a23734255/)
