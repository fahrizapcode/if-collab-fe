import Image from "next/image";

type ClickableIconProps = {
  srcIcon: string;
  size?: number; // px, default 40
  alt?: string;
  onClick?: () => void;
  className?: string; // 👈 opsional
};

export default function ClickableIcon({
  srcIcon,
  size = 40,
  alt = "icon",
  onClick,
  className = "",
}: ClickableIconProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center rounded-lg bg-np transition hover:opacity-90 active:scale-95 ${className}`}
      style={{
        width: size,
        height: size,
      }}
    >
      <Image src={srcIcon} alt={alt} width={size * 0.55} height={size * 0.55} />
    </button>
  );
}
