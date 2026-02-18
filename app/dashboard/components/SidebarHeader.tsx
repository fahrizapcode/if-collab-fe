import Image from "next/image";

export default function SidebarHeader() {
  return (
    <div className="px-3 sm:px-4 py-2 sm:py-3 mb-4 sm:mb-6">
      <Image
        src="/logo.svg"
        alt="if-collab-logo"
        width={140}
        height={70}
        className="w-[140px] sm:w-[160px]"
      />
    </div>
  );
}
