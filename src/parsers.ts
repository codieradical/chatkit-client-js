import { BasicCursor } from "./cursor";
import { BasicMessage, MessagePart, BasicMessagePart } from "./message";
import { BasicRoom } from "./room";
import { BasicUser, Presence } from "./user";

export const parseBasicRoom = (data: any): BasicRoom => ({
  createdAt: data.created_at,
  createdByUserId: data.created_by_id,
  id: data.id,
  isPrivate: data.private,
  name: data.name,
  updatedAt: data.updated_at,
  customData: data.custom_data,
  deletedAt: data.deleted_at,
  unreadCount: data.unread_count,
  lastMessageAt: data.last_message_at,
})

export const parseBasicUser = (data: any): BasicUser => ({
  avatarURL: data.avatar_url,
  createdAt: data.created_at,
  customData: data.custom_data,
  id: data.id,
  name: data.name,
  updatedAt: data.updated_at,
})

export const parsePresence = (data: any): { state: Presence } => ({
  state: ["online", "offline"].indexOf(data.state) ? data.state : "unknown",
})

export const parseBasicMessage = (data: any): BasicMessage => {
  const roomId = data.room_id

  const basicMessage: BasicMessage = {
    roomId,
    id: data.id,
    senderId: data.user_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }

  if (data.parts) {
    // v3 message
    basicMessage.parts = data.parts.map((p: any) => parseMessagePart(p))
  } else {
    // v2 message
    basicMessage.text = data.text
    if (data.attachment) {
      basicMessage.attachment = parseMessageAttachment(data.attachment)
    }
  }

  return basicMessage
}

export const parseBasicCursor = (data: any): BasicCursor => ({
  position: data.position,
  updatedAt: data.updated_at,
  userId: data.user_id,
  roomId: data.room_id,
  type: data.cursor_type,
})

const parseMessageAttachment = (data: any): {link: string, type: string, name: string} => ({
  link: data.resource_link,
  type: data.type,
  name: data.name,
})

const parseMessagePart = (data: any): BasicMessagePart => {
  if (data.content) {
    return {
      partType: "inline",
      payload: {
        type: data.type,
        content: data.content,
      },
    }
  } else if (data.url) {
    return {
      partType: "url",
      payload: {
        type: data.type,
        url: data.url,
      },
    }
  } else if (data.attachment) {
    return {
      partType: "attachment",
      payload: {
        type: data.type,
        name: data.attachment.name,
        size: data.attachment.size,
        customData: data.attachment.custom_data,
        _id: data.attachment.id,
        _downloadURL: data.attachment.download_url,
        _expiration: new Date(data.attachment.expiration),
      },
    }
  } else {
    throw new TypeError("failed to parse message part")
  }
}
