import { LoginIllustration } from "./LoginIllustration";

export const RightSide = () => {
  return (
    <div className="absolute top-0 right-0 hidden h-full w-[90%] md:block">
      <div
        className="h-full w-full"
        style={{ clipPath: "polygon(35% 0, 100% 0, 100% 100%, 0% 100%)" }}
      >
        <LoginIllustration />
      </div>
    </div>
  );
};
