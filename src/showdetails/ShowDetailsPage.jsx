import ShowHero from './ShowHero';
import ShowDescription from './ShowDescription';
import EpisodeList from './EpisodeList';
import EpisodeListView from './EpisodeListView';
import ReviewSection from './ReviewSection';

const ShowDetailsPage = () => {
  const mockShow = {
    title: 'Dragon Ball Super',
    releaseDate: 'July 5, 2015',
    description: 'Dragon Ball Super is a Japanese anime series that follows the adventures of Goku and his friends after the defeat of Majin Buu. It introduces new characters, transformations, and powerful foes, including gods and universes beyond their own.',
    status: 'In Production',
    creator: 'Akira Toriyama',  
    seasons: 2,
    episodes: 131,
    rating: 'TV-14',
    platforms: ['YouTube', 'Netflix'],
    nextEpisode: {
      countdown: '3 Days, 2 Hours, 1 Minute(s)',
    },
    seasonsData: [
      {
        number: 1,
        episodeCount: 46,
        rating: 8.2,
        episodes: [
          {
            id: 101,
            number: 1,
            title: "The Peace Prize",
            duration: "23m",
            description: "After defeating Majin Buu, Goku has settled down as a radish farmer. Meanwhile, Beerus, the God of Destruction, awakens after decades of slumber.",
            rating: 8.1
          },
          {
            id: 102,
            number: 2,
            title: "The Revival of F",
            duration: "23m",
            description: "Frieza is resurrected and seeks revenge on Goku and the Z Fighters. He trains to achieve a new powerful form.",
            rating: 8.3
          },
          {
            id: 103,
            number: 3,
            title: "A Desperate Chance",
            duration: "23m",
            description: "Goku and Vegeta train with Whis to achieve the power of Super Saiyan God. Frieza's forces arrive on Earth.",
            rating: 8.5
          }
        ]
      },
      {
        number: 2,
        episodeCount: 85,
        rating: 8.7,
        episodes: [
          {
            id: 201,
            number: 1,
            title: "The Tournament Begins",
            duration: "23m",
            description: "The Tournament of Power begins as fighters from different universes battle for survival. Goku faces strong opponents.",
            rating: 9.0
          },
          {
            id: 202,
            number: 2,
            title: "The Universe's Strongest",
            duration: "23m",
            description: "Jiren makes his appearance, demonstrating unbelievable power. Goku struggles to keep up with his strength.",
            rating: 9.2
          }
        ]
      }
    ],
    reviews: [
      {
        id: 1,
        username: "@gokufan",
        content: "The Tournament of Power arc was absolutely incredible! The animation quality improved so much.",
        rating: 5,
        date: "2023-08-12",
        likes: 156,
        containsSpoiler: false
      },
      {
        id: 2,
        username: "@vegatacritic",
        content: "Vegeta's character development in this series is phenomenal. His final sacrifice against Jiren was heartbreaking.",
        rating: 4,
        date: "2023-07-30",
        likes: 98,
        containsSpoiler: true
      },
      {
        id: 3,
        username: "@animehater",
        content: "Overrated show with too much filler. The power scaling makes no sense.",
        rating: 2,
        date: "2023-09-01",
        likes: 12,
        containsSpoiler: false
      },
      {
        id: 4,
        username: "@whiswhisperer",
        content: "The introduction of gods of destruction and angels added such an interesting dynamic to the Dragon Ball universe.",
        rating: 5,
        date: "2023-08-22",
        likes: 87,
        containsSpoiler: false
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="p-6 max-w-8xl mx-auto space-y-6">
        <ShowHero show={mockShow} />
        <ShowDescription show={mockShow} />
        <EpisodeList seasons={mockShow.seasonsData} />
        <EpisodeListView seasons={mockShow.seasonsData} />
        <ReviewSection reviews={mockShow.reviews} />
      </div>
    </div>
  );
};

export default ShowDetailsPage;