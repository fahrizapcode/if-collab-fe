import { User } from "@/types/typesUser";

export const initialUsers: User[] = [
  {
    name: "Andi Pratama",
    nim_nip: "1237050001",
    password: "password1",
    avatar: "/images/person1.png",
    general_role: "admin",
    notifications: [
      {
        id: "notif-2",
        content:
          "Kamu diundang ke board proyek “Pengembangan Web GIS” oleh Andi Pratama",
        board_title: "Pengembangan Web GIS",
        created_at: "2026-01-03T09:00:00.000Z",
      },
      {
        id: "notif-3",
        content:
          "Kamu diundang ke board proyek “Riset Machine Learning” oleh Budi Santoso",
        board_title: "Riset Machine Learning",
        created_at: "2026-01-04T10:15:00.000Z",
      },
    ],
    last_active: "2026-02-16T10:00:00.000Z", // ✅ aktif
  },
  {
    name: "Budi Santoso",
    nim_nip: "1237050002",
    password: "password2",
    avatar: "/images/person2.png",
    general_role: "student",
    notifications: [
      {
        id: "notif-2",
        content:
          "Kamu diundang ke board proyek “Pengembangan Web GIS” oleh Andi Pratama",
        board_title: "Pengembangan Web GIS",
        created_at: "2026-01-03T09:00:00.000Z",
      },
      {
        id: "notif-3",
        content:
          "Kamu diundang ke board proyek “Riset Machine Learning” oleh Budi Santoso",
        board_title: "Riset Machine Learning",
        created_at: "2026-01-04T10:15:00.000Z",
      },
    ],
    last_active: "2026-02-14T09:45:00.000Z", // ✅ aktif
  },
  {
    name: "Citra Lestari",
    nim_nip: "1237050003",
    password: "password3",
    avatar: "/images/person3.png",
    general_role: "student",
    notifications: [],
    last_active: "2026-02-10T11:20:00.000Z", // ✅ aktif (6 hari lalu)
  },
  {
    name: "Dewi Anggraini",
    nim_nip: "1237050004",
    password: "password4",
    avatar: "/images/person4.png",
    general_role: "student",
    notifications: [],
    last_active: "2026-02-15T17:30:00.000Z", // ✅ aktif
  },
  {
    name: "Eko Saputra",
    nim_nip: "1237050005",
    password: "password5",
    avatar: "/images/person5.png",
    general_role: "student",
    notifications: [],
    last_active: "2026-02-16T08:50:00.000Z", // ✅ aktif
  },

  // ===============================
  // ❌ TIDAK AKTIF (>7 HARI)
  // ===============================

  {
    name: "Fajar Nugroho",
    nim_nip: "1237050006",
    password: "password6",
    avatar: "/images/person6.png",
    general_role: "student",
    notifications: [],
    last_active: "2026-02-01T12:05:00.000Z", // ❌ 15 hari lalu
  },
  {
    name: "Gita Maharani",
    nim_nip: "1237050007",
    password: "password7",
    avatar: "/images/person7.png",
    general_role: "student",
    notifications: [],
    last_active: "2026-01-25T09:30:00.000Z", // ❌ 22 hari lalu
  },
  {
    name: "Hadi Wijaya",
    nim_nip: "1237050008",
    password: "password8",
    avatar: "/images/person8.png",
    general_role: "student",
    notifications: [],
    last_active: "2026-02-05T07:50:00.000Z", // ❌ 11 hari lalu
  },
  {
    name: "Intan Permata",
    nim_nip: "1237050009",
    password: "password9",
    avatar: "/images/person9.png",
    general_role: "student",
    notifications: [],
    last_active: "2026-01-28T10:25:00.000Z", // ❌ 19 hari lalu
  },
];
