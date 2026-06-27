import VideoCard from "./VideoCard";

export default function RecommendedVideos() {
  return (
    <div className="w-[350px]">

      <h2 className="font-bold mb-4">
        Recommended
      </h2>

      <div className="space-y-4">
        <VideoCard />
        <VideoCard />
        <VideoCard />
      </div>

    </div>
  );
}