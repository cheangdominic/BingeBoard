const ShowDescription = ({ show }) => {
  const descriptionLength = show.description?.length || 0;
  const isShortDescription = descriptionLength < 200; // Adjust this threshold as needed

  return (
    <div className={`bg-[#2a2a2a] rounded-xl p-6 shadow-lg ${isShortDescription ? 'mb-4' : 'mb-8'}`}>
      <h2 className="text-xl font-bold mb-4 text-gray-100">
        Synopsis
      </h2>   
      <p className="text-gray-300 text-sm md:text-base lg:text-lg leading-relaxed">
        {show.description || 'No description available.'}
      </p>
    </div>
  );
};

export default ShowDescription;