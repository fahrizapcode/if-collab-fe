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
        className={`fixed inset-0 flex items-center justify-center absolute bg-black/40 ${
          isModalOpen ? "flex" : "hidden"
        }`}
        onClick={() => setIsModalOpen(false)}
      ></div>

      {/* Modal Content */}
      <div
        className={`h-150 w-[100%] sm:w-130 rounded-xl bg-white
        transition-transform duration-300 ease-in-out absolute 
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
