import { NPC, Quest } from '../../types/game';

export const NPCS_DATA: Record<string, NPC> = {
  mira: {
    id: 'mira',
    name: 'Mira',
    role: 'General Storekeeper',
    portrait: 'mira',
    x: 14,
    y: 12,
    dir: 'down',
    area: 'village',
    friendship: 10,
    talkedToday: false,
    shopType: 'general',
    defaultDialogue: [
      "Selamat pagi, tetangga baru! Senang melihatmu merawat kebun tua itu kembali.",
      "Tanah di Meadowlight Village sangat subur. Jangan lupa menyiram tanamanmu setiap pagi ya!",
      "Jika butuh benih wortel atau kentang segar, tokoku selalu buka untukmu."
    ],
    friendshipDialogue: {
      low: [
        "Selamat datang di Meadowlight Village! Senang kamu pindah ke sini.",
        "Mencangkul tanah dan menyiram setiap hari butuh kesabaran, tapi hasilnya manis!"
      ],
      med: [
        "Kebunmu terlihat semakin hijau dan asri dari hari ke hari!",
        "Aku selalu menantikan hasil panen segar yang kamu bawa ke toko."
      ],
      high: [
        "Kamu salah satu teman terbaik di desa ini! Ini membuat toko kecilku selalu ceria.",
        "Terima kasih sudah membawa kehidupan baru ke Meadowlight!"
      ]
    }
  },
  theo: {
    id: 'theo',
    name: 'Theo',
    role: 'Master Carpenter',
    portrait: 'theo',
    x: 26,
    y: 10,
    dir: 'left',
    area: 'village',
    friendship: 10,
    talkedToday: false,
    shopType: 'carpenter',
    defaultDialogue: [
      "Halo di sana! Aku Theo, tukang kayu desa. Sedang sibuk dengan pesanan kayu.",
      "Kapak dan beliungmu adalah sahabat terbaik. Tebang pohon liar dan pecahkan batu di kebunmu!",
      "Kandang ayam dan hewanku dibuat dari kayu pinus asli. Kokoh dan hangat untuk hewanmu."
    ],
    friendshipDialogue: {
      low: [
        "Kayu dan batu adalah pondasi segala hal. Bersihkan kebunmu agar bisa diperluas.",
        "Kapakmu terlihat tajam! Jaga energimu saat menebang pohon."
      ],
      med: [
        "Hebat! Kebunmu makin rapi dan luas. Butuh material tambahan untuk renovasi?",
        "Aku kagum dengan ketekunanmu membangun kembali kebun yang terbengkalai itu."
      ],
      high: [
        "Kapan pun kamu butuh bantuan membangun atau merenovasi, Theo siap membantumu!",
        "Rumahmu sekarang jadi tempat terhangat di pinggir desa."
      ]
    }
  },
  lily: {
    id: 'lily',
    name: 'Lily',
    role: 'Bakery Chef',
    portrait: 'lily',
    x: 8,
    y: 18,
    dir: 'right',
    area: 'village',
    friendship: 10,
    talkedToday: false,
    shopType: 'bakery',
    defaultDialogue: [
      "Mmm... tercium aroma roti hangat yang baru matang! Halo, petualang kebun!",
      "Kerja keras di kebun pasti menguras tenaga. Sepotong roti hangat atau sup sayur bisa memulihkan energimu!",
      "Bawa susu sapi atau stroberi segar, aku bisa membuat hidangan penutup yang lezat!"
    ],
    friendshipDialogue: {
      low: [
        "Makan makanan lezat sebelum beraktivitas berat adalah rahasia para petani sehat.",
        "Toko rotiku buka setiap hari dengan hidangan hangat yang menenangkan hati."
      ],
      med: [
        "Stroberi dan jagung dari kebunmu kualitasnya jempolan! Kuenya jadi wangi sekali.",
        "Mau coba resep kue berry baru buatanku hari ini?"
      ],
      high: [
        "Kamu selalu diterima di dapurku kapan saja! Kehangatan desa ini ada padamu.",
        "Ini dia sahabat favorit toko roti kita! Semoga harimu semanis selai berry!"
      ]
    }
  },
  rowan: {
    id: 'rowan',
    name: 'Rowan',
    role: 'Village Ranger',
    portrait: 'rowan',
    x: 20,
    y: 6,
    dir: 'down',
    area: 'village',
    friendship: 10,
    talkedToday: false,
    defaultDialogue: [
      "Salam pengembara. Hutan di utara dan danau di timur sangat tenang hari ini.",
      "Aku mengawasi jalan setapak desa. Jika kamu ingin memancing, danau menyimpan ikan-ikan indah.",
      "Desa membutuhkan bantuan pasokan sesekali. Periksa quest di papan pengumuman ya!"
    ],
    friendshipDialogue: {
      low: [
        "Hati-hati jangan sampai kelelahan di malam hari. Jam 02:00 desa sudah sangat gelap.",
        "Danau di pagi dan sore hari sering didatangi ikan-ikan langka berkilau emas."
      ],
      med: [
        "Langkah kakimu semakin ringan dan lincah di jalur hutan. Kamu sudah seperti penduduk lama.",
        "Terima kasih sudah menjaga ketertiban dan membantu desa kita."
      ],
      high: [
        "Desa ini terasa jauh lebih aman dan hidup sejak kamu tinggal di sini kawan!",
        "Kalau kamu pergi memancing di danau, ajak aku ya!"
      ]
    }
  },
  nia: {
    id: 'nia',
    name: 'Nia',
    role: 'Botanist & Herbalist',
    portrait: 'nia',
    x: 18,
    y: 22,
    dir: 'up',
    area: 'village',
    friendship: 10,
    talkedToday: false,
    shopType: 'botanist',
    defaultDialogue: [
      "Lihat kuncup bunga kecil ini, sungguh mempesona! Halo pecinta tanaman!",
      "Setiap tanaman punya ritme pertumbuhannya sendiri. Jangan lewatkan waktu menyiramnya di pagi hari.",
      "Saat musim semi berganti musim panas atau gugur, jenis tanaman yang cocok juga akan berubah."
    ],
    friendshipDialogue: {
      low: [
        "Tanaman bisa merasakan kasih sayang tangan yang merawatnya lho!",
        "Tahukah kamu? Hari hujan menyiram seluruh kebunmu secara otomatis!"
      ],
      med: [
        "Wortel dan labumu tumbuh begitu subur! Daunnya tampak sehat dan hijau pekat.",
        "Aku punya beberapa tip kompos rahasia kalau kamu ingin hasil panen melimpah."
      ],
      high: [
        "Kebunmu adalah contoh harmoni alam terbaik di Meadowlight!",
        "Setiap kali aku lewat kebunmu, hatiku terasa begitu damai dan berbunga-bunga."
      ]
    }
  }
};

