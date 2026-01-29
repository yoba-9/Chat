// data/dummyData.ts
export interface User {
  id: string;
  name: string;
  avatar: string;
  lastSeen: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  messages: Message[];
  isPinned: boolean;
  unreadCount: number;
}

  export const users: User[] = [
    {
      id: '1',
      name: 'You',
      avatar: '/placeholder.svg',
      lastSeen: 'Online',
    },
    {
      id: '2',
      name: 'Alemayew Sisay',
      avatar: '/placeholder.svg',
      lastSeen: '2 minutes ago',
    },
    {
      id: '3',
      name: 'Kebede Alemu',
      avatar: '/placeholder.svg',
      lastSeen: '5 minutes ago',
    },
    {
      id: '4',
      name: 'Bedilu Chakisa',
      avatar: '/placeholder.svg',
      lastSeen: '1 hour ago',
    },
    {
      id: '5',
      name: 'Aynalem Mulatu',
      avatar: '/placeholder.svg',
      lastSeen: '3 hours ago',
    },
    {
      id: '6',
      name: 'Wegayehu G/egzhaber',
      avatar: '/placeholder.svg',
      lastSeen: 'Yesterday',
    },
  ];
  
  export const chats: Chat[] = [
    {
        id: '1',
        participants: ['1', '2'],
        isPinned: true,
        unreadCount: 2,
        messages: [
          {
            id: '1',
            senderId: '2',
            receiverId: '1',
            content: 'Hey! How are you doing?',
            timestamp: '2023-06-01T10:00:00Z',
            isRead: true,
          },
          {
            id: '2',
            senderId: '1',
            receiverId: '2',
            content: 'Hi Alice! Im doing great, thanks for asking. How about you?',
            timestamp: '2023-06-01T10:05:00Z',
            isRead: true,
          },
          {
            id: '3',
            senderId: '2',
            receiverId: '1',
            content: 'Im good too! Just wanted to check in.',
            timestamp: '2023-06-01T10:10:00Z',
            isRead: false,
          },
          {
            id: '4',
            senderId: '2',
            receiverId: '1',
            content: 'Are we still on for lunch tomorrow?',
            timestamp: '2023-06-01T10:15:00Z',
            isRead: false,
          },
          {
            id: '5',
            senderId: '1',
            receiverId: '2',
            content: 'Looking forward to it. Shall we meet at the usual spot?',
            timestamp: '2023-06-01T10:20:00Z',
            isRead: true,
          },
         /*  {
            id: '6',
            senderId: '2',
            receiverId: '1',
            content: 'Perfect! See you there at 12:30.',
            timestamp: '2023-06-01T10:25:00Z',
            isRead: false,
          },
          {
            id: '7',
            senderId: '1',
            receiverId: '2',
            content: 'Wow Wow Wow',
            timestamp: '2023-06-01T10:25:00Z',
            isRead: false,
          },
          {
            id: '7',
            senderId: '2',
            receiverId: '1',
            content: 'ikr',
            timestamp: '2023-06-01T10:25:00Z',
            isRead: false,
          },
          {
            id: '8',
            senderId: '2',
            receiverId: '1',
            content: 'its beautiful',
            timestamp: '2023-06-01T10:25:00Z',
            isRead: false,
          }, */
        ],
      },
    {
      id: '2',
      participants: ['1', '3'],
      isPinned: false,
      unreadCount: 0,
      messages: [
        {
          id: '5',
          senderId: '1',
          receiverId: '3',
          content: 'Hey Bob, did you get a chance to look at the project proposal?',
          timestamp: '2023-06-01T11:00:00Z',
          isRead: true,
        },
        {
          id: '6',
          senderId: '3',
          receiverId: '1',
          content: 'Yes, I did. It looks great! I have a few minor suggestions.',
          timestamp: '2023-06-01T11:15:00Z',
          isRead: true,
        },
        {
          id: '7',
          senderId: '1',
          receiverId: '3',
          content: 'Awesome! Lets discuss them in our next meeting.',
          timestamp: '2023-06-01T11:20:00Z',
          isRead: true,
        },
      ],
    },
    {
      id: '3',
      participants: ['1', '4'],
      isPinned: true,
      unreadCount: 1,
      messages: [
        {
          id: '8',
          senderId: '4',
          receiverId: '1',
          content: 'Dont forget about the team building event this Friday!',
          timestamp: '2023-06-01T09:00:00Z',
          isRead: true,
        },
        {
          id: '9',
          senderId: '1',
          receiverId: '4',
          content: 'Thanks for the reminder, Charlie. Im looking forward to it!',
          timestamp: '2023-06-01T09:05:00Z',
          isRead: true,
        },
        {
          id: '10',
          senderId: '4',
          receiverId: '1',
          content: 'Great! Its going to be fun.',
          timestamp: '2023-06-01T09:10:00Z',
          isRead: false,
        },
      ],
    },
    {
      id: '4',
      participants: ['1', '5'],
      isPinned: false,
      unreadCount: 0,
      messages: [
        {
          id: '11',
          senderId: '5',
          receiverId: '1',
          content: 'Hi there! I heard youre working on a new project.',
          timestamp: '2023-05-31T14:00:00Z',
          isRead: true,
        },
        {
          id: '12',
          senderId: '1',
          receiverId: '5',
          content: 'Hey Diana! Yes, thats right. Its quite exciting!',
          timestamp: '2023-05-31T14:30:00Z',
          isRead: true,
        },
      ],
    },
    {
      id: '5',
      participants: ['1', '6'],
      isPinned: false,
      unreadCount: 3,
      messages: [
        {
          id: '13',
          senderId: '6',
          receiverId: '1',
          content: 'Hello! Can we schedule a meeting for next week?',
          timestamp: '2023-05-30T11:00:00Z',
          isRead: false,
        },
        {
          id: '14',
          senderId: '6',
          receiverId: '1',
          content: 'I have some ideas Id like to discuss.',
          timestamp: '2023-05-30T11:05:00Z',
          isRead: false,
        },
        {
          id: '15',
          senderId: '6',
          receiverId: '1',
          content: 'Let me know what times work best for you.',
          timestamp: '2023-05-30T11:10:00Z',
          isRead: false,
        },
      ],
    },
  ];