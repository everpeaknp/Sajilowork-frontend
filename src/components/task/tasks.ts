import { Task } from './types';

export const MOCK_TASKS: Task[] = [
  {
    id: '1',
    slug: 'assemble-ikea-pax-wardrobe-with-4-drawers',
    title: "Assemble IKEA Pax Wardrobe with 4 drawers",
    status: "Posted 2h ago",
    location: "Wanneroo, WA",
    coordinates: [-31.7490, 115.8080] as [number, number],
    price: 145,
    category: "Builder",
    workType: "in-person",
    postedDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    description: "I need someone to assemble an IKEA Pax wardrobe. It has 4 drawers and double doors. All tools and parts are ready. Looking for someone with experience in IKEA furniture assembly.",
    hasOffers: true,
    isAssigned: false,
    user: {
      name: "Alex M.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop",
      rating: 4.9
    }
  },
  {
    id: '2',
    slug: 'gardening-lawn-mowing-for-front-yard',
    title: "Gardening & lawn mowing for front yard",
    status: "Posted 5h ago",
    location: "Pearsall, WA",
    coordinates: [-31.7820, 115.8230] as [number, number],
    price: 80,
    category: "Labour",
    workType: "in-person",
    postedDate: new Date(Date.now() - 5 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    description: "Mow the lawn in the front yard and trim the edges. Also need some weeding done in the small flower bed near the porch. Clippings can be put in our green bin.",
    hasOffers: false,
    isAssigned: false,
    statusColor: "bg-blue-500",
    user: {
      name: "Sarah J.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop",
      rating: 5.0
    }
  },
  {
    id: '3',
    slug: 'end-of-lease-cleaning-2-bed-2-bath-apartment',
    title: "End of lease cleaning - 2 bed 2 bath apartment",
    status: "Posted 1d ago",
    location: "Joondalup, WA",
    coordinates: [-31.7450, 115.7660] as [number, number],
    price: 280,
    category: "Cleaning",
    workType: "in-person",
    postedDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    description: "Full end of lease clean for a 2 bedroom, 2 bathroom apartment including oven, windows (inside), and carpet steam cleaning. Must provide own equipment and cleaning supplies. Receipt required for bond return.",
    hasOffers: true,
    isAssigned: true,
    user: {
      name: "Mike R.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop",
      rating: 4.8
    }
  },
  {
    id: '4',
    slug: 'fix-leaky-bathroom-faucet-and-replace-shower-head',
    title: "Fix leaky bathroom faucet and replace shower head",
    status: "Posted 3h ago",
    location: "Carramar, WA",
    coordinates: [-31.7000, 115.7900] as [number, number],
    price: 120,
    category: "Mechanic",
    workType: "in-person",
    postedDate: new Date(Date.now() - 3 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    description: "The bathroom tap is constantly dripping. Also have a new shower head that needs to be installed. I have the new shower head but any washers or extra parts for the tap will need to be provided or I can reimburse.",
    hasOffers: false,
    isAssigned: false,
    user: {
      name: "David K.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop",
      rating: 4.7
    }
  }
];
