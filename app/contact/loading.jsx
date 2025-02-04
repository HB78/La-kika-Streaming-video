import NetflixKLetter from "../component/svg/NetflixKLetter";

const Loading = () => {
  return (
    <div className="w-full h-[100vh] bg-black absolute flex justify-center items-center text-3xl text-red-800 font-bolder gap-6">
      <NetflixKLetter />
      <p>Loading </p>
    </div>
  );
};

export default Loading;
