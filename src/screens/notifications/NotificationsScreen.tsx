// src/screens/notifications/NotificationsScreen.tsx

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {
  getNotifications,
  markAllAsRead,
  deleteNotification,
} from '../../services/notificationService';
import { useAuthStore } from '../../store/authStore';
import { getUserProfile } from '../../services/userService';
import { Notification, User } from '../../types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NotificationWithUser extends Notification {
  fromUser?: User;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getNotifIcon = (type: string): string => {
  switch (type) {
    case 'like':    return '❤️';
    case 'comment': return '💬';
    case 'follow':  return '👤';
    default:        return '🔔';
  }
};

const getNotifMessage = (type: string, username: string): string => {
  switch (type) {
    case 'like':    return `@${username} a aimé ta vidéo`;
    case 'comment': return `@${username} a commenté ta vidéo`;
    case 'follow':  return `@${username} s'est abonné à toi`;
    default:        return `@${username} a interagi avec toi`;
  }
};

const formatTimeAgo = (date: Date): string => {
  if (!date) return '';
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60)  return 'À l\'instant';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}min`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}j`;
};

// ─── Component ────────────────────────────────────────────────────────────────

const NotificationsScreen = () => {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<NotificationWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const [error, setError] = useState('');

  // ─── Charger les notifications ────────────────────────────────────────
  const loadNotifications = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError('');

    try {
      const notifs = await getNotifications(user.uid);

      // Charger les profils des expéditeurs en parallèle
      const notifsWithUsers = await Promise.all(
        notifs.map(async (notif) => {
          try {
            const fromUser = await getUserProfile(notif.fromUid);
            return { ...notif, fromUser: fromUser ?? undefined };
          } catch {
            return notif;
          }
        })
      );

      setNotifications(notifsWithUsers);
    } catch (err: any) {
      setError('Erreur lors du chargement des notifications.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();
  }, []);

  // ─── Marquer toutes comme lues ────────────────────────────────────────
  const handleMarkAllRead = async () => {
    if (!user) return;
    setIsMarkingRead(true);
    try {
      await markAllAsRead(user.uid);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
    } catch (err: any) {
      setError('Erreur lors de la mise à jour.');
    } finally {
      setIsMarkingRead(false);
    }
  };

  // ─── Supprimer une notification ───────────────────────────────────────
  const handleDelete = async (notifId: string) => {
    try {
      await deleteNotification(notifId);
      setNotifications((prev) =>
        prev.filter((n) => n.notifId !== notifId)
      );
    } catch {
      setError('Erreur lors de la suppression.');
    }
  };

  // ─── Rendu d'une notification ─────────────────────────────────────────
  const renderNotification = ({ item }: { item: NotificationWithUser }) => (
    <TouchableOpacity
      style={[
        styles.notifCard,
        !item.read && styles.notifCardUnread,
      ]}
      onLongPress={() => handleDelete(item.notifId)}
      activeOpacity={0.7}>

      {/* Indicateur non lu */}
      {!item.read && <View style={styles.unreadDot} />}

      {/* Icône type */}
      <View style={styles.notifIconContainer}>
        <Text style={styles.notifIcon}>{getNotifIcon(item.type)}</Text>
      </View>

      {/* Avatar expéditeur */}
      <View style={styles.senderAvatar}>
        {item.fromUser?.avatarUrl ? (
          <View style={styles.avatarImage}>
            <Text style={styles.avatarFallback}>
              {item.fromUser.username?.[0]?.toUpperCase()}
            </Text>
          </View>
        ) : (
          <View style={styles.avatarFallbackContainer}>
            <Text style={styles.avatarFallback}>
              {item.fromUser?.username?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
        )}
      </View>

      {/* Message */}
      <View style={styles.notifContent}>
        <Text style={styles.notifMessage}>
          {getNotifMessage(
            item.type,
            item.fromUser?.username || 'Utilisateur'
          )}
        </Text>
        <Text style={styles.notifTime}>
          {formatTimeAgo(item.createdAt)}
        </Text>
      </View>

    </TouchableOpacity>
  );

  // ─── Séparateur ───────────────────────────────────────────────────────
  const renderSeparator = () => <View style={styles.separator} />;

  // ─── Etat vide ────────────────────────────────────────────────────────
  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🔔</Text>
        <Text style={styles.emptyTitle}>Aucune notification</Text>
        <Text style={styles.emptySubtext}>
          Tes notifications apparaîtront ici
        </Text>
      </View>
    );
  };

  // ─── Nombre de non lues ───────────────────────────────────────────────
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={handleMarkAllRead}
            disabled={isMarkingRead}>
            {isMarkingRead ? (
              <ActivityIndicator color="#fe2c55" size="small" />
            ) : (
              <Text style={styles.markReadText}>
                Tout lire ({unreadCount})
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Erreur */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Chargement */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#fe2c55" size="large" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.notifId}
          ItemSeparatorComponent={renderSeparator}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          onRefresh={loadNotifications}
          refreshing={isLoading}
          contentContainerStyle={
            notifications.length === 0 ? styles.emptyList : undefined
          }
        />
      )}

    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  markReadText: {
    color: '#fe2c55',
    fontSize: 13,
    fontWeight: '600',
  },
  errorContainer: {
    margin: 16,
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
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    position: 'relative',
  },
  notifCardUnread: {
    backgroundColor: '#0d0d0d',
  },
  unreadDot: {
    position: 'absolute',
    left: 6,
    top: '50%',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fe2c55',
  },
  notifIconContainer: {
    marginRight: 4,
  },
  notifIcon: {
    fontSize: 18,
  },
  senderAvatar: {
    marginRight: 12,
    marginLeft: 4,
  },
  avatarFallbackContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallback: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  notifContent: {
    flex: 1,
    gap: 3,
  },
  notifMessage: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  notifTime: {
    color: '#666',
    fontSize: 12,
  },
  separator: {
    height: 1,
    backgroundColor: '#1a1a1a',
    marginLeft: 16,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 52,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default NotificationsScreen;