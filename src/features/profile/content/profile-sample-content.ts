export type ProfileSampleEntry = {
  date: string;
  duration: string;
  image: string;
  rotationClass: string;
  title: string;
};

export const profileSampleCardContent = {
  alt: 'Minh Tú Nguyen',
  badge: '#TRAVELER',
  image:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&auto=format&fit=crop',
  name: 'Minh Tú Nguyen',
  quote:
    '"Kế lữ hành không có điểm đến cố định, và mục đích không phải là để tới đâu đó. Tôi đi để được thấy thế giới qua lăng kính của những trang giấy cũ."',
} as const;

export const profileSampleStats = [
  {
    labelLines: ['Chuyến', 'đi'],
    value: '42',
  },
  {
    labelLines: ['Theo', 'dõi'],
    value: '1.2k',
  },
  {
    labelLines: ['Đang', 'theo'],
    value: '850',
  },
] as const;

export const profileSampleEntries: ProfileSampleEntry[] = [
  {
    date: '12 Tháng 1, 2024',
    duration: '4 ngày',
    image:
      'https://images.unsplash.com/photo-1512453979798-5ea26e3a8095?q=80&w=600&h=600&auto=format&fit=crop',
    rotationClass: '-rotate-2',
    title: 'Sương mù Sapa',
  },
  {
    date: '20 Tháng 8, 2023',
    duration: '1 tuần',
    image:
      'https://images.unsplash.com/photo-1540541338287-417002071661?q=80&w=600&h=600&auto=format&fit=crop',
    rotationClass: 'rotate-3',
    title: 'Mùa hè ở Phú Quốc',
  },
  {
    date: '05 Tháng 10, 2023',
    duration: '3 ngày',
    image:
      'https://images.unsplash.com/photo-1528127291456-1e8d0115e47c?q=80&w=600&h=600&auto=format&fit=crop',
    rotationClass: 'rotate-1',
    title: 'Đèn lồng Hội An',
  },
  {
    date: '15 Tháng 5, 2023',
    duration: '2 ngày',
    image:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&h=600&auto=format&fit=crop',
    rotationClass: '-rotate-3',
    title: 'Vịnh Hạ Long xanh biếc',
  },
];
