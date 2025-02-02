# Very Very Anonymous Chat

A secure and anonymous chat application that enables users to communicate through unique IDs, built with Next.js and Supabase..

## 🌟 Features

- **Anonymous Identity**: Generate unique ID for each session
- **Secure Connection**: Private chat channels between users
- **Real-time Communication**: Instant messaging and notifications
- **Multi-language Support**: English and Turkish
- **Responsive Design**: Mobile and desktop friendly interface
- **Unread Messages**: Notifications for inactive chats
- **Auto-cleanup**: All data is automatically deleted on session end

## 🚀 Tech Stack

- **Frontend**: Next.js 13, React, TypeScript
- **Styling**: Tailwind CSS
- **Real-time**: Supabase Realtime
- **State Management**: React Hooks
- **UI Components**: react-icons, react-toastify

## 💻 Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account

### Setup Steps

1. Clone the repository:

```bash
git clone https://github.com/kuralayusha/anonim-chat.git
cd anonim-chat
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create `.env.local` file:

```env
SUPABASE_URL=your_SUPABASE_URL
SUPABASE_ANON_KEYyour_SUPABASE_ANON_KEY
```

4. Set up Supabase database tables:

```sql
-- Create tables for chat functionality
CREATE TABLE anonim_chat_users (
    id SERIAL PRIMARY KEY,
    user_uuid UUID NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE anonim_chat_connections (
    id SERIAL PRIMARY KEY,
    requester_uuid UUID NOT NULL,
    target_uuid UUID NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_uuid) REFERENCES anonim_chat_users(user_uuid),
    FOREIGN KEY (target_uuid) REFERENCES anonim_chat_users(user_uuid)
);

CREATE TABLE anonim_chat_messages (
    id SERIAL PRIMARY KEY,
    connection_id INTEGER NOT NULL,
    sender_uuid UUID NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (connection_id) REFERENCES anonim_chat_connections(id),
    FOREIGN KEY (sender_uuid) REFERENCES anonim_chat_users(user_uuid)
);
```

5. Start the development server:

```bash
npm run dev
# or
yarn dev
```

## 🎯 Usage

1. **Starting a Chat**

   - Access the application to receive a unique ID
   - Share your ID with someone you want to chat with
   - Enter their ID to send a connection request

2. **Managing Connections**

   - Accept or reject incoming connection requests
   - View all active connections in the sidebar
   - Delete connections to end chats

3. **Chatting**

   - Send and receive messages in real-time
   - See unread message notifications
   - Switch between different chat conversations

4. **Language Settings**
   - Toggle between English and Turkish using the language button
   - UI updates immediately reflect the selected language

## 🔒 Security Features

- **Session-based IDs**: New unique ID generated for each session
- **Auto-cleanup**: All data is automatically deleted when:
  - Page is refreshed
  - Browser is closed
  - Session ends
- **Private Channels**: Messages are only accessible to connected users

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

This project is licensed under the MIT License

---

⭐️ If you found this project helpful, please give it a star!
