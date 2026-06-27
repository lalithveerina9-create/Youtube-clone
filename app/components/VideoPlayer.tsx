export default function VideoPlayer() {
  return (
    <div className="w-full">
      <iframe
        className="w-full h-[500px] rounded-xl"
        src="https://www.youtube.com/embed/BsDoLVMnmZs"
        title="Video"
        allowFullScreen
      />
    </div>
  );
}