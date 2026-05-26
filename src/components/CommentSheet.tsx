// src/components/CommentSheet.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { addComment, getComments, deleteComment } from '../services/commentService';
import { createNotification } from '../services/notificationService';
import { useAuthStore } from '../store/authStore';
import { Comment } from '../types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface CommentSheetProps {
  visible: boolean;
  videoId: string;
  videoOwnerId: string;
  onClose: () => void;
  onCommentAdded?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTimeAgo = (date: Date): string => {
  if (!date) return '';
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'À l\'instant';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}min`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}j`;
};

// ─── Component ────────────────────────────────────────────────────────────────

const CommentSheet = ({
  visible,
  videoId,
  videoOwnerId,
  onClose,
  onCommentAdded,
}: CommentSheetProps) => {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<TextInput>(null);

  // ─── Charger les commentaires quand la sheet s'ouvre ──────────────────
  useEffect(() => {
    if (visible && videoId) {
      loadComments();
    }
  }, [visible, videoId]);

  const loadComments = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getComments(videoId);
      setComments(data);
    } catch (err: any) {
      setError('Erreur lors du chargement des commentaires.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Envoyer un commentaire ───────────────────────────────────────────
  const handleSend = async () => {
    if (!commentText.trim() || !user || isSending) return;

    setIsSending(true);
    const text = commentText.trim();
    setCommentText('');

    try {
      const newComment = await addComment(videoId, user.uid, text);

      // Optimiste : ajouter immédiatement
      setComments((prev) => [newComment, ...prev]);

      // Notifier le propriétaire de la vidéo
      await createNotification(videoOwnerId, user.uid, 'comment', videoId);

      onCommentAdded?.();
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'envoi.");
      setCommentText(text); // Restaurer le texte
    } finally {
      setIsSending(false);
    }
  };

  // ─── Supprimer un commentaire ─────────────────────────────────────────
  const handleDelete = async (commentId: string) => {
    if (!user) return;
    try {
      await deleteComment(commentId, videoId, user.uid);
      setComments((prev) => prev.filter((c) => c.commentId !== commentId));
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression.');
    }
  };

  // ─── Rendu d'un commentaire ───────────────────────────────────────────
  const renderComment = ({ item }: { item: Comment }) => {
    const isOwner = user?.uid === item.uid;

    return (
      <TouchableOpacity
        style={styles.commentCard}
        onLongPress={() => isOwner && handleDelete(item.commentId)}
        activeOpacity={0.7}>

        {/* Avatar */}
        <View style={styles.commentAvatar}>
          <Text style={styles.commentAvatarText}>
            {item.uid?.[0]?.toUpperCase() || '?'}
          </Text>
        </View>

        {/* Contenu */}
        <View style={styles.commentContent}>
          <Text style={styles.commentUid}>@{item.uid}</Text>
          <Text style={styles.commentText}>{item.text}</Text>
          <View style={styles.commentMeta}>
            <Text style={styles.commentTime}>
              {formatTimeAgo(item.createdAt)}
            </Text>
            {isOwner && (
              <TouchableOpacity
                onPress={() => handleDelete(item.commentId)}>
                <Text style={styles.deleteText}>Supprimer</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>

      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.sheet}>

        {/* Handle bar */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        {/* Header */}
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>
            {comments.length} commentaire{comments.length !== 1 ? 's' : ''}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Erreur */}
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Liste commentaires */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#fe2c55" />
          </View>
        ) : (
          <FlatList
            data={comments}
            renderItem={renderComment}
            keyExtractor={(item) => item.commentId}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  Aucun commentaire. Sois le premier !
                </Text>
              </View>
            }
            contentContainerStyle={styles.commentsList}
          />
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Ajouter un commentaire..."
            placeholderTextColor="#666"
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={200}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!commentText.trim() || isSending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!commentText.trim() || isSending}>
            {isSending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.sendButtonText}>↑</Text>
            )}
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </Modal>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#111',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
    minHeight: 300,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#333',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  sheetTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  closeButton: {
    color: '#888',
    fontSize: 18,
    padding: 4,
  },
  errorContainer: {
    margin: 12,
    backgroundColor: '#2a0a0f',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#fe2c55',
  },
  errorText: {
    color: '#fe2c55',
    fontSize: 13,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  commentsList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  commentCard: {
    flexDirection: 'row',
    paddingVertical: 10,
    gap: 10,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  commentAvatarText: {
    color: '#fe2c55',
    fontSize: 14,
    fontWeight: '700',
  },
  commentContent: {
    flex: 1,
    gap: 3,
  },
  commentUid: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: '600',
  },
  commentText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  commentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 2,
  },
  commentTime: {
    color: '#666',
    fontSize: 11,
  },
  deleteText: {
    color: '#fe2c55',
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fe2c55',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default CommentSheet;