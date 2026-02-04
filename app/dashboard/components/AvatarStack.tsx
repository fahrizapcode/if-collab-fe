import Image from "next/image";

type User = {
  name: string;
  avatar: string;
};

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
  const remaining = users.length - max;

  return (
    <div className="flex items-center">
      {visibleUsers.map((user, index) => (
        <div
          key={user.name + index}
          className="relative group"
          style={{
            marginLeft: index === 0 ? 0 : -size / 3,
            width: size,
            height: size,
          }}
        >
          <Image
            src={user.avatar}
            alt={user.name}
            width={size}
            height={size}
            className="rounded-full border-2 border-white object-cover"
          />

          {/* Tooltip */}
          <div
            className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 
            whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 
            transition-opacity group-hover:opacity-100"
          >
            {user.name}
          </div>
        </div>
      ))}

      {remaining > 0 && (
        <div
          className="flex items-center justify-center rounded-full border-2 border-white 
          bg-gray-500 text-xs font-semibold text-white"
          style={{
            marginLeft: -size / 3,
            width: size,
            height: size,
          }}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
