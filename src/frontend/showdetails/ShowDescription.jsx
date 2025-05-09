const ShowDescription = ({ show }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4 md:p-5 shadow-md border border-gray-700">
      <h2 className="text-base md:text-lg font-semibold mb-2 md:mb-3 text-gray-100">
        Synopsis
      </h2>   
      <p className="text-gray-300 text-xs md:text-sm leading-snug">
        {show.description}
      </p>
    </div>
  );
};

export default ShowDescription;