// src/screens/profile/ProfileScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { launchImageLibrary, MediaType } from 'react-native-image-picker';
import { useAuthStore } from '../../store/authStore';
import { useProfileStore } from '../../store/profileStore';
import { Video } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_SIZE = SCREEN_WIDTH / 3;

const ProfileScreen = () => {
  const { user, logoutAction } = useAuthStore();
  const {
    profile,
    videos,
    isLoading,
    isUploadingAvatar,
    avatarUploadProgress,
    error,
    loadProfile,
    loadUserVideos,
    uploadAvatarAction,
    updateProfileAction,
    clearError,
    resetProfile,
  } = useProfileStore();

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState('');
  const [activeTab, setActiveTab] = useState<'videos' | 'liked'>('videos');

  useEffect(() => {
    if (!user) return;
    resetProfile();
    loadProfile(user.uid);
    loadUserVideos(user.uid);
  }, [user]);

  useEffect(() => {
    if (profile?.bio) setBioInput(profile.bio);
  }, [profile]);

  const handleChangeAvatar = () => {
    if (!user) return;
    launchImageLibrary(
      { mediaType: 'photo' as MediaType, quality: 0.8 },
      async (response) => {
        if (response.didCancel || response.errorCode) return;
        const asset = response.assets?.[0];
        if (!asset?.uri) return;
        await uploadAvatarAction(user.uid, asset.uri);
      }
    );
  };

  const handleSaveBio = async () => {
    if (!user) return;
    await updateProfileAction(user.uid, { bio: bioInput.trim() });
    setIsEditingBio(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Es-tu sûr de vouloir te déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnexion', style: 'destructive', onPress: () => logoutAction() },
      ]
    );
  };

  const renderVideoThumbnail = ({ item }: { item: Video }) => (
    <TouchableOpacity style={styles.videoThumbnail}>
      <View style={styles.thumbnailPlaceholder}>
        <Text style={styles.thumbnailIcon}>🎬</Text>
        <Text style={styles.thumbnailViews}>
          {item.viewsCount > 999
            ? `${(item.viewsCount / 1000).toFixed(1)}k`
            : item.viewsCount}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading && !profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#fe2c55" size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      <View style={styles.header}>
        <Text style={styles.headerUsername}>
          @{profile?.username || user?.username}
        </Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.avatarSection}>
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={handleChangeAvatar}
          disabled={isUploadingAvatar}>
          {profile?.avatarUrl ? (
            <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderText}>
                {profile?.username?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>
          )}
          {isUploadingAvatar ? (
            <View style={styles.avatarUploadOverlay}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.avatarUploadProgress}>
                {avatarUploadProgress}%
              </Text>
            </View>
          ) : (
            <View style={styles.avatarEditBadge}>
              <Text style={styles.avatarEditIcon}>📷</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{profile?.followingCount ?? 0}</Text>
          <Text style={styles.statLabel}>Abonnements</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{profile?.followersCount ?? 0}</Text>
          <Text style={styles.statLabel}>Abonnés</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{profile?.videosCount ?? 0}</Text>
          <Text style={styles.statLabel}>Vidéos</Text>
        </View>
      </View>

      <View style={styles.bioSection}>
        {isEditingBio ? (
          <View style={styles.bioEditContainer}>
            <TextInput
              style={styles.bioInput}
              value={bioInput}
              onChangeText={setBioInput}
              placeholder="Parle de toi..."
              placeholderTextColor="#666"
              multiline
              maxLength={100}
              autoFocus
            />
            <Text style={styles.bioCharCount}>{bioInput.length}/100</Text>
            <View style={styles.bioButtons}>
              <TouchableOpacity
                style={styles.bioCancelButton}
                onPress={() => setIsEditingBio(false)}>
                <Text style={styles.bioCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.bioSaveButton}
                onPress={handleSaveBio}>
                <Text style={styles.bioSaveText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setIsEditingBio(true)}>
            <Text style={styles.bioText}>
              {profile?.bio || 'Ajouter une bio...'}
            </Text>
            <Text style={styles.bioEditHint}>Appuyer pour modifier</Text>
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <TouchableOpacity style={styles.errorContainer} onPress={clearError}>
          <Text style={styles.errorText}>{error}</Text>
        </TouchableOpacity>
      ) : null}

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'videos' && styles.tabActive]}
          onPress={() => setActiveTab('videos')}>
          <Text style={[styles.tabText, activeTab === 'videos' && styles.tabTextActive]}>
            🎬 Vidéos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'liked' && styles.tabActive]}
          onPress={() => setActiveTab('liked')}>
          <Text style={[styles.tabText, activeTab === 'liked' && styles.tabTextActive]}>
            ❤️ Aimées
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'videos' ? (
        videos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🎬</Text>
            <Text style={styles.emptyText}>Aucune vidéo publiée pour l'instant</Text>
          </View>
        ) : (
          <FlatList
            data={videos}
            renderItem={renderVideoThumbnail}
            keyExtractor={(item) => item.videoId}
            numColumns={3}
            scrollEnabled={false}
            contentContainerStyle={styles.videosGrid}
          />
        )
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>❤️</Text>
          <Text style={styles.emptyText}>Les vidéos aimées apparaîtront ici</Text>
        </View>
      )}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  loadingContainer: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerUsername: { color: '#fff', fontSize: 18, fontWeight: '700' },
  logoutIcon: { fontSize: 24 },
  avatarSection: { alignItems: 'center', marginVertical: 16 },
  avatarContainer: { position: 'relative' },
  avatar: { width: 96, height: 96, borderRadius: 48, borderWidth: 2, borderColor: '#fe2c55' },
  avatarPlaceholder: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#1a1a1a', borderWidth: 2, borderColor: '#fe2c55',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarPlaceholderText: { color: '#fe2c55', fontSize: 36, fontWeight: '700' },
  avatarUploadOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 48, backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  avatarUploadProgress: { color: '#fff', fontSize: 11, fontWeight: '600' },
  avatarEditBadge: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: '#fe2c55', borderRadius: 12,
    width: 24, height: 24, alignItems: 'center', justifyContent: 'center',
  },
  avatarEditIcon: { fontSize: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20 },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { color: '#fff', fontSize: 20, fontWeight: '700' },
  statLabel: { color: '#888', fontSize: 12, marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: '#2a2a2a' },
  bioSection: { paddingHorizontal: 20, paddingVertical: 12, alignItems: 'center' },
  bioText: { color: '#fff', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  bioEditHint: { color: '#666', fontSize: 11, textAlign: 'center', marginTop: 4 },
  bioEditContainer: { width: '100%' },
  bioInput: {
    backgroundColor: '#1a1a1a', borderRadius: 8, padding: 12,
    color: '#fff', fontSize: 14, borderWidth: 1, borderColor: '#fe2c55',
    minHeight: 80, textAlignVertical: 'top',
  },
  bioCharCount: { color: '#666', fontSize: 11, textAlign: 'right', marginTop: 4 },
  bioButtons: { flexDirection: 'row', gap: 8, marginTop: 8 },
  bioCancelButton: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#2a2a2a', alignItems: 'center' },
  bioCancelText: { color: '#888', fontSize: 14, fontWeight: '600' },
  bioSaveButton: { flex: 1, padding: 10, borderRadius: 8, backgroundColor: '#fe2c55', alignItems: 'center' },
  bioSaveText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  errorContainer: { marginHorizontal: 20, marginBottom: 12, backgroundColor: '#2a0a0f', borderRadius: 8, padding: 10, borderLeftWidth: 3, borderLeftColor: '#fe2c55' },
  errorText: { color: '#fe2c55', fontSize: 13 },
  tabs: { flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#1a1a1a', marginTop: 8 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#fe2c55' },
  tabText: { color: '#666', fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  videosGrid: { paddingTop: 2 },
  videoThumbnail: { width: ITEM_SIZE, height: ITEM_SIZE, padding: 1 },
  thumbnailPlaceholder: { flex: 1, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center' },
  thumbnailIcon: { fontSize: 28 },
  thumbnailViews: { position: 'absolute', bottom: 4, left: 4, color: '#fff', fontSize: 11, fontWeight: '600' },
  emptyContainer: { paddingVertical: 60, alignItems: 'center', gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: '#666', fontSize: 14, textAlign: 'center' },
});

export default ProfileScreen;