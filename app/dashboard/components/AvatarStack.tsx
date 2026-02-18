import Image from "next/image";
import { User } from "@/types/typesUser";

type AvatarStackProps = {
  users: User[];
  max?: number; // default 3
  size?: number; // ukuran avatar (px)
};

export default function AvatarStack({
  users,
  max = 3,
  size = 32,
}: AvatarStackProps) {
  const visibleUsers = users.slice(0, max);
  const remainingCount = users.length - max;
  const overlapOffset = -size / 3;

  return (
    <div className="flex items-center">
      {visibleUsers.map((user, index) => {
        const marginLeft = index === 0 ? 0 : overlapOffset;

        return (
          <div
            key={`${user.name}${index}`}
            className="relative group"
            style={{
              marginLeft,
              width: size,
              height: size,
            }}
          >
            <Image
              src={user.avatar || "/images/default.png"}
              alt={user.name}
              width={size}
              height={size}
              className="rounded-full border-2 border-white object-cover"
            />

            {/* Tooltip */}
            <div
              className="
                pointer-events-none 
                absolute -top-8 left-1/2 -translate-x-1/2
                whitespace-nowrap rounded bg-black 
                px-2 py-1 text-xs text-white 
                opacity-0 transition-opacity 
                group-hover:opacity-100
              "
            >
              {user.name}
            </div>
          </div>
        );
      })}

      {remainingCount > 0 && (
        <div
          className="
            flex items-center justify-center 
            rounded-full border-2 border-white 
            bg-gray-500 text-xs font-semibold text-white
          "
          style={{
            marginLeft: overlapOffset,
            width: size,
            height: size,
          }}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
