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