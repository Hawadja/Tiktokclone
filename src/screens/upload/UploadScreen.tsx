// src/screens/upload/UploadScreen.tsx

import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useVideoUpload } from '../../hooks/useVideoUpload';

const UploadScreen = () => {
  const {
    videoUri,
    videoName,
    caption,
    tagsInput,
    isUploading,
    uploadProgress,
    error,
    setCaption,
    setTagsInput,
    setError,
    pickVideo,
    publishVideo,
    reset,
  } = useVideoUpload();

  const handleUpload = async () => {
    const success = await publishVideo();
    if (success) {
      Alert.alert('Succès', 'Ta vidéo a été publiée !');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled">

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nouvelle vidéo</Text>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={[styles.videoPicker, videoUri ? styles.videoPickerSelected : null]}
        onPress={pickVideo}
        disabled={isUploading}>
        {videoUri ? (
          <View style={styles.videoSelectedInfo}>
            <Text style={styles.videoSelectedIcon}>🎬</Text>
            <Text style={styles.videoSelectedName} numberOfLines={1}>
              {videoName}
            </Text>
            <Text style={styles.videoChangeText}>Appuyer pour changer</Text>
          </View>
        ) : (
          <View style={styles.videoPickerContent}>
            <Text style={styles.videoPickerIcon}>📹</Text>
            <Text style={styles.videoPickerText}>Sélectionner une vidéo</Text>
            <Text style={styles.videoPickerSubtext}>MP4 · Max 60 secondes</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.form}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.captionInput}
          placeholder="Décris ta vidéo..."
          placeholderTextColor="#666"
          value={caption}
          onChangeText={(text) => { setCaption(text); setError(''); }}
          multiline
          maxLength={150}
          editable={!isUploading}
        />
        <Text style={styles.charCount}>{caption.length}/150</Text>

        <Text style={styles.label}>Tags</Text>
        <TextInput
          style={styles.input}
          placeholder="#tag1 #tag2 #tag3"
          placeholderTextColor="#666"
          value={tagsInput}
          onChangeText={setTagsInput}
          autoCapitalize="none"
          editable={!isUploading}
        />
        <Text style={styles.inputHint}>Sépare les tags par des espaces</Text>
      </View>

      {isUploading && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
          </View>
          <Text style={styles.progressText}>{uploadProgress}%</Text>
        </View>
      )}

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[
            styles.publishButton,
            (!videoUri || !caption.trim() || isUploading) && styles.buttonDisabled,
          ]}
          onPress={handleUpload}
          disabled={!videoUri || !caption.trim() || isUploading}>
          {isUploading ? (
            <View style={styles.uploadingRow}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.publishButtonText}>Publication...</Text>
            </View>
          ) : (
            <Text style={styles.publishButtonText}>Publier</Text>
          )}
        </TouchableOpacity>

        {!isUploading && videoUri ? (
          <TouchableOpacity style={styles.cancelButton} onPress={reset}>
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorContainer: {
    margin: 20,
    marginBottom: 0,
    backgroundColor: '#2a0a0f',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#fe2c55',
  },
  errorText: {
    color: '#fe2c55',
    fontSize: 13,
  },
  videoPicker: {
    margin: 20,
    height: 180,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2a2a2a',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111',
  },
  videoPickerSelected: {
    borderColor: '#fe2c55',
    borderStyle: 'solid',
    backgroundColor: '#1a0a0f',
  },
  videoPickerContent: {
    alignItems: 'center',
    gap: 8,
  },
  videoPickerIcon: {
    fontSize: 40,
  },
  videoPickerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  videoPickerSubtext: {
    color: '#666',
    fontSize: 13,
  },
  videoSelectedInfo: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  videoSelectedIcon: {
    fontSize: 40,
  },
  videoSelectedName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  videoChangeText: {
    color: '#fe2c55',
    fontSize: 12,
  },
  form: {
    paddingHorizontal: 20,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 14,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  captionInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 14,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    color: '#666',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  inputHint: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  progressContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    gap: 6,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#1a1a1a',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fe2c55',
    borderRadius: 3,
  },
  progressText: {
    color: '#fe2c55',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttons: {
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 12,
  },
  publishButton: {
    backgroundColor: '#fe2c55',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  publishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  uploadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cancelButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  cancelButtonText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UploadScreen;