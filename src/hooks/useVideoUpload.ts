// src/hooks/useVideoUpload.ts

import { useState } from 'react';
import { launchImageLibrary } from 'react-native-image-picker';
import { uploadVideo, createVideo } from '../services/videoService';
import { useAuthStore } from '../store/authStore';
import { useFeedStore } from '../store/feedStore';

interface UploadState {
  videoUri: string | null;
  videoName: string;
  caption: string;
  tagsInput: string;
  isUploading: boolean;
  uploadProgress: number;
  error: string;
}

const initialState: UploadState = {
  videoUri: null,
  videoName: '',
  caption: '',
  tagsInput: '',
  isUploading: false,
  uploadProgress: 0,
  error: '',
};

export const useVideoUpload = () => {
  const [state, setState] = useState<UploadState>(initialState);
  const { user } = useAuthStore();
  const { refreshFeed } = useFeedStore();

  const setField = <K extends keyof UploadState>(
    key: K,
    value: UploadState[K]
  ) => setState((prev) => ({ ...prev, [key]: value }));

  // ─── Sélectionner une vidéo ─────────────────────────────────────────
  const pickVideo = (): Promise<void> => {
    return new Promise((resolve) => {
      launchImageLibrary(
        {
          mediaType: 'video',
          videoQuality: 'high',
        },
        (response) => {
          if (response.didCancel || response.errorCode) {
            resolve();
            return;
          }

          const asset = response.assets?.[0];
          if (!asset?.uri) {
            resolve();
            return;
          }

          if (asset.duration && asset.duration > 60) {
            setField('error', 'La vidéo ne doit pas dépasser 60 secondes.');
            resolve();
            return;
          }

          setState((prev) => ({
            ...prev,
            videoUri: asset.uri!,
            videoName: asset.fileName || 'video.mp4',
            error: '',
          }));

          resolve();
        }
      );
    });
  };

  // ─── Publier la vidéo ───────────────────────────────────────────────
  const publishVideo = async (): Promise<boolean> => {
    if (!state.videoUri) {
      setField('error', 'Veuillez sélectionner une vidéo.');
      return false;
    }

    if (!state.caption.trim()) {
      setField('error', 'Veuillez ajouter une description.');
      return false;
    }

    if (!user) return false;

    setState((prev) => ({
      ...prev,
      isUploading: true,
      uploadProgress: 0,
      error: '',
    }));

    try {
      const videoUrl = await uploadVideo(
        state.videoUri,
        user.uid,
        (progress) => setField('uploadProgress', progress)
      );

      const tags = state.tagsInput
        .split(' ')
        .map((t) => t.replace('#', '').trim().toLowerCase())
        .filter((t) => t.length > 0);

      await createVideo(user.uid, videoUrl, state.caption.trim(), tags);
      await refreshFeed();

      setState(initialState);
      return true;
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        isUploading: false,
        error: err.message || 'Erreur lors de la publication.',
      }));
      return false;
    }
  };

  const reset = () => setState(initialState);

  return {
    ...state,
    setCaption: (text: string) => setField('caption', text),
    setTagsInput: (text: string) => setField('tagsInput', text),
    setError: (text: string) => setField('error', text),
    pickVideo,
    publishVideo,
    reset,
  };
};