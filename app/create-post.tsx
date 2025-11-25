
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { manipulateAsync, FlipType, SaveFormat } from 'expo-image-manipulator';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_SIZE = (SCREEN_WIDTH - 48) / 3;

interface MediaItem {
  uri: string;
  type: 'image' | 'video';
  width?: number;
  height?: number;
}

interface MusicItem {
  uri: string;
  name: string;
  size?: number;
}

export default function CreatePostScreen() {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);
  const [music, setMusic] = useState<MusicItem | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  const player = useAudioPlayer(music?.uri || null);
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      console.log('User check:', user ? `User ID: ${user.id}` : 'No user found', error);
      
      if (user) {
        setUserId(user.id);
      } else {
        Alert.alert('Error', 'You must be logged in to create a post.');
        router.back();
      }
    } catch (error) {
      console.error('Error checking user:', error);
      Alert.alert('Error', 'Failed to verify user. Please try again.');
      router.back();
    }
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant permission to access your photos and videos.');
      return false;
    }
    return true;
  };

  const pickMedia = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsMultipleSelection: true,
        quality: 1,
        videoMaxDuration: 60,
      });

      console.log('Image picker result:', result);

      if (!result.canceled && result.assets) {
        const newMedia: MediaItem[] = result.assets.map(asset => ({
          uri: asset.uri,
          type: asset.type || 'image',
          width: asset.width,
          height: asset.height,
        }));
        console.log('Adding media items:', newMedia.length, 'items');
        console.log('Media URIs:', newMedia.map(m => m.uri));
        setMedia(prevMedia => [...prevMedia, ...newMedia]);
      }
    } catch (error) {
      console.error('Error picking media:', error);
      Alert.alert('Error', 'Failed to pick media. Please try again.');
    }
  };

  const pickMusic = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      console.log('Document picker result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setMusic({
          uri: asset.uri,
          name: asset.name,
          size: asset.size,
        });
        console.log('Music selected:', asset.name);
      }
    } catch (error) {
      console.error('Error picking music:', error);
      Alert.alert('Error', 'Failed to pick music. Please try again.');
    }
  };

  const removeMusic = () => {
    if (status.isPlaying) {
      player.pause();
    }
    setMusic(null);
  };

  const togglePlayPause = () => {
    if (status.isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant permission to access your camera.');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 1,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets) {
        const newMedia: MediaItem = {
          uri: result.assets[0].uri,
          type: 'image',
          width: result.assets[0].width,
          height: result.assets[0].height,
        };
        console.log('Photo taken:', newMedia.uri);
        setMedia(prevMedia => [...prevMedia, newMedia]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const removeMedia = (index: number) => {
    console.log('Removing media at index:', index);
    setMedia(prevMedia => prevMedia.filter((_, i) => i !== index));
    if (selectedMediaIndex === index) {
      setSelectedMediaIndex(null);
    }
  };

  const editImage = (index: number) => {
    if (media[index].type === 'video') {
      Alert.alert('Video Editing', 'Video editing is not available yet. Only image editing is supported.');
      return;
    }
    setSelectedMediaIndex(index);
  };

  const rotateImage = async () => {
    if (selectedMediaIndex === null) return;

    try {
      const manipResult = await manipulateAsync(
        media[selectedMediaIndex].uri,
        [{ rotate: 90 }],
        { compress: 1, format: SaveFormat.PNG }
      );

      const updatedMedia = [...media];
      updatedMedia[selectedMediaIndex] = {
        ...updatedMedia[selectedMediaIndex],
        uri: manipResult.uri,
        width: manipResult.width,
        height: manipResult.height,
      };
      setMedia(updatedMedia);
    } catch (error) {
      console.error('Error rotating image:', error);
      Alert.alert('Error', 'Failed to rotate image. Please try again.');
    }
  };

  const flipImageHorizontal = async () => {
    if (selectedMediaIndex === null) return;

    try {
      const manipResult = await manipulateAsync(
        media[selectedMediaIndex].uri,
        [{ flip: FlipType.Horizontal }],
        { compress: 1, format: SaveFormat.PNG }
      );

      const updatedMedia = [...media];
      updatedMedia[selectedMediaIndex] = {
        ...updatedMedia[selectedMediaIndex],
        uri: manipResult.uri,
      };
      setMedia(updatedMedia);
    } catch (error) {
      console.error('Error flipping image:', error);
      Alert.alert('Error', 'Failed to flip image. Please try again.');
    }
  };

  const flipImageVertical = async () => {
    if (selectedMediaIndex === null) return;

    try {
      const manipResult = await manipulateAsync(
        media[selectedMediaIndex].uri,
        [{ flip: FlipType.Vertical }],
        { compress: 1, format: SaveFormat.PNG }
      );

      const updatedMedia = [...media];
      updatedMedia[selectedMediaIndex] = {
        ...updatedMedia[selectedMediaIndex],
        uri: manipResult.uri,
      };
      setMedia(updatedMedia);
    } catch (error) {
      console.error('Error flipping image:', error);
      Alert.alert('Error', 'Failed to flip image. Please try again.');
    }
  };

  const cropImage = async () => {
    if (selectedMediaIndex === null) return;

    const currentMedia = media[selectedMediaIndex];
    const width = currentMedia.width || 1000;
    const height = currentMedia.height || 1000;

    try {
      const manipResult = await manipulateAsync(
        currentMedia.uri,
        [
          {
            crop: {
              originX: width * 0.1,
              originY: height * 0.1,
              width: width * 0.8,
              height: height * 0.8,
            },
          },
        ],
        { compress: 1, format: SaveFormat.PNG }
      );

      const updatedMedia = [...media];
      updatedMedia[selectedMediaIndex] = {
        ...updatedMedia[selectedMediaIndex],
        uri: manipResult.uri,
        width: manipResult.width,
        height: manipResult.height,
      };
      setMedia(updatedMedia);
    } catch (error) {
      console.error('Error cropping image:', error);
      Alert.alert('Error', 'Failed to crop image. Please try again.');
    }
  };

  const uploadImage = async (uri: string, index: number): Promise<string | null> => {
    try {
      console.log(`Reading image file: ${uri}`);
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${userId}/${Date.now()}_${index}.${fileExt}`;
      const contentType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;

      console.log(`Uploading image to: ${fileName}`);
      const { data, error } = await supabase.storage
        .from('post-images')
        .upload(fileName, decode(base64), {
          contentType,
          upsert: false,
        });

      if (error) {
        console.error('Error uploading image:', error);
        throw error;
      }

      console.log('Upload successful:', data);

      const { data: urlData } = supabase.storage
        .from('post-images')
        .getPublicUrl(fileName);

      console.log('Public URL:', urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error in uploadImage:', error);
      throw error;
    }
  };

  const handlePost = async () => {
    if (!content.trim() && media.length === 0 && !music) {
      Alert.alert('Empty Post', 'Please add some content, media, or music to your post.');
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'You must be logged in to create a post.');
      return;
    }

    setIsPosting(true);

    try {
      console.log('Starting post creation...');
      console.log('Content:', content);
      console.log('Media count:', media.length);
      console.log('Music:', music?.name);
      
      // Upload images to Supabase Storage
      const imageUrls: string[] = [];
      for (let i = 0; i < media.length; i++) {
        if (media[i].type === 'image') {
          console.log(`Uploading image ${i + 1}/${media.length}...`);
          try {
            const url = await uploadImage(media[i].uri, i);
            if (url) {
              imageUrls.push(url);
              console.log(`Image ${i + 1} uploaded successfully`);
            }
          } catch (uploadError) {
            console.error(`Failed to upload image ${i + 1}:`, uploadError);
            Alert.alert('Upload Error', `Failed to upload image ${i + 1}. Please try again.`);
            setIsPosting(false);
            return;
          }
        }
      }

      console.log('All images uploaded:', imageUrls);

      // Insert post into database
      console.log('Inserting post into database...');
      const postData = {
        user_id: userId,
        content: content.trim() || null,
        images: imageUrls.length > 0 ? imageUrls : null,
        music_uri: music?.uri || null,
        music_name: music?.name || null,
      };
      console.log('Post data:', postData);

      const { data, error } = await supabase
        .from('posts')
        .insert(postData)
        .select()
        .single();

      if (error) {
        console.error('Error creating post:', error);
        throw error;
      }

      console.log('Post created successfully:', data);

      if (status.isPlaying) {
        player.pause();
      }

      Alert.alert('Success', 'Post created successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error('Error in handlePost:', error);
      Alert.alert('Error', `Failed to create post: ${error.message || 'Unknown error'}. Please try again.`);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <IconSymbol
            ios_icon_name="xmark"
            android_material_icon_name="close"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity 
          onPress={handlePost} 
          style={styles.headerButton}
          disabled={isPosting}
        >
          {isPosting ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={styles.postButton}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TextInput
          style={styles.textInput}
          placeholder="What's happening in your business?"
          placeholderTextColor={colors.textSecondary}
          multiline
          value={content}
          onChangeText={setContent}
          maxLength={500}
          editable={!isPosting}
        />

        {media.length > 0 && (
          <View style={styles.mediaContainer}>
            <Text style={styles.mediaSectionTitle}>Selected Images ({media.length})</Text>
            <View style={styles.mediaGrid}>
              {media.map((item, index) => (
                <View key={index} style={styles.mediaItem}>
                  <TouchableOpacity onPress={() => editImage(index)} activeOpacity={0.8}>
                    <Image 
                      source={{ uri: item.uri }} 
                      style={styles.mediaImage}
                      resizeMode="cover"
                    />
                    {item.type === 'video' && (
                      <View style={styles.videoOverlay}>
                        <IconSymbol
                          ios_icon_name="play.circle.fill"
                          android_material_icon_name="play_circle"
                          size={40}
                          color="white"
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeMedia(index)}
                  >
                    <IconSymbol
                      ios_icon_name="xmark.circle.fill"
                      android_material_icon_name="cancel"
                      size={24}
                      color={colors.error}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {music && (
          <View style={styles.musicContainer}>
            <View style={styles.musicHeader}>
              <View style={styles.musicIconContainer}>
                <IconSymbol
                  ios_icon_name="music.note"
                  android_material_icon_name="music_note"
                  size={24}
                  color={colors.primary}
                />
              </View>
              <View style={styles.musicInfo}>
                <Text style={styles.musicName} numberOfLines={1}>
                  {music.name}
                </Text>
                {status.duration > 0 && (
                  <Text style={styles.musicDuration}>
                    {formatTime(status.currentTime)} / {formatTime(status.duration)}
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={removeMusic} style={styles.musicRemoveButton}>
                <IconSymbol
                  ios_icon_name="xmark.circle.fill"
                  android_material_icon_name="cancel"
                  size={24}
                  color={colors.error}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.musicControls}>
              <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
                <IconSymbol
                  ios_icon_name={status.isPlaying ? 'pause.circle.fill' : 'play.circle.fill'}
                  android_material_icon_name={status.isPlaying ? 'pause_circle' : 'play_circle'}
                  size={48}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
            {status.duration > 0 && (
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${(status.currentTime / status.duration) * 100}%` },
                  ]}
                />
              </View>
            )}
          </View>
        )}

        {selectedMediaIndex !== null && media[selectedMediaIndex].type === 'image' && (
          <View style={styles.editingTools}>
            <Text style={styles.editingTitle}>Edit Image</Text>
            <View style={styles.editingButtons}>
              <TouchableOpacity style={styles.editButton} onPress={rotateImage}>
                <IconSymbol
                  ios_icon_name="rotate.right"
                  android_material_icon_name="rotate_right"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.editButtonText}>Rotate</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.editButton} onPress={flipImageHorizontal}>
                <IconSymbol
                  ios_icon_name="arrow.left.and.right"
                  android_material_icon_name="flip"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.editButtonText}>Flip H</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.editButton} onPress={flipImageVertical}>
                <IconSymbol
                  ios_icon_name="arrow.up.and.down"
                  android_material_icon_name="flip"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.editButtonText}>Flip V</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.editButton} onPress={cropImage}>
                <IconSymbol
                  ios_icon_name="crop"
                  android_material_icon_name="crop"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.editButtonText}>Crop</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.doneEditingButton}
              onPress={() => setSelectedMediaIndex(null)}
            >
              <Text style={styles.doneEditingText}>Done Editing</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={pickMedia}
            disabled={isPosting}
          >
            <IconSymbol
              ios_icon_name="photo.on.rectangle"
              android_material_icon_name="photo_library"
              size={28}
              color={colors.primary}
            />
            <Text style={styles.actionText}>Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={takePhoto}
            disabled={isPosting}
          >
            <IconSymbol
              ios_icon_name="camera.fill"
              android_material_icon_name="camera_alt"
              size={28}
              color={colors.primary}
            />
            <Text style={styles.actionText}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={pickMusic}
            disabled={isPosting}
          >
            <IconSymbol
              ios_icon_name="music.note"
              android_material_icon_name="music_note"
              size={28}
              color={colors.primary}
            />
            <Text style={styles.actionText}>Music</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.characterCount}>{content.length}/500</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? 48 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerButton: {
    padding: 8,
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  postButton: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  content: {
    flex: 1,
  },
  textInput: {
    fontSize: 16,
    color: colors.text,
    padding: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  mediaContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  mediaSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mediaItem: {
    position: 'relative',
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  musicContainer: {
    backgroundColor: colors.cardBackground,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  musicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  musicIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  musicInfo: {
    flex: 1,
  },
  musicName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  musicDuration: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  musicRemoveButton: {
    padding: 4,
  },
  musicControls: {
    alignItems: 'center',
    marginBottom: 8,
  },
  playButton: {
    padding: 8,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  editingTools: {
    backgroundColor: colors.cardBackground,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  editingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  editingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  editButton: {
    alignItems: 'center',
    padding: 8,
  },
  editButtonText: {
    fontSize: 12,
    color: colors.text,
    marginTop: 4,
  },
  doneEditingButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneEditingText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBackground,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  characterCount: {
    textAlign: 'right',
    paddingHorizontal: 16,
    paddingBottom: 120,
    fontSize: 12,
    color: colors.textSecondary,
  },
});