export const INITIAL_QUESTS: Quest[] = [
  {
    id: 'quest_mira_carrots',
    title: 'Bantuan untuk Toko Mira',
    giverNpcId: 'mira',
    description: 'Mira membutuhkan 3 buah Wortel segar untuk persediaan toko desa.',
    targetItemId: 'crop_carrot',
    targetQuantity: 3,
    rewardCoins: 120,
    rewardFriendship: 20,
    isCompleted: false,
    isClaimed: false,
  },
  {
    id: 'quest_theo_wood',
    title: 'Kayu untuk Bengkel Theo',
    giverNpcId: 'theo',
    description: 'Theo memerlukan 5 batang Kayu untuk memperbaiki jembatan dan pagar desa.',
    targetItemId: 'mat_wood',
    targetQuantity: 5,
    rewardCoins: 100,
    rewardFriendship: 20,
    isCompleted: false,
    isClaimed: false,
  },
  {
    id: 'quest_lily_eggs',
    title: 'Telur Segar untuk Lily',
    giverNpcId: 'lily',
    description: 'Lily ingin memanggang kue tart lezat dan memerlukan 2 butir Telur segar dari ayammu.',
    targetItemId: 'prod_egg',
    targetQuantity: 2,
    rewardCoins: 150,
    rewardFriendship: 25,
    isCompleted: false,
    isClaimed: false,
  },
  {
    id: 'quest_rowan_fish',
    title: 'Ikan Segar dari Danau',
    giverNpcId: 'rowan',
    description: 'Rowan ingin mencicipi 2 ekor Ikan Perch Biru hasil pancingan dari Danau Meadow.',
    targetItemId: 'fish_blue',
    targetQuantity: 2,
    rewardCoins: 180,
    rewardFriendship: 25,
    isCompleted: false,
    isClaimed: false,
  },
  {
    id: 'quest_nia_berries',
    title: 'Koleksi Berry Hutan Nia',
    giverNpcId: 'nia',
    description: 'Nia sedang meneliti tanaman herbal hutan dan butuh 4 buah Berry Hutan liar.',
    targetItemId: 'forage_berry',
    targetQuantity: 4,
    rewardCoins: 130,
    rewardFriendship: 20,
    isCompleted: false,
    isClaimed: false,
  },
];
