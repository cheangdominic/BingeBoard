import { motion } from 'framer-motion';

import teamIcon from '../../assets/team_icon.svg';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: 'easeOut',
    }
  })
};

function AboutUsInfo() {
  const team = [
    { name: "Valley Balfour", role: "Team Member 1", image: teamIcon },
    { name: "Dominic Cheang", role: "Team Member 2", image: teamIcon},
    { name: "Tyrone Cheang", role: "Team Member 3", image: teamIcon },
    { name: "Isaac Kehler", role: "Team Member 4", image: teamIcon },
    { name: "Bullen Kosa", role: "Team Member 5", image: teamIcon },
  ];

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 grid gap-10 xl:grid-cols-3">

        <motion.div
          className="bg-[#232323] border border-gray-800 hover:border-blue-400/30 p-8 rounded-2xl shadow-md max-w-xl transition-colors duration-300"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          custom={0}
        >
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Meet BBY12</h2>
          <p className="mt-6 text-lg text-white">
            We’re a team of BCIT students passionate about tech and television, working together to build a social app that helps users track episodes, share their favorite shows, and connect with fellow fans. Our goal is to create a standout, user-friendly experience that goes beyond a school project. Something we’re proud to share with real users.
          </p>
        </motion.div>

        <motion.div
          className="bg-[#232323] border border-gray-800 hover:border-blue-400/30 p-8 rounded-2xl shadow-md xl:col-span-2 transition-colors duration-300"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          custom={0.3}
        >
          <ul role="list" className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((person, index) => (
              <motion.li
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                custom={0.4 + index * 0.7}
              >
                <div className="flex items-center gap-x-6">
                  <img
                    className="size-20 rounded-full"
                    src={person.image}
                    alt={person.name}
                  />
                  <div>
                    <h3 className="text-base font-semibold tracking-tight text-white">{person.name}</h3>
                    <p className="text-sm font-semibold text-blue-600">{person.role}</p>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}

export default AboutUsInfo;
