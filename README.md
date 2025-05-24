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
C:.
|   .env
|   .gitignore
|   about.html
|   eslint.config.js
|   index.html
|   package-lock.json
|   package.json
|   postcss.config.js
|   README.md
|   tailwind.config.js
|   vite.config.js
|   
+---public
|   |   vite.svg
|   |   
|   \---img
|       +---favicon
|       |       android-chrome-192x192.png
|       |       android-chrome-512x512.png
|       |       apple-touch-icon.png
|       |       favicon-16x16.png
|       |       favicon-32x32.png
|       |       favicon.ico
|       |       
|       \---profilePhotos
|               alt_generic_profile_picture.jpg
|               generic_profile_picture.jpg
|               
\---src
    |   App.css
    |   App.jsx
    |   index.css
    |   main.jsx
    |   
    +---assets
    |       BingeBoard Icon.svg
    |       browse_tv_icon.svg
    |       dragonballsuper1.jpg
    |       dragonballsuper2.jpg
    |       facebook_footer_icon.svg
    |       fallback.jpg
    |       friend_feature_icon.svg
    |       instagram_footer_icon.svg
    |       person_statistics_icon.svg
    |       react.svg
    |       review_rating_icon.svg
    |       severance-apple-tv-plus.jpg
    |       team_icon.svg
    |       tiktok_footer_icon.svg
    |       watchlist_icon.svg
    |       X_footer_icon.svg
    |       
    +---backend
    |       databaseConnection.js
    |       friends.js
    |       server.js
    |       tmdb.js
    |       useAuth.js
    |       utils.js
    |       
    +---components
    |       ActivityCard.jsx
    |       AppleRating.jsx
    |       AppleRatingDisplay.jsx
    |       BottomNavbar.jsx
    |       ImageUploadModal.jsx
    |       LoadingSpinner.jsx
    |       LocationInfo.jsx
    |       ProfileImage.jsx
    |       ReviewCard.jsx
    |       ShowCarousel.jsx
    |       TVShowCard.jsx
    |       
    +---context
    |       AuthContext.jsx
    |       
    +---frontend
    |   |   NotFound.jsx
    |   |   
    |   +---aboutus
    |   |       AboutUsInfo.jsx
    |   |       AboutUsPage.jsx
    |   |       
    |   +---activity
    |   |       ActivityCard.jsx
    |   |       ActivityPage.jsx
    |   |       ActivityPageHeader.jsx
    |   |       ActivitySectionHeader.jsx
    |   |       
    |   +---featurecards
    |   |       BrowseFeature.jsx
    |   |       SocialFeature.jsx
    |   |       WatchlistFeature.jsx
    |   |       
    |   +---friends
    |   |       FriendListPage.jsx
    |   |       FriendRequestsPage.jsx
    |   |       
    |   +---home
    |   |       FriendsRecentlyWatched.jsx
    |   |       Home.jsx
    |   |       PopularReviewsFiltered.jsx
    |   |       RecommendedByFriends.jsx
    |   |       TrendingCarousel.jsx
    |   |       
    |   +---landing
    |   |       FeatureCards.jsx
    |   |       Footer.jsx
    |   |       Landing.jsx
    |   |       MottoBanner.jsx
    |   |       PopularReviews.jsx
    |   |       Statistics.jsx
    |   |       TopNavbar.jsx
    |   |       
    |   +---log
    |   |       LogPage.jsx
    |   |       ShowGrid.jsx
    |   |       
    |   +---login
    |   |       LoginForm.jsx
    |   |       LoginPage.jsx
    |   |       
    |   +---profile
    |   |       LogoutButton.jsx
    |   |       ProfileCard.jsx
    |   |       ProfilePage.jsx
    |   |       RecentlyWatched.jsx
    |   |       RecentlyWatchedViewAll.jsx
    |   |       RecentReviews.jsx
    |   |       Watchlist.jsx
    |   |       WatchlistCarousel.jsx
    |   |       WatchlistViewAll.jsx
    |   |       
    |   +---search
    |   |       ChatBox.jsx
    |   |       SearchBar.jsx
    |   |       SearchPage.jsx
    |   |       TVShowFilters.jsx
    |   |       TvShowSearchGrid.jsx
    |   |       
    |   +---showdetails
    |   |   |   AddToWatchlistButton.jsx
    |   |   |   EpisodeList.jsx
    |   |   |   EpisodeListView.jsx
    |   |   |   ReviewSection.jsx
    |   |   |   ShowDescription.jsx
    |   |   |   ShowDetailsPage.jsx
    |   |   |   ShowHero.jsx
    |   |   |   
    |   |   \---ReviewSection
    |   |           ReviewCard.jsx
    |   |           ReviewForm.jsx
    |   |           
    |   +---signup
    |   |       SignupForm.jsx
    |   |       SignupPage.jsx
    |   |       
    |   +---social
    |   |       searchUsers.jsx
    |   |       UserProfile.jsx
    |   |       
    |   \---viewall
    |           ViewAllPage.jsx
    |           
    \---profile
            ProfilePage.jsx
            
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
