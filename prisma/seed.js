const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial database content...');

  // Password hash for 'password123'
  const passwordHash = bcrypt.hashSync('password123', 10);

  // 1. Create Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@hijafera.com' },
    update: {},
    create: {
      email: 'admin@hijafera.com',
      name: 'Super Admin',
      role: 'ADMIN',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    },
  });

  const rezza = await prisma.user.upsert({
    where: { email: 'rezza@hijafera.com' },
    update: {},
    create: {
      email: 'rezza@hijafera.com',
      name: 'Rezza',
      role: 'ADVERTISER',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  const yuli = await prisma.user.upsert({
    where: { email: 'yuli@hijafera.com' },
    update: {},
    create: {
      email: 'yuli@hijafera.com',
      name: 'Yuli',
      role: 'COPYWRITER',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
  });

  const faisal = await prisma.user.upsert({
    where: { email: 'faisal@hijafera.com' },
    update: {},
    create: {
      email: 'faisal@hijafera.com',
      name: 'Faisal',
      role: 'VIDEO_EDITOR',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  });

  const nofirahim = await prisma.user.upsert({
    where: { email: 'nofirahim@hijafera.com' },
    update: {},
    create: {
      email: 'nofirahim@hijafera.com',
      name: 'Nofirahim',
      role: 'VIDEO_EDITOR',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
  });

  const putri = await prisma.user.upsert({
    where: { email: 'putri@hijafera.com' },
    update: {},
    create: {
      email: 'putri@hijafera.com',
      name: 'Putri',
      role: 'VIDEO_EDITOR',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    },
  });

  console.log('Users created');

  // 2. Create Entities
  const entities = ['Hijafera', 'Kala', 'Yayasan Syekh Ali Jaber', 'Bersih Zakat', 'Salingbantu', 'Patungan Indonesia'];
  const entityMap = {};
  for (const name of entities) {
    const e = await prisma.entity.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    entityMap[name] = e.id;
  }

  // 3. Create Platforms
  const platforms = ['Shopee', 'TikTok', 'Instagram', 'Website', 'Yayasan Syekh Ali Jaber', 'salingbantu.in', 'Patungan', 'Facebook Ads'];
  const platformMap = {};
  for (const name of platforms) {
    const p = await prisma.platform.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    platformMap[name] = p.id;
  }

  // 4. Create Sample Content Requests
  const sampleRequests = [
    {
      id: 'CNT-2026-0001',
      campaignName: 'Sedekah Pangan Gaza',
      campaignStatus: 'New',
      entityName: 'Patungan Indonesia',
      entityId: entityMap['Patungan Indonesia'],
      platformName: 'Patungan',
      platformId: platformMap['Patungan'],
      campaignUrl: 'https://patunganindonesia.online/campaign/sedekah-pangan-palestina',
      shortUrl: 'https://patun.gan/gaza-pangan',
      contentCategory: 'Kemanusiaan',
      priority: 'Urgent',
      deadline: new Date('2026-02-20T23:59:59Z'),
      advertiserId: rezza.id,
      copywriterId: rezza.id,
      videoEditorId: putri.id,
      createdById: rezza.id,
      title: 'Sedekah Pangan Gaza - Video Emosional 30s',
      videoCount: 2,
      briefAdvertiser: `Jangan dipotong terlalu jauh. Mulai langsung dengan visual anak yang memegang ayam busuk dan teks: "Mencari Makan di Tumpukan Sampah." Visual kotor dan kontras dengan langit biru sangat kuat.

Editing: Tambahkan color grading yang sedikit lebih hangat/emotional, tapi tetap natural. Gunakan backsound instrumen piano yang pelan dan sedih (tapi jangan terlalu mendramatisir agar tetap otentik).

Overlay Teks: Gunakan font yang bersih dan mudah dibaca di tengah video.
"Kami terpaksa makan ayam busuk karena tak ada lagi yang bisa dimakan."
"Satu dari ribuan anak Palestina yang bertahan hidup dari sisa sampah."`,
      objective: 'Meningkatkan kepedulian masyarakat dan perolehan sedekah pangan gaza',
      targetAudience: 'Masyarakat Muslim Indonesia, Usia 25-55, Peduli Kemanusiaan',
      keyMessage: 'Satu paket pangan menyelamatkan satu keluarga dari kelaparan di Gaza.',
      cta: 'Sedekah Pangan Sekarang',
      toDo: 'Gunakan footage pilihan dari link jurnalis. Tambahkan color grading warm/dramatis.',
      additionalInfo: 'Footage bisa diambil dari jurnalis Instagram: @moha.mmed.salama dan @maqadema',
      assetLink: 'https://drive.google.com/drive/folders/gaza-pangan-assets',
      referenceUrl: 'https://www.facebook.com/ads/library/?id=1432242888452188',
      previousVt: 'https://tiktok.com/@patunganindonesia/video/7310011223',
      campaignRefUrl: 'https://patunganindonesia.online/campaign/sedekah-pangan-palestina',
      additionalRefLinks: JSON.stringify([
        { label: 'Instagram Jurnalis 1', url: 'https://www.instagram.com/moha.mmed.salama/' },
        { label: 'Instagram Jurnalis 2', url: 'https://www.instagram.com/maqadema/' }
      ]),
      status: 'EDITING',
      statusRunning: 'Belum Running',
      grade: 'A',
    },
    {
      id: 'CNT-2025-0001',
      campaignName: 'Cerebral Palsy Raisa - Oktober',
      campaignStatus: 'New',
      entityName: 'Yayasan Syekh Ali Jaber',
      entityId: entityMap['Yayasan Syekh Ali Jaber'],
      platformName: 'Yayasan Syekh Ali Jaber',
      platformId: platformMap['Yayasan Syekh Ali Jaber'],
      campaignUrl: 'https://yayasansyekhalijaber.com/campaign/senyum-mungil-perjuangan-besar-raisa-pejuang-cerebral-palsy-sejak-lahir',
      shortUrl: '',
      contentCategory: 'Kesehatan / Disabilitas',
      priority: 'Urgent',
      deadline: new Date('2025-10-16T23:59:59Z'),
      advertiserId: rezza.id,
      copywriterId: yuli.id,
      videoEditorId: faisal.id,
      createdById: rezza.id,
      title: 'Perjuangan Raisa Pejuang Cerebral Palsy',
      videoCount: 1,
      briefAdvertiser: 'Masukan teks pada di layar untuk footage ada di uda nofi. Di 3 detik pertama buatkan hook yang emosional. Teks dilayar ada di link google sheets.',
      objective: 'Bantuan biaya pengobatan penyakit Raisa',
      targetAudience: 'Donatur umum',
      keyMessage: 'Bantu Raisa tersenyum kembali.',
      cta: 'Bantu Raisa Sekarang',
      toDo: 'Gunakan hook emosional di 3 detik pertama',
      additionalInfo: 'Footage lengkap dari Uda Nofi',
      assetLink: 'https://drive.google.com/drive/folders/disabilitas-raisa',
      referenceUrl: 'https://docs.google.com/spreadsheets/d/10IVgelRUNk2XwEurWVDCNAkP3c3Sjb__QdE54LLrhiA',
      previousVt: '',
      campaignRefUrl: 'https://yayasansyekhalijaber.com/campaign/senyum-mungil-perjuangan-besar-raisa-pejuang-cerebral-palsy-sejak-lahir',
      additionalRefLinks: JSON.stringify([]),
      status: 'PUBLISHED',
      statusRunning: 'Running',
      grade: 'A',
    },
    {
      id: 'CNT-2025-0002',
      campaignName: 'Orang Tua Asuh - Oktober - 1',
      campaignStatus: 'New',
      entityName: 'Yayasan Syekh Ali Jaber',
      entityId: entityMap['Yayasan Syekh Ali Jaber'],
      platformName: 'Yayasan Syekh Ali Jaber',
      platformId: platformMap['Yayasan Syekh Ali Jaber'],
      campaignUrl: 'https://yayasansyekhalijaber.com/campaign/dari-sedekahmu-terwujud-harapan-santri-yatim-dhuafa-penghafal-qur-39-an-akv',
      shortUrl: '',
      contentCategory: 'Orang Tua Asuh',
      priority: 'Urgent',
      deadline: new Date('2025-10-18T23:59:59Z'),
      advertiserId: rezza.id,
      copywriterId: rezza.id,
      videoEditorId: faisal.id,
      createdById: rezza.id,
      title: 'Program Santri Yatim Penghafal Quran',
      videoCount: 1,
      briefAdvertiser: 'Gunakan konsep voice over pada footage dan sesuaikan pada voice over. Untuk voice over sendiri di ambil dari video pada referensi/benchmark.',
      objective: 'Mencari orang tua asuh santri yatim dhuafa',
      targetAudience: 'Donatur rutin & orang tua asuh',
      keyMessage: 'Jadilah orang tua asuh bagi santri yatim penghafal Quran.',
      cta: 'Daftar Orang Tua Asuh',
      toDo: 'Untuk footage dari uda',
      additionalInfo: '',
      assetLink: 'https://drive.google.com/drive/folders/orang-tua-asuh',
      referenceUrl: '',
      previousVt: '',
      campaignRefUrl: 'https://yayasansyekhalijaber.com/campaign/dari-sedekahmu-terwujud-harapan-santri-yatim-dhuafa-penghafal-qur-39-an-akv',
      additionalRefLinks: JSON.stringify([]),
      status: 'COPYWRITING',
      statusRunning: 'Belum Running',
      grade: 'B',
    },
    {
      id: 'CNT-2025-0003',
      campaignName: "Tebar Qur'an - Oktober - 1",
      campaignStatus: 'Maintenance',
      entityName: 'Yayasan Syekh Ali Jaber',
      entityId: entityMap['Yayasan Syekh Ali Jaber'],
      platformName: 'Yayasan Syekh Ali Jaber',
      platformId: platformMap['Yayasan Syekh Ali Jaber'],
      campaignUrl: 'https://yayasansyekhalijaber.com/campaign/tebar-al-qurand-39-an-untuk-indonesia',
      shortUrl: '',
      contentCategory: "Tebar Qur'an",
      priority: 'Urgent',
      deadline: new Date('2025-10-18T23:59:59Z'),
      advertiserId: rezza.id,
      copywriterId: rezza.id,
      videoEditorId: nofirahim.id,
      createdById: rezza.id,
      title: "Wakaf Tebar Al-Qur'an Nusantara",
      videoCount: 1,
      briefAdvertiser: 'Pakai konsep voice over pada footage dan sesuaikan pada voiceover untuk footage sendiri.',
      objective: 'Distribusi Al-Quran ke pelosok Indonesia',
      targetAudience: 'Pewakaf Al-Quran',
      keyMessage: 'Satu ayat yang dibaca menjadi pahala jariyah tanpa putus.',
      cta: "Wakaf Qur'an Sekarang",
      toDo: 'Voice over dan visual penyaluran Al-Quran',
      additionalInfo: '',
      assetLink: 'https://drive.google.com/drive/folders/tebar-quran',
      referenceUrl: '',
      previousVt: '',
      campaignRefUrl: 'https://yayasansyekhalijaber.com/campaign/tebar-al-qurand-39-an-untuk-indonesia',
      additionalRefLinks: JSON.stringify([]),
      status: 'ASSIGNED',
      statusRunning: 'Belum Running',
      grade: 'B',
    },
    {
      id: 'CNT-2025-0004',
      campaignName: 'Peduli Lansia - Oktober',
      campaignStatus: 'New',
      entityName: 'Yayasan Syekh Ali Jaber',
      entityId: entityMap['Yayasan Syekh Ali Jaber'],
      platformName: 'Yayasan Syekh Ali Jaber',
      platformId: platformMap['Yayasan Syekh Ali Jaber'],
      campaignUrl: '',
      shortUrl: '',
      contentCategory: 'Kesehatan',
      priority: 'Low',
      deadline: new Date('2025-10-20T23:59:59Z'),
      advertiserId: rezza.id,
      copywriterId: rezza.id,
      videoEditorId: nofirahim.id,
      createdById: rezza.id,
      title: 'Peduli Lansia Dhuafa & Sebat Kara',
      videoCount: 2,
      briefAdvertiser: 'Untuk videonya menggunakan style footage tanpa voice over. Butuh 2 Video, dan untuk divideo dimunculkan teks sesuai dengan struktur konten.',
      objective: 'Sedekah paket sembako lansia',
      targetAudience: 'Donatur umum',
      keyMessage: 'Muliakan lansia di usia senja mereka.',
      cta: 'Bantu Lansia',
      toDo: 'Untuk Footage ada di link aset',
      additionalInfo: '',
      assetLink: 'https://drive.google.com/drive/folders/peduli-lansia',
      referenceUrl: 'https://docs.google.com/spreadsheets/d/1dWMeWCz8ZbUmQndhL4tgcv4VdOaAn0GpB71PDzd69QU',
      previousVt: '',
      campaignRefUrl: '',
      additionalRefLinks: JSON.stringify([]),
      status: 'INTERNAL_REVIEW',
      statusRunning: 'Belum Running',
      grade: 'C',
    },
    {
      id: 'CNT-2025-0005',
      campaignName: 'Sembako - Oktober',
      campaignStatus: 'New',
      entityName: 'Bersih Zakat',
      entityId: entityMap['Bersih Zakat'],
      platformName: 'salingbantu.in',
      platformId: platformMap['salingbantu.in'],
      campaignUrl: 'https://yayasansyekhalijaber.com/campaign/tebar-sembako-untuk-dhuafa',
      shortUrl: '',
      contentCategory: 'Referensi Iklan',
      priority: 'Medium',
      deadline: new Date('2025-10-21T23:59:59Z'),
      advertiserId: rezza.id,
      copywriterId: rezza.id,
      videoEditorId: faisal.id,
      createdById: rezza.id,
      title: 'Tebar Sembako Untuk Dhuafa',
      videoCount: 6,
      briefAdvertiser: 'Untuk videonya di isi oleh voiceover syekh ali jaber & ust. adi hidayat, untuk video butuh 6 video. Dan untuk jenisnya kedua adalah testimoni, yang ketiga perjalanan dengan menggunakan voice over juga.',
      objective: 'Distribusi paket pangan sembako keluarga dhuafa',
      targetAudience: 'Muzakki & Donatur Sembako',
      keyMessage: 'Berbagi makanan maniskan hari dhuafa.',
      cta: 'Sedekah Sembako',
      toDo: 'Revisi hook dan penyesuaian voiceover Ust Adi Hidayat',
      additionalInfo: 'Untuk footage ada di uda',
      assetLink: 'https://drive.google.com/drive/folders/sembako-oktober',
      referenceUrl: '',
      previousVt: '',
      campaignRefUrl: 'https://yayasansyekhalijaber.com/campaign/tebar-sembako-untuk-dhuafa',
      additionalRefLinks: JSON.stringify([]),
      status: 'REVISION',
      statusRunning: 'Belum Running',
      grade: 'B',
    },
    {
      id: 'CNT-2025-0006',
      campaignName: 'Palestina Kelaparan - Oktober',
      campaignStatus: 'New',
      entityName: 'Salingbantu',
      entityId: entityMap['Salingbantu'],
      platformName: 'salingbantu.in',
      platformId: platformMap['salingbantu.in'],
      campaignUrl: 'https://salingbantu.in/campaign/gaza-darurat-kelaparan-lebih-dari-setengah-juta-jiwa-dalam-kondisi-kritis',
      shortUrl: '',
      contentCategory: 'Referensi',
      priority: 'Urgent',
      deadline: new Date('2025-10-25T23:59:59Z'),
      advertiserId: rezza.id,
      copywriterId: rezza.id,
      videoEditorId: faisal.id,
      createdById: rezza.id,
      title: 'Gaza Darurat Kelaparan 6 VT',
      videoCount: 6,
      briefAdvertiser: 'Untuk videonya di buatkan 6 VT, dan konsep video di serahkan kepada editor untuk referensi ada di link referensi.',
      objective: 'Bantuan darurat kelaparan Gaza',
      targetAudience: 'Donatur darurat kemanusiaan',
      keyMessage: 'Gaza butuh makanan hari ini.',
      cta: 'Bantu Gaza Sekarang',
      toDo: 'Siap rilis ke platform iklan',
      additionalInfo: '',
      assetLink: 'https://drive.google.com/drive/folders/gaza-kelaparan-6vt',
      referenceUrl: 'https://salingbantu.in/ref/gaza-darurat',
      previousVt: '',
      campaignRefUrl: 'https://salingbantu.in/campaign/gaza-darurat-kelaparan-lebih-dari-setengah-juta-jiwa-dalam-kondisi-kritis',
      additionalRefLinks: JSON.stringify([]),
      status: 'APPROVED',
      statusRunning: 'Running',
      grade: 'A',
    },
    {
      id: 'CNT-2025-0007',
      campaignName: 'Sedekah Subuh - Oktober New',
      campaignStatus: 'New',
      entityName: 'Salingbantu',
      entityId: entityMap['Salingbantu'],
      platformName: 'salingbantu.in',
      platformId: platformMap['salingbantu.in'],
      campaignUrl: 'https://salingbantu.in/campaign/sedekah-subuh-berbagi-pada-waktu-yang-istimewa',
      shortUrl: '',
      contentCategory: 'Referensi',
      priority: 'Urgent',
      deadline: new Date('2025-10-25T23:59:59Z'),
      advertiserId: rezza.id,
      copywriterId: rezza.id,
      videoEditorId: faisal.id,
      createdById: rezza.id,
      title: 'Sedekah Subuh Berbagi Di Waktu Istimewa',
      videoCount: 6,
      briefAdvertiser: 'Untuk videonya di buatkan 6 VT, dan konsep video di serahkan kepada editor untuk referensi ada di link referensi.',
      objective: 'Peningkatan partisipasi sedekah subuh harian',
      targetAudience: 'Donatur harian subuh',
      keyMessage: 'Dua malaikat mendoakan orang yang bersedekah di subuh hari.',
      cta: 'Sedekah Subuh',
      toDo: 'Sudah disetujui, siap tayang',
      additionalInfo: '',
      assetLink: 'https://drive.google.com/drive/folders/sedekah-subuh-oktober',
      referenceUrl: '',
      previousVt: '',
      campaignRefUrl: 'https://salingbantu.in/campaign/sedekah-subuh-berbagi-pada-waktu-yang-istimewa',
      additionalRefLinks: JSON.stringify([]),
      status: 'READY_TO_PUBLISH',
      statusRunning: 'Running',
      grade: 'A',
    },
  ];

  for (const req of sampleRequests) {
    const created = await prisma.contentRequest.upsert({
      where: { id: req.id },
      update: {},
      create: req,
    });

    // Create Initial Status History
    await prisma.contentStatusHistory.create({
      data: {
        contentId: created.id,
        previousStatus: null,
        newStatus: 'REQUESTED',
        changedById: rezza.id,
        note: 'Initial content request created',
      },
    });

    if (req.status !== 'REQUESTED') {
      await prisma.contentStatusHistory.create({
        data: {
          contentId: created.id,
          previousStatus: 'REQUESTED',
          newStatus: req.status,
          changedById: admin.id,
          note: `Workflow status updated to ${req.status}`,
        },
      });
    }

    // Add sample revisions for CNT-2025-0005 (Sembako in REVISION)
    if (req.id === 'CNT-2025-0005') {
      await prisma.contentRevision.create({
        data: {
          contentId: created.id,
          revisionNumber: 1,
          feedback: 'Hook pada 3 detik pertama perlu dibuat lebih kuat. Tambahkan audio voiceover Ust. Adi Hidayat dengan ritme lebih cepat.',
          requestedById: rezza.id,
          assignedToId: faisal.id,
          isCompleted: false,
        },
      });
    }

    // Add sample versions for CNT-2026-0001
    if (req.id === 'CNT-2026-0001') {
      await prisma.contentVersion.create({
        data: {
          contentId: created.id,
          versionNumber: 1,
          title: 'Draft Edit 1 - First Cut',
          script: 'Kami terpaksa makan ayam busuk karena tak ada lagi yang bisa dimakan.',
          videoUrl: 'https://vimeo.com/sample/gaza-cut-1',
          status: 'Review',
          uploadedById: putri.id,
        },
      });
    }

    // Add sample comments
    await prisma.comment.create({
      data: {
        contentId: created.id,
        userId: rezza.id,
        text: 'Mohon perhatikan deadline ya team, campaign ini prioritas utama minggu ini!',
      },
    });

    if (req.videoEditorId) {
      await prisma.comment.create({
        data: {
          contentId: created.id,
          userId: req.videoEditorId,
          text: 'Siap mas Rezza, footage sedang kita proses color grading & audio sync.',
        },
      });
    }
  }

  console.log('Sample content requests seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
