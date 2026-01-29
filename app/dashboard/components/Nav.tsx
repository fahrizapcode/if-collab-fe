import ClickableIcon from "@/components/ui/ClickableIcon";
export default function Nav({
  setIsActiveOverlay,
  setIsActiveComponent,
}: {
  setIsActiveOverlay: React.Dispatch<React.SetStateAction<boolean>>;
  setIsActiveComponent: React.Dispatch<
    React.SetStateAction<"sidebar" | "addtask" | "stats" | null>
  >;
}) {
  return (
    <div className="h-[10dvh]  absolute top-0 right-0 items-center px-6 gap-x-2 flex py-4 z-10 lg:z-20">
      <ClickableIcon
        srcIcon="/icons/analytics-doc-purple.svg"
        size={40} // default < sm
        className="
bg-white
    lg:hidden
  "
        onClick={() => {
          setIsActiveOverlay(true);
          setIsActiveComponent("stats");
        }}
      />
      <ClickableIcon
        srcIcon="/icons/notif-bell-white.svg"
        size={40} // default < sm
        className="

  "
        onClick={() => console.log("clicked")}
      />
      <ClickableIcon
        srcIcon="/icons/user-white.svg"
        size={40} // default < sm
        className="
    
  "
        onClick={() => console.log("clicked")}
      />
    </div>
  );
}
