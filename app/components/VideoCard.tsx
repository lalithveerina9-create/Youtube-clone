import Link from "next/link";

export default function VideoCard({ video }) {
  return (
    <Link href={`/watch/${video?._id}`}>
      <div className="cursor-pointer">

        {/* Thumbnail */}
        <div className="relative">

          <img
            src={
              video?.thumbnailUrl && video.thumbnailUrl.trim() !== ""
                ? video.thumbnailUrl
                : "/thumbnails/default.jpg"
            }
            alt={video?.title}
            className="w-full h-48 object-cover rounded-xl"
          />

          <div className="absolute bottom-2 right-2 bg-black text-white text-xs px-2 py-1 rounded">
            {video?.duration || "0:00"}
          </div>

        </div>

        {/* Details */}
        <div className="flex gap-3 mt-3">

          <img
            src={
              video?.channelAvatar && video.channelAvatar.trim() !== ""
                ? video.channelAvatar
                : "/avatar/default-avatar.png"
            }
            alt={video?.channelName || "Channel"}
            className="w-10 h-10 rounded-full object-cover"
          />

          <div className="flex-1">

            <h3 className="font-semibold line-clamp-2">
              {video?.title}
            </h3>

            <p className="text-sm text-gray-500">
              {video?.channelName || "Unknown Channel"}
            </p>

            <p className="text-sm text-gray-500">
              {video?.views || 0} views
            </p>

          </div>

        </div>

      </div>
    </Link>
  );
}