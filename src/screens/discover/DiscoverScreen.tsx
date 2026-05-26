// src/screens/discover/DiscoverScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { searchUsers } from '../../services/userService';
import { User } from '../../types';

// ─── Component ────────────────────────────────────────────────────────────────

const DiscoverScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');

  // ─── Recherche utilisateurs ───────────────────────────────────────────
  const handleSearch = useCallback(async (text: string) => {
    setSearchText(text);
    setError('');

    if (text.trim().length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const users = await searchUsers(text.trim().toLowerCase());
      setResults(users);
    } catch (err: any) {
      setError('Erreur lors de la recherche.');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // ─── Effacer la recherche ─────────────────────────────────────────────
  const handleClear = () => {
    setSearchText('');
    setResults([]);
    setHasSearched(false);
    setError('');
  };

  // ─── Rendu d'un utilisateur ───────────────────────────────────────────
  const renderUser = ({ item }: { item: User }) => (
    <TouchableOpacity style={styles.userCard}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {item.avatarUrl ? (
          <Image
            source={{ uri: item.avatarUrl }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarPlaceholderText}>
              {item.username?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
        )}
      </View>

      {/* Infos */}
      <View style={styles.userInfo}>
        <Text style={styles.username}>@{item.username}</Text>
        <Text style={styles.userStats}>
          {item.followersCount > 999
            ? `${(item.followersCount / 1000).toFixed(1)}k`
            : item.followersCount}{' '}
          abonnés · {item.videosCount} vidéos
        </Text>
        {item.bio ? (
          <Text style={styles.userBio} numberOfLines={1}>
            {item.bio}
          </Text>
        ) : null}
      </View>

      {/* Bouton follow */}
      <TouchableOpacity style={styles.followButton}>
        <Text style={styles.followButtonText}>Suivre</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // ─── Séparateur ───────────────────────────────────────────────────────
  const renderSeparator = () => <View style={styles.separator} />;

  // ─── Rendu état vide ──────────────────────────────────────────────────
  const renderEmpty = () => {
    if (isSearching) return null;

    if (!hasSearched) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>Trouve des créateurs</Text>
          <Text style={styles.emptySubtext}>
            Recherche par nom d'utilisateur
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>😕</Text>
        <Text style={styles.emptyTitle}>Aucun résultat</Text>
        <Text style={styles.emptySubtext}>
          Essaie un autre nom d'utilisateur
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Découvrir</Text>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher des utilisateurs..."
            placeholderTextColor="#666"
            value={searchText}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={handleClear}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Erreur */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Spinner recherche */}
      {isSearching && (
        <View style={styles.searchingContainer}>
          <ActivityIndicator color="#fe2c55" size="small" />
          <Text style={styles.searchingText}>Recherche en cours...</Text>
        </View>
      )}

      {/* Résultats */}
      <FlatList
        data={results}
        renderItem={renderUser}
        keyExtractor={(item) => item.uid}
        ItemSeparatorComponent={renderSeparator}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          results.length === 0 ? styles.emptyList : undefined
        }
      />

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
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    padding: 0,
  },
  clearIcon: {
    color: '#666',
    fontSize: 16,
    paddingLeft: 8,
  },
  errorContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
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
  searchingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  searchingText: {
    color: '#666',
    fontSize: 14,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#fe2c55',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderText: {
    color: '#fe2c55',
    fontSize: 20,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  username: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  userStats: {
    color: '#888',
    fontSize: 12,
  },
  userBio: {
    color: '#aaa',
    fontSize: 12,
  },
  followButton: {
    backgroundColor: '#fe2c55',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 8,
  },
  followButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  separator: {
    height: 1,
    backgroundColor: '#1a1a1a',
    marginLeft: 80,
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
  },
});

export default DiscoverScreen;