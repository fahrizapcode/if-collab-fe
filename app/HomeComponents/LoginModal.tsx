"use client";

import LoginComp from "./LoginComp";

interface Props {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function LoginModal({ isModalOpen, setIsModalOpen }: Props) {
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 z-40 ${
          isModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsModalOpen(false)}
      ></div>

      {/* Modal Content */}
      <div
        className={`fixed left-1/2 -translate-x-1/2 h-150 w-[90%] sm:w-130 rounded-xl bg-white
        transition-transform duration-300 ease-in-out z-50 
        ${
          isModalOpen
            ? "translate-y-40 md:translate-y-10"
            : "translate-y-[110vh]"
        }
      `}
        onClick={(e) => e.stopPropagation()}
      >
        <LoginComp setIsModalOpen={setIsModalOpen} />
      </div>
    </>
  );
}
